import { computed, inject, Service, type Signal } from '@angular/core';
import { ReadStore } from '../../../core/stores/read-store';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import { departmentOptions } from '../models/department-options';
import type { RequestEditorDraft } from '../models/request-detail';

@Service()
export class RequestEditorService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  readonly departments = new ReadStore(
    computed(() => departmentOptions(this.repository.listDepartments())),
  );
  readonly patterns = new ReadStore(computed(() => this.repository.listRequestPatterns()));

  observeRequest(id: Signal<string | undefined>) {
    return new ReadStore(
      computed(() => {
        const requestId = id();
        return requestId ? this.repository.loadRequestWorkspace(requestId) : null;
      }),
    );
  }

  observeCitizen(id: Signal<string>) {
    return new ReadStore(computed(() => (id() ? this.repository.loadDetail(id()) : null)));
  }

  save(id: string | null, draft: RequestEditorDraft): string {
    return this.repository.saveRequest(id, draft);
  }
}
