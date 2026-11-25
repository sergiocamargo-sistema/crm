import { DataConnection } from '../../../core/backend/data-connection';
import { SessionContext } from '../../../core/backend/session-context';
import { DestroyRef, effect, inject, Service, signal, untracked } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../repositories/citizen-detail-repository';
import { currentCitizenCalendarDate } from '../models/citizen-birth-filters';
import { CitizenListStore, initialQuery } from '../stores/citizen-list.store';
import type { CitizenListFacet, CitizenListQuery } from '../models/citizen-list';
import {
  updateDepartmentFilter,
  type DepartmentFilterMode,
} from '../../requests/models/department-options';

@Service()
export class CitizenListService {
  private readonly connection = inject(DataConnection);
  private readonly session = inject(SessionContext);
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
  readonly facetChoices = this.store.facetChoices;
  readonly categories = this.store.categories;
  readonly categoryChoices = this.store.categoryChoices;
  readonly departmentChoices = this.store.departmentChoices;
  readonly activeFilterCount = this.store.activeFilterCount;
  readonly hasCriteria = this.store.hasCriteria;
  readonly results = this.store.results;

  constructor() {
    effect((onCleanup) => {
      this.connection.revision();
      if (!this.session.profile()) {
        this.store.startLoading();
        this.selection.set({});
        return;
      }
      const query = this.model();
      this.calendarDay();
      this.refresh();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      untracked(() => this.store.startLoading());
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
  setFacet(facet: CitizenListFacet, value: string, selected: boolean): void {
    if (selected && !this.facetChoices()?.[facet].some((option) => option.value === value)) return;
    this.model.update((query) => {
      const current = query[facet];
      if (current.includes(value) === selected) return query;
      return {
        ...query,
        [facet]: selected ? [...current, value] : current.filter((item) => item !== value),
      };
    });
  }
  setOrder(order: CitizenListQuery['order']): void {
    this.model.update((query) => ({ ...query, order }));
  }
  setCategoryMatch(categoryMatch: CitizenListQuery['categoryMatch']): void {
    this.model.update((query) => ({ ...query, categoryMatch }));
  }
  addDepartmentFilter(mode: DepartmentFilterMode, id: string): void {
    if (!this.departmentChoices().some((department) => department.value === id)) return;
    this.model.update((value) => ({
      ...value,
      ...updateDepartmentFilter(value, mode, id, true),
    }));
  }
  removeDepartmentFilter(mode: DepartmentFilterMode, id: string): void {
    this.model.update((value) => ({ ...value, ...updateDepartmentFilter(value, mode, id, false) }));
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
