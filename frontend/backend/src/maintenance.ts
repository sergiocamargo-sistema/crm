import { onSchedule } from 'firebase-functions/v2/scheduler';
import type { DocumentDatabase } from './ports/document-database';
import type { FileStorage } from './ports/file-storage';
import type { StoredFile } from './application/files';

/** Limpa metadados temporários; não exclui cadastros, histórico de tarefas ou arquivos vinculados. */
export function maintenance(database: DocumentDatabase, files: FileStorage) {
  return onSchedule(
    {
      schedule: 'every day 03:00',
      timeZone: 'America/Sao_Paulo',
      region: 'southamerica-east1',
      memory: '256MiB',
      serviceAccount: 'crm-backend@sergio-6ceff.iam.gserviceaccount.com',
      maxInstances: 1,
      timeoutSeconds: 300,
      retryCount: 2,
    },
    async () => {
      const now = new Date().toISOString();
      for (const collection of ['crmJournal', 'crmReceipts']) {
        for (let batch = 0; batch < 20; batch++) {
          const expired = await database.find(collection, {
            filters: [{ field: 'expiresAt', operator: 'at-most', value: now }],
            limit: 200,
          });
          if (!expired.length) break;
          await database.atomic(async (transaction) => {
            expired.forEach(({ id }) => transaction.remove(collection, id));
          });
        }
      }
      // Fazer a seleção e a exclusão do cadastro em transação impede disputar com um vínculo novo.
      const candidates = await database.find<StoredFile>('crmFiles', {
        filters: [
          { field: 'attached', operator: 'equals', value: false },
          {
            field: 'createdAt',
            operator: 'at-most',
            value: new Date(Date.now() - 7 * 86_400_000).toISOString(),
          },
        ],
        limit: 200,
      });
      for (const candidate of candidates) {
        const path = await database.atomic(async (transaction) => {
          const file = await transaction.get<StoredFile>('crmFiles', candidate.id);
          if (!file || file.attached) return null;
          transaction.put('crmFiles', candidate.id, { ...file, deleting: true });
          return file.path;
        });
        if (path) {
          await files.remove(path);
          await database.atomic(async (transaction) => {
            const file = await transaction.get<StoredFile>('crmFiles', candidate.id);
            if (file?.deleting && !file.attached) transaction.remove('crmFiles', candidate.id);
          });
        }
      }
    },
  );
}
