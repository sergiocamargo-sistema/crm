import { computed, inject, Service, signal } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import {
  departmentOptions,
  updateDepartmentFilter,
  type DepartmentFilterMode,
} from '../models/department-options';
import { initialRequestListQuery } from '../models/request-list';
import { RequestListStore } from '../stores/request-list.store';

@Service()
export class RequestListService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly query = signal(initialRequestListQuery());
  readonly store = new RequestListStore(
    this.query,
    computed(() => this.repository.loadRequestList(this.query())),
    computed(() => departmentOptions(this.repository.listDepartments())),
  );

  setDepartmentFilter(mode: DepartmentFilterMode, id: string, selected: boolean): void {
    if (selected && !this.store.departmentChoices().some((department) => department.value === id))
      return;
    this.query.update((value) => ({
      ...value,
      ...updateDepartmentFilter(value, mode, id, selected),
    }));
  }

  reset(): void {
    this.query.set(initialRequestListQuery());
  }
}
