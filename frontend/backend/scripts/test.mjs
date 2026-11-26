import { build } from 'esbuild';
import { readdir, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
const files = (await readdir('tests')).filter((name) => name.endsWith('.test.ts'));
if (!files.length) throw new Error('Nenhum teste de backend encontrado.');
await mkdir('.tests', { recursive: true });
await build({
  entryPoints: files.map((file) => `tests/${file}`),
  outdir: '.tests',
  outExtension: { '.js': '.cjs' },
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  bundle: true,
  packages: 'external',
});
for (const file of files) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [`.tests/${file.replace(/\.ts$/u, '.cjs')}`], {
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (status) => resolve(status ?? 1));
  });
  if (code !== 0) {
    process.exitCode = code;
    break;
  }
}
