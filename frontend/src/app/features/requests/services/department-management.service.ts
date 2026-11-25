import { RemoteReadStore } from '../../../core/stores/read-store';
import { computed, inject, Service, signal } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import type { Department, DepartmentDraft } from '../models/request-detail';
import { DepartmentManagementStore } from '../stores/department-management.store';

@Service()
export class DepartmentManagementService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly query = signal({ text: '' });
  readonly store = new DepartmentManagementStore(
    new RemoteReadStore(async () => await this.repository.listDepartments(), []).state,
    new RemoteReadStore(() => this.repository.searchDepartments(this.query().text), [], this.query)
      .state,
    this.query,
  );

  async save(id: string | null, draft: DepartmentDraft): Promise<Department> {
    return await this.repository.saveDepartment(id, draft);
  }

  async remove(id: string): Promise<void> {
    await this.repository.deleteDepartment(id);
  }
}
