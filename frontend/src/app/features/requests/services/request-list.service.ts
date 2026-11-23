import { computed, inject, Service, signal } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import { departmentOptions } from '../models/department-options';
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

  reset(): void {
    this.query.set(initialRequestListQuery());
  }
}
