import { computed, inject, Service, type Signal } from '@angular/core';
import { CITIZEN_SEARCH_REPOSITORY } from '../repositories/citizen-search-repository';
import { RemoteReadStore } from '../stores/read-store';
import type { CitizenSearchResult } from '../models/citizen-summary';
import { signal } from '@angular/core';
import { CitizenSearchStore } from '../stores/citizen-search.store';

@Service()
export class CitizenSearchService {
  private readonly repository = inject(CITIZEN_SEARCH_REPOSITORY);
  readonly store = this.createStore();
  readonly model = this.store.model;
  readonly hasQuery = this.store.hasQuery;
  readonly results = this.store.results;

  createStore(excludedIds?: Signal<ReadonlySet<string>>): CitizenSearchStore {
    const model = signal({ query: '' });
    const response = new RemoteReadStore<readonly CitizenSearchResult[]>(
      () => this.repository.search(model().query),
      [],
      () => model().query,
    );
    const store = new CitizenSearchStore(
      computed(() => {
        const results = response.state();
        const excluded = excludedIds?.();
        return excluded?.size ? results.filter((citizen) => !excluded.has(citizen.id)) : results;
      }),
      model,
    );
    return store;
  }

  clear(): void {
    this.model.set({ query: '' });
  }
}
