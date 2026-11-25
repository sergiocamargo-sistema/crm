import { DataConnection } from '../../../core/backend/data-connection';
import { SessionContext } from '../../../core/backend/session-context';
import { effect, inject, Service, signal, untracked } from '@angular/core';
import { AUTOMATION_REPOSITORY } from '../repositories/automation-repository';
import { AutomationStore } from '../stores/automation.store';
import type { AutomationRuleDraft, TaskSetDraft, TaskTemplateDraft } from '../models/automation';

@Service()
export class AutomationService {
  private readonly connection = inject(DataConnection);
  private readonly session = inject(SessionContext);
  private readonly repository = inject(AUTOMATION_REPOSITORY);
  private readonly refresh = signal(0);
  readonly store = new AutomationStore();
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
      untracked(() => {
        this.store.loading.set(true);
        this.store.loadError.set('');
      });
      void this.repository.loadAutomationWorkspace(query).then(
        (result) => {
          if (!active || query !== this.store.search().text) return;
          this.store.response.set(result);
          this.store.loading.set(false);
        },
        () => {
          if (!active) return;
          this.store.loading.set(false);
          this.store.loadError.set('Não foi possível carregar as automações.');
        },
      );
    });
  }
  reload(): void {
    this.refresh.update((value) => value + 1);
  }
  clearError(): void {
    this.store.actionError.set('');
  }
  private async action<T>(operation: () => Promise<T>): Promise<T | null> {
    if (this.store.saving()) return null;
    this.store.saving.set(true);
    this.clearError();
    try {
      const result = await operation();
      this.reload();
      return result;
    } catch (error: unknown) {
      this.store.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível concluir esta ação.',
      );
      return null;
    } finally {
      this.store.saving.set(false);
    }
  }
  saveTemplate(id: string | null, version: number | null, draft: TaskTemplateDraft) {
    return this.action(() => this.repository.saveAutomationTemplate(id, version, draft));
  }
  saveSet(id: string | null, version: number | null, draft: TaskSetDraft) {
    return this.action(() => this.repository.saveAutomationSet(id, version, draft));
  }
  saveRule(id: string | null, version: number | null, draft: AutomationRuleDraft) {
    return this.action(() => this.repository.saveAutomationRule(id, version, draft));
  }
  remove(kind: 'template' | 'set' | 'rule', id: string, version: number) {
    return this.action(async () => {
      if (kind === 'template') await this.repository.deleteAutomationTemplate(id, version);
      else if (kind === 'set') await this.repository.deleteAutomationSet(id, version);
      else await this.repository.deleteAutomationRule(id, version);
      return true;
    });
  }
  retry(id: string) {
    return this.action(async () => {
      await this.repository.retryAutomationRun(id);
      return true;
    });
  }
}
