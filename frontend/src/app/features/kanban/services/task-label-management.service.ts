import { DataConnection } from '../../../core/backend/data-connection';
import { SessionContext } from '../../../core/backend/session-context';
import { effect, inject, Service, signal, untracked } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import type { TaskLabel, TaskLabelDraft } from '../../../core/models/task-label';
import { TaskLabelManagementStore } from '../stores/task-label-management.store';

@Service()
export class TaskLabelManagementService {
  private readonly connection = inject(DataConnection);
  private readonly session = inject(SessionContext);
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly refresh = signal(0);
  readonly store = new TaskLabelManagementStore();

  constructor() {
    effect((onCleanup) => {
      this.connection.revision();
      if (!this.session.profile()) return;
      const query = this.store.search().text;
      this.refresh();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      untracked(() => this.store.startLoading());
      // As leituras síncronas do mock mantêm o catálogo atualizado durante a sessão.
      void this.repository.loadTaskLabelManagement(query).then(
        (result) => {
          if (active && query === this.store.search().text) this.store.receiveResult(result, query);
        },
        () => {
          if (active && query === this.store.search().text) this.store.fail(query);
        },
      );
    });
  }

  reload(): void {
    this.refresh.update((value) => value + 1);
  }

  clearActionError(): void {
    this.store.actionError.set('');
  }

  async save(id: string | null, draft: TaskLabelDraft): Promise<TaskLabel | null> {
    if (this.store.saving()) return null;
    this.store.saving.set(true);
    this.clearActionError();
    try {
      const label = await this.repository.saveTaskLabel(id, draft);
      this.reload();
      return label;
    } catch (error: unknown) {
      this.store.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível salvar a etiqueta.',
      );
      return null;
    } finally {
      this.store.saving.set(false);
    }
  }

  async remove(id: string): Promise<boolean> {
    if (this.store.saving()) return false;
    this.store.saving.set(true);
    this.clearActionError();
    try {
      await this.repository.deleteTaskLabel(id);
      this.reload();
      return true;
    } catch (error: unknown) {
      this.store.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível excluir a etiqueta.',
      );
      return false;
    } finally {
      this.store.saving.set(false);
    }
  }
}
