import type { DocumentDatabase } from '../ports/document-database';
import { FirestoreDatabase } from '../infrastructure/firestore-database';

/** Ponto único de seleção do banco. Repositórios dependem somente de DocumentDatabase. */
export function createDatabase(): DocumentDatabase {
  return new FirestoreDatabase();
}
