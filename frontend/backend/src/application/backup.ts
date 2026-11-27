import { createHash } from 'node:crypto';
import type { DocumentDatabase } from '../ports/document-database';
import { ApplicationError } from './error';
import type { DatabaseDocument } from '../ports/document-database';
import type { StoredFile } from './files';

const collections = [
  'crmMeta',
  'crmRecords',
  'teamAccess',
  'crmNotifications',
  'crmFiles',
] as const;
export interface PortableBackup {
  readonly format: 'gabinete-crm';
  readonly version: 1;
  readonly createdAt: string;
  readonly collections: Readonly<Record<string, readonly DatabaseDocument[]>>;
  readonly sha256: string;
}
/** Exportação administrativa: não exposta à aplicação ou aos membros do gabinete. */
export async function exportBackup(database: DocumentDatabase): Promise<PortableBackup> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const before = await database.get('crmMeta', 'head');
    const content: Record<string, readonly DatabaseDocument[]> = {};
    for (const name of [...collections, 'crmSecurityAudit'])
      content[name] = await database.find(name);
    const after = await database.get('crmMeta', 'head');
    if (JSON.stringify(before) !== JSON.stringify(after)) continue;
    const envelope = {
      format: 'gabinete-crm' as const,
      version: 1 as const,
      createdAt: new Date().toISOString(),
      collections: content,
    };
    return {
      ...envelope,
      sha256: createHash('sha256').update(JSON.stringify(envelope)).digest('hex'),
    };
  }
  throw new ApplicationError(
    409,
    'BACKUP_BUSY',
    'Muitas alterações durante a exportação. Faça a cópia durante uma janela sem gravações.',
  );
}
export function readBackup(data: unknown): PortableBackup {
  if (!data || typeof data !== 'object') throw new Error('Pacote de backup inválido.');
  const backup = data as PortableBackup;
  if (
    backup.format !== 'gabinete-crm' ||
    backup.version !== 1 ||
    !backup.collections ||
    collections.some((name) => !Array.isArray(backup.collections[name]))
  )
    throw new Error('Versão ou estrutura do backup inválida.');
  const { sha256, ...envelope } = backup;
  if (sha256 !== createHash('sha256').update(JSON.stringify(envelope)).digest('hex'))
    throw new Error('A integridade do backup não confere.');
  return backup;
}
export function backupFiles(backup: PortableBackup): readonly StoredFile[] {
  return (backup.collections['crmFiles'] ?? [])
    .map(({ value }) => value as StoredFile)
    .filter((file) => file.attached);
}
