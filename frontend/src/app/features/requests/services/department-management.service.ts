import { computed, inject, Service, signal } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import type { Department, DepartmentDraft } from '../models/request-detail';
import { DepartmentManagementStore } from '../stores/department-management.store';

@Service()
export class DepartmentManagementService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly query = signal({ text: '' });
  readonly store = new DepartmentManagementStore(
    computed(() => this.repository.listDepartments()),
    computed(() => this.repository.searchDepartments(this.query().text)),
    this.query,
  );

  save(id: string | null, draft: DepartmentDraft): Department {
    return this.repository.saveDepartment(id, draft);
  }

  remove(id: string): void {
    this.repository.deleteDepartment(id);
  }
}
