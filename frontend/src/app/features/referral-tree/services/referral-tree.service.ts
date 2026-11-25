import { DataConnection } from '../../../core/backend/data-connection';
import { SessionContext } from '../../../core/backend/session-context';
import { computed, effect, inject, Service, type Signal } from '@angular/core';
import { REFERRAL_TREE_REPOSITORY } from '../repositories/referral-tree.repository';
import { ReferralTreeStore } from '../stores/referral-tree.store';

@Service()
export class ReferralTreeService {
  private readonly connection = inject(DataConnection);
  private readonly session = inject(SessionContext);
  private readonly repository = inject(REFERRAL_TREE_REPOSITORY);

  observeBranch(id: Signal<string | undefined>): ReferralTreeStore {
    const selectedId = computed(() => id() ?? null);
    const store = new ReferralTreeStore(selectedId);

    effect((onCleanup) => {
      this.connection.revision();
      if (!this.session.profile()) return;
      const id = selectedId();
      const revision = store.reloadVersion();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      void this.repository.loadBranch(id).then(
        (branch) => {
          if (active) store.receive({ id, revision, kind: 'loaded', branch });
        },
        () => {
          if (active) store.receive({ id, revision, kind: 'failed' });
        },
      );
    });

    return store;
  }
}
