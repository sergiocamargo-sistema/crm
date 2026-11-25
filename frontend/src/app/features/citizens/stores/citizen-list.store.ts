import { computed, signal } from '@angular/core';
import {
  CITIZEN_LIST_FACETS,
  type CitizenListQuery,
  type CitizenListResult,
} from '../models/citizen-list';

export const initialQuery = (): CitizenListQuery => ({
  query: '',
  neighborhoods: [],
  cabinetRatings: [],
  includedCategories: [],
  excludedCategories: [],
  categoryMatch: 'all',
  includedDepartmentIds: [],
  excludedDepartmentIds: [],
  ageRanges: [],
  birthdayDays: [],
  birthdayMonths: [],
  requestStatuses: [],
  order: 'name-asc',
});

export class CitizenListStore {
  readonly model = signal<CitizenListQuery>(initialQuery());
  private readonly response = signal<CitizenListResult | null>(null);
  private readonly appliedQuery = signal<CitizenListQuery | null>(null);
  private readonly pending = signal(true);
  readonly error = signal<string | null>(null);
  readonly loading = computed(() => this.pending() || this.appliedQuery() !== this.model());
  readonly results = computed(() => this.response()?.items ?? []);
  readonly total = computed(() => this.response()?.total ?? 0);
  readonly facetChoices = computed(() => this.response()?.facetChoices);
  readonly categories = computed(() => this.response()?.categories ?? []);
  readonly categoryChoices = computed(() =>
    this.categories().map((name) => ({ value: name, label: name })),
  );
  readonly departmentChoices = computed(() =>
    (this.response()?.departments ?? []).map(({ id, label }) => ({ value: id, label })),
  );
  readonly selectionMode = signal(false);
  readonly selection = signal<Record<string, boolean>>({});
  readonly selectedIds = computed(() =>
    Object.entries(this.selection())
      .filter(([, selected]) => selected)
      .map(([id]) => id),
  );
  readonly resultIds = computed(() =>
    this.loading() || this.error() ? [] : this.results().map((person) => person.id),
  );
  readonly selectedOutsideResultsCount = computed(() => {
    const ids = new Set(this.resultIds());
    return this.selectedIds().filter((id) => !ids.has(id)).length;
  });
  readonly activeFilterCount = computed(() => {
    const model = this.model();
    return (
      CITIZEN_LIST_FACETS.reduce((count, facet) => count + model[facet].length, 0) +
      model.includedCategories.length +
      model.excludedCategories.length +
      model.includedDepartmentIds.length +
      model.excludedDepartmentIds.length
    );
  });
  readonly hasCriteria = computed(
    () => !!this.model().query.trim() || this.activeFilterCount() > 0,
  );

  startLoading(): void {
    this.pending.set(true);
    this.error.set(null);
  }

  receiveResult(result: CitizenListResult, query: CitizenListQuery): void {
    this.selection.update((selected) => ({
      ...Object.fromEntries(result.items.map(({ id }) => [id, false])),
      ...selected,
    }));
    this.response.set(result);
    this.appliedQuery.set(query);
    this.pending.set(false);
  }

  fail(query: CitizenListQuery): void {
    this.response.update((response) => (response ? { ...response, items: [] } : null));
    this.appliedQuery.set(query);
    this.pending.set(false);
    this.error.set('Não foi possível carregar os munícipes. Tente novamente.');
  }
}
