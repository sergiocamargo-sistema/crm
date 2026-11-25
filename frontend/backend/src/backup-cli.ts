import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createWriteStream, createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { createGzip } from 'node:zlib';
import { resolve } from 'node:path';
import { createDatabase } from './config/persistence';
import { exportBackup, backupFiles, readBackup } from './application/backup';

/** Necessita credencial administrativa local/ADC. Nunca colocar chaves em argumentos ou no Git. */
async function main(): Promise<void> {
  const command = process.argv[2];
  const destination = process.argv[3];
  const keyText = process.env['CRM_BACKUP_KEY'];
  if (!destination || !keyText || !/^[a-fA-F0-9]{64}$/u.test(keyText))
    throw new Error('Informe destino e CRM_BACKUP_KEY (chave hexadecimal de 32 bytes).');
  const key = Buffer.from(keyText, 'hex');
  if (command === 'export') {
    const projectId = process.env['GOOGLE_CLOUD_PROJECT'];
    const bucket = process.env['CRM_STORAGE_BUCKET'];
    if (!projectId || !bucket) throw new Error('Defina GOOGLE_CLOUD_PROJECT e CRM_STORAGE_BUCKET.');
    initializeApp({ projectId, storageBucket: bucket });
    const database = createDatabase();
    const backup = await exportBackup(database);
    const directory = resolve(destination);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const manifest: { path: string; sha256: string }[] = [];
    const encrypt = async (name: string, stream: NodeJS.ReadableStream): Promise<void> => {
      const nonce = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, nonce);
      const output = resolve(directory, `${name}.enc`);
      await writeFile(output, Buffer.concat([Buffer.from('GCRM1'), nonce]), {
        mode: 0o600,
        flag: 'wx',
      });
      const hash = createHash('sha256');
      await pipeline(stream, createGzip(), cipher, createWriteStream(output, { flags: 'a' }));
      const { appendFile } = await import('node:fs/promises');
      await appendFile(output, cipher.getAuthTag());
      for await (const chunk of createReadStream(output)) hash.update(chunk);
      manifest.push({ path: `${name}.enc`, sha256: hash.digest('hex') });
    };
    const { Readable } = await import('node:stream');
    await encrypt('database.json.gz', Readable.from([JSON.stringify(backup)]));
    await mkdir(resolve(directory, 'files'), { mode: 0o700 });
    for (const file of backupFiles(backup)) {
      if (!/^crm\/[a-f0-9-]{36}$/u.test(file.path))
        throw new Error('Caminho de arquivo inválido no banco.');
      await encrypt(
        `files/${file.path.slice(4)}.gz`,
        getStorage().bucket().file(file.path).createReadStream(),
      );
    }
    await writeFile(
      resolve(directory, 'manifest.json'),
      JSON.stringify({ version: 1, createdAt: backup.createdAt, files: manifest }, null, 2),
      { mode: 0o600, flag: 'wx' },
    );
    console.log('Exportação concluída. Guarde a chave separada do pacote.');
  } else if (command === 'decrypt') {
    const output = process.argv[4];
    if (!output) throw new Error('Informe arquivo de saída.');
    const encrypted = await readFile(destination);
    if (encrypted.subarray(0, 5).toString() !== 'GCRM1' || encrypted.length < 33)
      throw new Error('Arquivo de backup inválido.');
    const decipher = createDecipheriv('aes-256-gcm', key, encrypted.subarray(5, 17));
    decipher.setAuthTag(encrypted.subarray(-16));
    const { Readable } = await import('node:stream');
    const { createGunzip } = await import('node:zlib');
    await pipeline(
      Readable.from([encrypted.subarray(17, -16)]),
      decipher,
      createGunzip(),
      createWriteStream(output, { flags: 'wx', mode: 0o600 }),
    );
    // Para o banco, validar formato e integridade sem gravar em nenhum ambiente.
    if (destination.endsWith('database.json.gz.enc'))
      readBackup(JSON.parse(await readFile(output, 'utf8')));
    console.log('Arquivo descriptografado. Nenhum banco foi alterado.');
  } else throw new Error('Use export DIRETORIO ou decrypt ARQUIVO SAIDA.');
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha ao executar backup.');
  process.exitCode = 1;
});
