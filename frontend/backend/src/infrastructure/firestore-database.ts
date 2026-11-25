import {
  getFirestore,
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

/** A implementação do contrato de banco; nenhuma regra de negócio vive aqui. */
export class FirestoreDatabase implements DocumentDatabase {
  constructor(private readonly database: Firestore = getFirestore()) {}

  async get<T>(collection: string, id: string): Promise<T | null> {
    const snapshot = await this.database.collection(collection).doc(id).get();
    return snapshot.exists ? (snapshot.data() as T) : null;
  }

  async find<T>(
    collection: string,
    options: DatabaseQuery = {},
  ): Promise<readonly DatabaseDocument<T>[]> {
    const snapshot = await this.query(collection, options).get();
    return snapshot.docs.map((document) => ({ id: document.id, value: document.data() as T }));
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
          return snapshot.exists ? (snapshot.data() as V) : null;
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
            value: document.data() as V,
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
      query = query.where(filter.field, operators[filter.operator], filter.value);
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
    else
      transaction.set(
        reference,
        JSON.parse(JSON.stringify(entry.value)) as Record<string, unknown>,
      );
  }
}
