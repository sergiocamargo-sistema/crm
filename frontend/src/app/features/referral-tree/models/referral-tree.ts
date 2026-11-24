export interface ReferralTreePerson {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export interface ReferralTreeEntry extends ReferralTreePerson {
  readonly childCount: number;
}

export interface ReferralTreeBranch {
  readonly ancestry: readonly ReferralTreePerson[];
  readonly entries: readonly ReferralTreeEntry[];
}
