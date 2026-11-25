import { DataConnection } from '../../../core/backend/data-connection';
import { SessionContext } from '../../../core/backend/session-context';
import { effect, inject, Service, signal, untracked } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../repositories/citizen-detail-repository';
import { CitizenCategoryStore } from '../stores/citizen-category.store';

@Service()
export class CitizenCategoryService {
  private readonly connection = inject(DataConnection);
  private readonly session = inject(SessionContext);
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly refresh = signal(0);
  readonly store = new CitizenCategoryStore();

  constructor() {
    effect((onCleanup) => {
      this.connection.revision();
      if (!this.session.profile()) return;
      this.refresh();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      untracked(() => {
        this.store.loading.set(true);
        this.store.loadError.set('');
      });
      void this.repository.loadCitizenCategories().then(
        (categories) => {
          if (!active) return;
          this.store.categories.set(categories);
          this.store.loading.set(false);
        },
        () => {
          if (!active) return;
          this.store.loadError.set('Não foi possível carregar as categorias. Tente novamente.');
          this.store.loading.set(false);
        },
      );
    });
  }

  retry(): void {
    this.refresh.update((value) => value + 1);
  }
  clearError(): void {
    this.store.error.set('');
  }

  async choose(citizenId: string | null, name: string, create: boolean): Promise<string | null> {
    if (this.store.saving()) return null;
    this.store.saving.set(true);
    this.clearError();
    try {
      if (citizenId) return await this.repository.addCategory(citizenId, name);
      if (create) return await this.repository.createCitizenCategory(name);
      if (!this.store.categories().includes(name))
        throw new Error('A categoria não está disponível. Atualize a lista.');
      return name;
    } catch (error: unknown) {
      this.store.error.set(
        error instanceof Error ? error.message : 'Não foi possível adicionar a categoria.',
      );
      return null;
    } finally {
      this.store.saving.set(false);
    }
  }

  async remove(citizenId: string | null, name: string): Promise<boolean> {
    if (this.store.saving()) return false;
    this.store.saving.set(true);
    this.clearError();
    try {
      if (citizenId) await this.repository.removeCategory(citizenId, name);
      return true;
    } catch (error: unknown) {
      this.store.error.set(
        error instanceof Error ? error.message : 'Não foi possível remover a categoria.',
      );
      return false;
    } finally {
      this.store.saving.set(false);
    }
  }
}
