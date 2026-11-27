import { TestBed } from '@angular/core/testing';
import { ApiClient } from './api-client';
import { CachedCitizenSearch } from './citizen-search-cache';
import { SessionContext } from './session-context';
import type { SearchCachePage } from '../../domain/contracts/backend-api';

it('mantém busca em memória com IndexedDB indisponível e descarta os registros ao sair', async () => {
  const record = {
    id: 'person-test',
    name: 'Pessoa de teste',
    initials: 'PT',
    neighborhood: 'Centro',
    phone: '11999990000',
    whatsappUrl: '',
    socialLinks: [],
    searchText: 'pessoa de teste centro 11999990000',
  };
  const page: SearchCachePage = {
    epoch: 'search-v2:test',
    revision: 1,
    reset: true,
    records: [record],
    removedIds: [],
    nextPage: null,
  };
  const call = vi.fn().mockResolvedValue(page);
  TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: { call } }] });
  const context = TestBed.inject(SessionContext);
  const repository = TestBed.inject(CachedCitizenSearch);
  expect(await repository.search('pessoa')).toEqual([]);
  expect(call).not.toHaveBeenCalled();
  const actor = { id: 'user-test', name: 'Equipe', initials: 'ET', handle: 'equipe' };
  context.set({ actor, users: [actor] });
  TestBed.tick();
  const people = await repository.search('pessoa');
  expect(people).toHaveLength(1);
  expect(people[0].id).toBe(record.id);
  expect(people[0]).not.toHaveProperty('searchText');
  context.set(null);
  TestBed.tick();
  expect(await repository.search('pessoa')).toEqual([]);
});
