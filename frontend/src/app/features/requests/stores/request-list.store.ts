import { computed, type Signal, type WritableSignal } from '@angular/core';
import type { RequestListQuery, RequestListResult } from '../models/request-list';
import type { DepartmentOption } from '../models/department-options';

export class RequestListStore {
  readonly activeFilterCount = computed(() => {
    const { text, status, departmentId, order } = this.query();
    return [text.trim(), status, departmentId, order === 'oldest'].filter(Boolean).length;
  });
  readonly results = computed(() => this.response().items);
  readonly total = computed(() => this.response().total);

  constructor(
    readonly query: WritableSignal<RequestListQuery>,
    private readonly response: Signal<RequestListResult>,
    readonly departments: Signal<readonly DepartmentOption[]>,
  ) {}
}
