import { InjectionToken } from '@angular/core';
import type { ReferralTreeBranch } from '../models/referral-tree';

export interface ReferralTreeRepository {
  loadBranch(id: string | null): Promise<ReferralTreeBranch | null>;
}

export const REFERRAL_TREE_REPOSITORY = new InjectionToken<ReferralTreeRepository>(
  'ReferralTreeRepository',
);
