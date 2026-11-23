import { DestroyRef, effect, inject, Service, signal, untracked } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../repositories/citizen-detail-repository';
import { currentCitizenCalendarDate } from '../models/citizen-birth-filters';
import { CitizenListStore, initialQuery } from '../stores/citizen-list.store';

@Service()
export class CitizenListService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  readonly store = new CitizenListStore();
  private readonly calendarDay = signal(currentCitizenCalendarDate());
  private readonly refresh = signal(0);
  readonly model = this.store.model;
  readonly selectionMode = this.store.selectionMode;
  readonly selection = this.store.selection;
  readonly selectedIds = this.store.selectedIds;
  readonly resultIds = this.store.resultIds;
  readonly selectedOutsideResultsCount = this.store.selectedOutsideResultsCount;
  readonly neighborhoods = this.store.neighborhoods;
  readonly categories = this.store.categories;
  readonly categoryChoices = this.store.categoryChoices;
  readonly departmentChoices = this.store.departmentChoices;
  readonly activeFilterCount = this.store.activeFilterCount;
  readonly hasCriteria = this.store.hasCriteria;
  readonly results = this.store.results;

  constructor() {
    effect((onCleanup) => {
      const query = this.model();
      this.calendarDay();
      this.refresh();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      untracked(() => this.store.startLoading());
      // O mock lê seus signals antes de resolver a Promise, mantendo as atualizações da sessão.
      const request = this.repository.loadCitizenList(query);
      void request.then(
        (result) => {
          if (active && query === this.model()) this.store.receiveResult(result, query);
        },
        () => {
          if (active && query === this.model()) this.store.fail(query);
        },
      );
    });
    // Consultar novamente na mudança de dia; o cálculo de idade pertence ao repositório.
    const timer = setInterval(() => this.calendarDay.set(currentCitizenCalendarDate()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  retry(): void {
    this.refresh.update((value) => value + 1);
  }

  clearSearch(): void {
    this.model.update((value) => ({ ...value, query: '' }));
  }
  selectResults(): void {
    if (!this.resultIds().length) return;
    if (!this.selectionMode()) {
      this.selectionMode.set(true);
      return;
    }
    this.selection.update((value) => ({
      ...value,
      ...Object.fromEntries(this.resultIds().map((id) => [id, true])),
    }));
  }
  labelRecipientIds(scope: 'selected' | 'results'): readonly string[] {
    // results contém a busca inteira; uma eventual página visual não limita a impressão.
    return [...(scope === 'selected' ? this.selectedIds() : this.resultIds())];
  }
  clearSelection(): void {
    this.selection.set(Object.fromEntries(this.results().map((person) => [person.id, false])));
    this.selectionMode.set(false);
  }
  clearFilters(): void {
    this.model.update((value) => ({ ...initialQuery(), query: value.query, order: value.order }));
  }
  addDepartmentFilter(mode: 'include' | 'exclude', id: string): void {
    if (!this.departmentChoices().some((department) => department.value === id)) return;
    this.model.update((value) => ({
      ...value,
      includedDepartmentIds:
        mode === 'include'
          ? [...new Set([...value.includedDepartmentIds, id])]
          : value.includedDepartmentIds.filter((value) => value !== id),
      excludedDepartmentIds:
        mode === 'exclude'
          ? [...new Set([...value.excludedDepartmentIds, id])]
          : value.excludedDepartmentIds.filter((value) => value !== id),
    }));
  }
  removeDepartmentFilter(mode: 'include' | 'exclude', id: string): void {
    this.model.update((value) =>
      mode === 'include'
        ? {
            ...value,
            includedDepartmentIds: value.includedDepartmentIds.filter((value) => value !== id),
          }
        : {
            ...value,
            excludedDepartmentIds: value.excludedDepartmentIds.filter((value) => value !== id),
          },
    );
  }
  addCategoryFilter(mode: 'include' | 'exclude', name: string): void {
    if (!this.categories().includes(name)) return;
    this.model.update((value) => ({
      ...value,
      includedCategories:
        mode === 'include'
          ? [...new Set([...value.includedCategories, name])]
          : value.includedCategories.filter((category) => category !== name),
      excludedCategories:
        mode === 'exclude'
          ? [...new Set([...value.excludedCategories, name])]
          : value.excludedCategories.filter((category) => category !== name),
    }));
  }
  removeCategoryFilter(mode: 'include' | 'exclude', name: string): void {
    this.model.update((value) =>
      mode === 'include'
        ? {
            ...value,
            includedCategories: value.includedCategories.filter((category) => category !== name),
          }
        : {
            ...value,
            excludedCategories: value.excludedCategories.filter((category) => category !== name),
          },
    );
  }
  reset(): void {
    this.model.set(initialQuery());
  }
}
