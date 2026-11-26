import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { MemoryDatabase } from '../src/infrastructure/memory-database';
import { MemoryFiles } from '../src/infrastructure/memory-files';
import { createApi, type ApiReply } from '../src/http/api';
import type { VerifiedIdentity } from '../src/ports/identity-provider';
import type { DatabaseTransaction } from '../src/ports/document-database';
import { emptyCitizenDraft } from '../../src/app/features/citizens/models/citizen-registration';

export const actor: VerifiedIdentity = {
  id: 'test-member',
  email: 'member@tests.invalid',
  name: 'Equipe de teste',
  emailVerified: true,
  provider: 'google.com',
};
export class LimitedDatabase extends MemoryDatabase {
  override atomic<T>(action: (transaction: DatabaseTransaction) => Promise<T>): Promise<T> {
    return super.atomic(async (transaction) => {
      let writes = 0;
      const count = (): void => {
        if (++writes > 450) throw new Error('Limite de escritas excedido.');
      };
      return action({
        ...transaction,
        put: (collection, id, value) => {
          count();
          transaction.put(collection, id, value);
        },
        remove: (collection, id) => {
          count();
          transaction.remove(collection, id);
        },
      });
    });
  }
}
export async function harness(database = new LimitedDatabase()) {
  await database.atomic(async (transaction) =>
    transaction.put('teamAccess', actor.id, {
      email: actor.email,
      name: actor.name,
      active: true,
      role: 'admin',
    }),
  );
  const storage = new MemoryFiles('http://127.0.0.1:4400', 'local-test-signing-key');
  const handle = createApi({
    database,
    storage,
    allowedOrigins: ['http://localhost:4300'],
    identity: {
      verify: async (token) => {
        if (token !== 'test-token') throw new Error('Token inválido.');
        return actor;
      },
    },
  });
  const action = (
    operation: string,
    args: readonly unknown[] = [],
    requestId: string = randomUUID(),
  ): Promise<ApiReply> =>
    handle({
      method: 'POST',
      path: '/v1/actions',
      headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
      body: Buffer.from(JSON.stringify({ operation, args, requestId })),
    });
  const citizen = (name: string, extra: Record<string, unknown> = {}) => ({
    requestId: randomUUID(),
    draft: { ...emptyCitizenDraft(), name, ...extra },
    photos: [],
  });
  return { database, storage, handle, action, citizen };
}
export function result<T>(reply: ApiReply): T {
  assert.equal(reply.status, 200, JSON.stringify(reply.body));
  return (reply.body as { result: T }).result;
}
