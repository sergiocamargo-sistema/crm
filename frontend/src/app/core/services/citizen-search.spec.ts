import { TestBed } from '@angular/core/testing';
import { CITIZEN_SEARCH_REPOSITORY } from '../repositories/citizen-search-repository';
import { SessionContext } from '../backend/session-context';
import type { CitizenSearchResult } from '../models/citizen-summary';
import { CitizenSearchService } from './citizen-search';

it('descarta respostas anteriores e mantém seletores independentes', async () => {
  const pending = new Map<string, (value: readonly CitizenSearchResult[]) => void>();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: CITIZEN_SEARCH_REPOSITORY,
        useValue: {
          search: (query: string) =>
            new Promise<readonly CitizenSearchResult[]>((resolve) => pending.set(query, resolve)),
        },
      },
    ],
  });
  const actor = { id: 'test-user', name: 'Equipe de teste', handle: 'teste', initials: 'ET' };
  TestBed.inject(SessionContext).set({ actor, users: [actor] });
  const service = TestBed.inject(CitizenSearchService);
  const picker = TestBed.runInInjectionContext(() => service.createStore());
  service.model.set({ query: 'anterior' });
  TestBed.tick();
  service.model.set({ query: 'atual' });
  TestBed.tick();
  const person = {
    id: 'test-citizen',
    name: 'Pessoa atual',
    initials: 'PA',
    neighborhood: '',
    phone: '',
    whatsappUrl: '',
    socialLinks: [],
  };
  pending.get('atual')!([person]);
  await Promise.resolve();
  TestBed.tick();
  pending.get('anterior')!([]);
  await Promise.resolve();
  TestBed.tick();
  expect(service.results()).toEqual([person]);
  expect(picker.results()).toEqual([]);
  expect(picker.model().query).toBe('');
});
