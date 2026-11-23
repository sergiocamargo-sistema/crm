import { computed, type Signal, type WritableSignal } from '@angular/core';
import { departmentOptions, type DepartmentOption } from '../models/department-options';
import type { Department } from '../models/request-detail';

export class DepartmentManagementStore {
  readonly options = computed(() => departmentOptions(this.departments()));

  constructor(
    readonly departments: Signal<readonly Department[]>,
    readonly results: Signal<readonly DepartmentOption[]>,
    readonly search: WritableSignal<{ text: string }>,
  ) {}
}
