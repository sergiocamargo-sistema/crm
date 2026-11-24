import { computed, signal, type Signal } from '@angular/core';
import type { ReferralTreeBranch } from '../models/referral-tree';

type BranchResult = {
  readonly id: string | null;
  readonly revision: number;
} & (
  | { readonly kind: 'loaded'; readonly branch: ReferralTreeBranch | null }
  | { readonly kind: 'failed' }
);

export class ReferralTreeStore {
  private readonly result = signal<BranchResult | null>(null);
  private readonly revision = signal(0);
  readonly reloadVersion = this.revision.asReadonly();
  private readonly current = computed(() => {
    const result = this.result();
    return result && result.id === this.id() && result.revision === this.revision() ? result : null;
  });

  readonly branch = computed(() => {
    const result = this.current();
    return result?.kind === 'loaded' ? result.branch : null;
  });
  readonly loading = computed(() => this.current() === null);
  readonly error = computed(() =>
    this.current()?.kind === 'failed' ? 'Não foi possível carregar as indicações.' : '',
  );

  constructor(private readonly id: Signal<string | null>) {}

  receive(result: BranchResult): void {
    this.result.set(result);
  }

  retry(): void {
    this.revision.update((value) => value + 1);
  }
}
