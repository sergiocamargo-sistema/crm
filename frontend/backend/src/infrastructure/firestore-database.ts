import {
  getFirestore,
  Timestamp,
  type Firestore,
  type Query,
  type Transaction,
} from 'firebase-admin/firestore';
import type {
  DatabaseDocument,
  DatabaseQuery,
  DatabaseTransaction,
  DocumentDatabase,
} from '../ports/document-database';

const operators = { equals: '==', 'greater-than': '>', 'at-most': '<=' } as const;
const ttlCollections = new Set(['crmRateLimits', 'crmSecurityAudit']);

/** Datas de expiração nativas ficam restritas ao adaptador; o domínio usa ISO portátil. */
export function encodeDocument(collection: string, value: unknown): Record<string, unknown> {
  const data = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  if (ttlCollections.has(collection) && typeof data['expiresAt'] === 'string')
    data['expiresAt'] = Timestamp.fromDate(new Date(data['expiresAt']));
  return data;
}
export function decodeDocument<T>(collection: string, value: Record<string, unknown>): T {
  if (ttlCollections.has(collection) && value['expiresAt'] instanceof Timestamp)
    return { ...value, expiresAt: value['expiresAt'].toDate().toISOString() } as T;
  return value as T;
}

/** A implementação do contrato de banco; nenhuma regra de negócio vive aqui. */
export class FirestoreDatabase implements DocumentDatabase {
  constructor(private readonly database: Firestore = getFirestore()) {}

  async get<T>(collection: string, id: string): Promise<T | null> {
    const snapshot = await this.database.collection(collection).doc(id).get();
    return snapshot.exists ? decodeDocument<T>(collection, snapshot.data()!) : null;
  }

  async find<T>(
    collection: string,
    options: DatabaseQuery = {},
  ): Promise<readonly DatabaseDocument<T>[]> {
    const snapshot = await this.query(collection, options).get();
    return snapshot.docs.map((document) => ({
      id: document.id,
      value: decodeDocument<T>(collection, document.data()),
    }));
  }

  async atomic<T>(action: (transaction: DatabaseTransaction) => Promise<T>): Promise<T> {
    return this.database.runTransaction(async (transaction) => {
      // Escritas são adiadas: Firestore exige que todas as leituras precedam as escritas.
      const pending = new Map<
        string,
        { collection: string; id: string; value: unknown; deleted: boolean }
      >();
      const context: DatabaseTransaction = {
        get: async <V>(collection: string, id: string): Promise<V | null> => {
          const key = `${collection}/${id}`;
          const staged = pending.get(key);
          if (staged) return staged.deleted ? null : (staged.value as V);
          const snapshot = await transaction.get(this.database.collection(collection).doc(id));
          return snapshot.exists ? decodeDocument<V>(collection, snapshot.data()!) : null;
        },
        find: async <V>(
          collection: string,
          options: DatabaseQuery = {},
        ): Promise<readonly DatabaseDocument<V>[]> => {
          if ([...pending.values()].some((entry) => entry.collection === collection)) {
            throw new Error('As consultas de coleção devem acontecer antes de suas alterações.');
          }
          const snapshot = await transaction.get(this.query(collection, options));
          return snapshot.docs.map((document) => ({
            id: document.id,
            value: decodeDocument<V>(collection, document.data()),
          }));
        },
        put: (collection, id, value): void => {
          pending.set(`${collection}/${id}`, { collection, id, value, deleted: false });
        },
        remove: (collection, id): void => {
          pending.set(`${collection}/${id}`, { collection, id, value: null, deleted: true });
        },
      };
      const result = await action(context);
      if (pending.size > 450)
        throw new Error('Esta operação excede o limite de alterações por transação.');
      for (const entry of pending.values()) this.write(transaction, entry);
      return result;
    });
  }

  private query(collection: string, options: DatabaseQuery): Query {
    let query: Query = this.database.collection(collection);
    for (const filter of options.filters ?? [])
      query = query.where(
        filter.field,
        operators[filter.operator],
        ttlCollections.has(collection) &&
          filter.field === 'expiresAt' &&
          typeof filter.value === 'string'
          ? Timestamp.fromDate(new Date(filter.value))
          : filter.value,
      );
    if (options.order)
      query = query.orderBy(
        options.order.field,
        options.order.direction === 'ascending' ? 'asc' : 'desc',
      );
    if (options.limit !== undefined) query = query.limit(options.limit);
    return query;
  }

  private write(
    transaction: Transaction,
    entry: { collection: string; id: string; value: unknown; deleted: boolean },
  ): void {
    const reference = this.database.collection(entry.collection).doc(entry.id);
    if (entry.deleted) transaction.delete(reference);
    else transaction.set(reference, encodeDocument(entry.collection, entry.value));
  }
}
