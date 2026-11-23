import { effect, inject, Service, signal, untracked } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import type { RequestPattern, RequestPatternDraft } from '../models/request-detail';
import { RequestPatternManagementStore } from '../stores/request-pattern-management.store';

@Service()
export class RequestPatternManagementService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly refresh = signal(0);
  readonly store = new RequestPatternManagementStore();

  constructor() {
    effect((onCleanup) => {
      const query = this.store.search().text;
      this.refresh();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      untracked(() => this.store.startLoading());
      // As leituras síncronas do mock mantêm o catálogo atualizado durante a sessão.
      void this.repository.loadRequestPatternManagement(query).then(
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

  async save(id: string | null, draft: RequestPatternDraft): Promise<RequestPattern | null> {
    if (this.store.saving()) return null;
    this.store.saving.set(true);
    this.clearActionError();
    try {
      const pattern = await this.repository.saveRequestPattern(id, draft);
      this.reload();
      return pattern;
    } catch (error: unknown) {
      this.store.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível salvar o padrão.',
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
      await this.repository.deleteRequestPattern(id);
      this.reload();
      return true;
    } catch (error: unknown) {
      this.store.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível excluir o padrão.',
      );
      return false;
    } finally {
      this.store.saving.set(false);
    }
  }
}
