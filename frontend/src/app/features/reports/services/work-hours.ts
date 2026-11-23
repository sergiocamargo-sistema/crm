import { computed, inject, Service, type Signal } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import { TeamCollaborationService } from '../../../core/services/team-collaboration.service';
import { employeeWork } from '../models/work-hours';
import { WorkHoursStore } from '../stores/work-hours.store';
import { ReadStore } from '../../../core/stores/read-store';

@Service()
export class WorkHours {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  readonly users = inject(TeamCollaborationService).users;
  readonly store = inject(WorkHoursStore);
  readonly query = this.store.query;
  private readonly workspace = computed(() => this.repository.loadKanbanWorkspace());

  observeReport(now: Signal<number>, invalidDay: Signal<boolean>) {
    return new ReadStore(computed(() => (invalidDay() ? [] : this.report(now()))));
  }

  private report(now: number) {
    const workspace = this.workspace();
    const query = this.query();
    return employeeWork(workspace.tasks, workspace.history, this.users, query, now).filter(
      (group) => !query.userId || group.user.id === query.userId,
    );
  }
}
