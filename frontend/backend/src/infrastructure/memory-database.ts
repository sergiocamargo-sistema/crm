import type {
  DatabaseDocument,
  DatabaseQuery,
  DatabaseTransaction,
  DocumentDatabase,
} from '../ports/document-database';

/** Adaptador alternativo para desenvolvimento, sem semântica específica de Firestore. */
export class MemoryDatabase implements DocumentDatabase {
  private records = new Map<string, Map<string, unknown>>();
  private pending: Promise<unknown> = Promise.resolve();

  async get<T>(collection: string, id: string): Promise<T | null> {
    const value = this.records.get(collection)?.get(id);
    return value === undefined ? null : (structuredClone(value) as T);
  }

  async find<T>(
    collection: string,
    options: DatabaseQuery = {},
  ): Promise<readonly DatabaseDocument<T>[]> {
    let rows = [...(this.records.get(collection) ?? new Map()).entries()].map(([id, value]) => ({
      id,
      value: structuredClone(value) as T,
    }));
    const field = (value: unknown, path: string): unknown =>
      path
        .split('.')
        .reduce<unknown>(
          (node, key) =>
            typeof node === 'object' && node !== null
              ? (Reflect.get(node, key) as unknown)
              : undefined,
          value,
        );
    for (const filter of options.filters ?? [])
      rows = rows.filter(({ value }) => {
        const actual = field(value, filter.field);
        if (filter.operator === 'equals') return actual === filter.value;
        if (typeof actual === 'number' && typeof filter.value === 'number')
          return filter.operator === 'greater-than'
            ? actual > filter.value
            : actual <= filter.value;
        if (typeof actual === 'string' && typeof filter.value === 'string')
          return filter.operator === 'greater-than'
            ? actual > filter.value
            : actual <= filter.value;
        return false;
      });
    if (options.order) {
      const order = options.order;
      rows.sort((a, b) => {
        const first = field(a.value, order.field),
          second = field(b.value, order.field);
        const result =
          first === second
            ? 0
            : typeof first === 'number' && typeof second === 'number'
              ? first - second
              : String(first).localeCompare(String(second));
        return order.direction === 'ascending' ? result : -result;
      });
    }
    return options.limit === undefined ? rows : rows.slice(0, options.limit);
  }

  atomic<T>(action: (transaction: DatabaseTransaction) => Promise<T>): Promise<T> {
    const run = this.pending.then(async () => {
      const draft = new MemoryDatabase();
      draft.records = structuredClone(this.records);
      const transaction: DatabaseTransaction = {
        get: draft.get.bind(draft),
        find: draft.find.bind(draft),
        put: (collection, id, value): void => {
          if (!draft.records.has(collection)) draft.records.set(collection, new Map());
          draft.records.get(collection)!.set(id, structuredClone(value));
        },
        remove: (collection, id): void => {
          draft.records.get(collection)?.delete(id);
        },
      };
      const result = await action(transaction);
      this.records = draft.records;
      return result;
    });
    this.pending = run.catch(() => undefined);
    return run;
  }
}
