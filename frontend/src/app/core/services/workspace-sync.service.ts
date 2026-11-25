import { DestroyRef, effect, inject, Service } from '@angular/core';
import {
  WORKSPACE_SYNC_REPOSITORY,
  type WorkspaceVersion,
} from '../repositories/workspace-sync.repository';
import { SessionContext } from '../backend/session-context';
import { DataConnection } from '../backend/data-connection';

@Service()
export class WorkspaceSyncService {
  private readonly repository = inject(WORKSPACE_SYNC_REPOSITORY);
  private readonly session = inject(SessionContext);
  private readonly connection = inject(DataConnection);
  private previous: WorkspaceVersion | null = null;
  private running = false;
  constructor() {
    effect(() => {
      this.session.profile()?.actor.id;
      this.previous = null;
      void this.check();
    });
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void this.check();
    }, 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  private async check(): Promise<void> {
    const owner = this.session.profile()?.actor.id;
    if (!owner || this.running) return;
    this.running = true;
    try {
      const version = await this.repository.loadVersion();
      if (owner !== this.session.profile()?.actor.id) return;
      if (
        this.previous &&
        (version.epoch !== this.previous.epoch || version.revision !== this.previous.revision)
      )
        this.connection.refresh();
      this.previous = version;
    } catch {
      /* As consultas da tela apresentam os erros; o próximo ciclo retoma a sincronização. */
    } finally {
      this.running = false;
    }
  }
}
