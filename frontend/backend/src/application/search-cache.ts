import type { SearchCachePage } from '../../../src/app/domain/contracts/backend-api';
import type { WorkspaceSnapshot } from './workspace-repository';
import type { DocumentDatabase } from '../ports/document-database';
import { ApplicationError } from './error';

export const matchesSearch = (text: string, query: string): boolean => {
  const value = normalizeSearch(query.trim());
  if (value.length < 2) return false;
  const digits = value.replace(/\D/gu, '');
  return (
    value.split(/\s+/u).every((term) => text.includes(term)) ||
    (/^[\d\s()+.-]+$/u.test(value) && digits.length >= 2 && text.includes(digits))
  );
};

export const normalizeSearch = (value: string): string =>
  value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
interface Cursor {
  epoch: string;
  revision: number;
  since: number;
  reset: boolean;
  offset: number;
}

export class SearchCache {
  constructor(private readonly database: DocumentDatabase) {}
  async sync(
    snapshot: WorkspaceSnapshot,
    epoch: string | null,
    revision: number,
    page: string | null,
  ): Promise<SearchCachePage> {
    const searchEpoch = `search-v2:${snapshot.epoch}`;
    let cursor: Cursor = {
      epoch: searchEpoch,
      revision: snapshot.revision,
      since: revision,
      reset:
        epoch !== searchEpoch ||
        revision < 0 ||
        revision > snapshot.revision ||
        snapshot.revision - revision > 100,
      offset: 0,
    };
    if (page) {
      try {
        const data = JSON.parse(Buffer.from(page, 'base64url').toString()) as Cursor;
        if (
          typeof data.epoch !== 'string' ||
          !Number.isSafeInteger(data.revision) ||
          !Number.isSafeInteger(data.since) ||
          !Number.isSafeInteger(data.offset) ||
          data.offset < 0 ||
          data.offset > 1_000_000 ||
          typeof data.reset !== 'boolean'
        )
          throw new Error();
        if (
          data.epoch === searchEpoch &&
          data.revision === snapshot.revision &&
          data.since === revision
        )
          cursor = data;
        else cursor.reset = true;
      } catch {
        throw new ApplicationError(
          400,
          'INVALID_CURSOR',
          'A continuação da sincronização é inválida.',
        );
      }
    }
    const changed = new Set<string>();
    if (!cursor.reset && revision < snapshot.revision) {
      const events = await this.database.find<{
        revision: number;
        citizensChanged: readonly string[];
      }>('crmJournal', {
        filters: [{ field: 'revision', operator: 'greater-than', value: revision }],
        order: { field: 'revision', direction: 'ascending' },
        limit: 101,
      });
      if (
        events.length !== snapshot.revision - revision ||
        events.at(-1)?.value.revision !== snapshot.revision
      ) {
        cursor.reset = true;
        cursor.offset = 0;
      } else events.forEach(({ value }) => value.citizensChanged.forEach((id) => changed.add(id)));
    }
    const citizens = snapshot.state.crm.citizens;
    const ids = cursor.reset ? citizens.map(({ id }) => id).sort() : [...changed].sort();
    const selected = ids.slice(cursor.offset, cursor.offset + 200);
    const byId = new Map(citizens.map((person) => [person.id, person]));
    const records: SearchCachePage['records'][number][] = [];
    const removedIds: string[] = [];
    for (const id of selected) {
      const person = byId.get(id);
      if (!person) {
        removedIds.push(id);
        continue;
      }
      records.push({
        id,
        name: person.name,
        initials: person.initials,
        neighborhood: person.neighborhood,
        phone: person.phone,
        whatsappUrl: person.phones.find((phone) => phone.whatsappUrl)?.whatsappUrl ?? '',
        socialLinks: person.socialLinks,
        searchText: normalizeSearch(
          [
            person.name,
            person.neighborhood,
            ...person.phones.flatMap(({ number }) => [number, number.replace(/\D/gu, '')]),
          ].join(' '),
        ),
      });
    }
    const offset = cursor.offset + selected.length;
    return {
      epoch: searchEpoch,
      revision: snapshot.revision,
      reset: cursor.reset,
      records,
      removedIds,
      nextPage:
        offset < ids.length
          ? Buffer.from(JSON.stringify({ ...cursor, offset })).toString('base64url')
          : null,
    };
  }
}
