import { computed, inject, Service, type Signal } from '@angular/core';
import { CITIZEN_SEARCH_REPOSITORY } from '../repositories/citizen-search-repository';
import { CitizenSearchStore } from '../stores/citizen-search.store';
import type { CitizenSummary } from '../models/citizen-summary';

@Service()
export class CitizenSearchService {
  private readonly repository = inject(CITIZEN_SEARCH_REPOSITORY);
  readonly store = this.createStore();
  readonly model = this.store.model;
  readonly hasQuery = this.store.hasQuery;
  readonly results = this.store.results;

  createStore(excludedIds?: Signal<ReadonlySet<string>>): CitizenSearchStore {
    const store: CitizenSearchStore = new CitizenSearchStore(
      computed(() => {
        const results = this.repository.search(store.model().query);
        const excluded = excludedIds?.();
        return excluded?.size ? results.filter((citizen) => !excluded.has(citizen.id)) : results;
      }),
    );
    return store;
  }

  clear(): void {
    this.model.set({ query: '' });
  }
}
