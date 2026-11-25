export interface DatabaseDocument<T = unknown> {
  readonly id: string;
  readonly value: T;
}

export interface DatabaseQuery {
  readonly filters?: readonly {
    readonly field: string;
    readonly operator: 'equals' | 'greater-than' | 'at-most';
    readonly value: string | number | boolean | null;
  }[];
  readonly order?: { readonly field: string; readonly direction: 'ascending' | 'descending' };
  readonly limit?: number;
}

export interface DatabaseReader {
  get<T>(collection: string, id: string): Promise<T | null>;
  find<T>(collection: string, query?: DatabaseQuery): Promise<readonly DatabaseDocument<T>[]>;
}

export interface DatabaseTransaction extends DatabaseReader {
  put<T>(collection: string, id: string, value: T): void;
  remove(collection: string, id: string): void;
}

/** Nenhum contrato fora do adaptador conhece SDK, snapshots ou timestamps do banco. */
export interface DocumentDatabase extends DatabaseReader {
  atomic<T>(action: (transaction: DatabaseTransaction) => Promise<T>): Promise<T>;
}
