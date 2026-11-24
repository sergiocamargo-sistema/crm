import type { VoteEstimate } from '../../../core/models/vote-estimate';

export interface ReferralTreePerson {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly voteEstimate: VoteEstimate | null;
}

export interface ReferralTreeEntry extends ReferralTreePerson {
  readonly childCount: number;
}

export interface ReferralTreeBranch {
  readonly ancestry: readonly ReferralTreePerson[];
  readonly entries: readonly ReferralTreeEntry[];
}
