import { computed, type Signal, type WritableSignal } from '@angular/core';
import type { RequestListQuery, RequestListResult } from '../models/request-list';
import type { DepartmentOption } from '../models/department-options';

export class RequestListStore {
  readonly activeFilterCount = computed(() => {
    const { text, status, includedDepartmentIds, excludedDepartmentIds, order } = this.query();
    return (
      [text.trim(), status, order === 'oldest'].filter(Boolean).length +
      includedDepartmentIds.length +
      excludedDepartmentIds.length
    );
  });
  readonly departmentChoices = computed(() =>
    this.departments().map(({ id, label }) => ({ value: id, label })),
  );
  readonly results = computed(() => this.response().items);
  readonly total = computed(() => this.response().total);

  constructor(
    readonly query: WritableSignal<RequestListQuery>,
    private readonly response: Signal<RequestListResult>,
    private readonly departments: Signal<readonly DepartmentOption[]>,
  ) {}
}
