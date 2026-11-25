import { computed, signal, type Signal } from '@angular/core';
import type { CitizenSearchResult } from '../models/citizen-summary';

export class CitizenSearchStore {
  readonly hasQuery = computed(() => this.model().query.trim().length >= 2);
  readonly results = computed(() => this.matches().slice(0, 6));

  constructor(
    readonly matches: Signal<readonly CitizenSearchResult[]>,
    readonly model = signal({ query: '' }),
  ) {}
}
