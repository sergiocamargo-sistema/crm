import type { CabinetRating } from '../../../core/models/cabinet-rating';

export interface ReferralTreePerson {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly cabinetRating: CabinetRating | null;
}

export interface ReferralTreeEntry extends ReferralTreePerson {
  readonly childCount: number;
}

export interface ReferralTreeBranch {
  readonly ancestry: readonly ReferralTreePerson[];
  readonly entries: readonly ReferralTreeEntry[];
}
