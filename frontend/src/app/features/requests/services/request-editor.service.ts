import { computed, inject, Service, type Signal } from '@angular/core';
import { RemoteReadStore } from '../../../core/stores/read-store';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import { departmentOptions } from '../models/department-options';
import type { RequestEditorDraft } from '../models/request-detail';

@Service()
export class RequestEditorService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  readonly departments = new RemoteReadStore(
    async () => departmentOptions(await this.repository.listDepartments()),
    [],
  );
  readonly patterns = new RemoteReadStore(
    async () => await this.repository.listRequestPatterns(),
    [],
  );

  observeRequest(id: Signal<string | undefined>) {
    return new RemoteReadStore(
      () => {
        const requestId = id();
        return requestId ? this.repository.loadRequestWorkspace(requestId) : null;
      },
      null,
      id,
    );
  }

  observeCitizen(id: Signal<string>) {
    return new RemoteReadStore(() => (id() ? this.repository.loadDetail(id()) : null), null, id);
  }

  async save(id: string | null, draft: RequestEditorDraft): Promise<string> {
    return await this.repository.saveRequest(id, draft);
  }
}
