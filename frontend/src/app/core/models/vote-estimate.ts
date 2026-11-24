export const VOTE_ESTIMATE_LABEL = 'Estimativa de voto';
export const VOTE_ESTIMATE_LEVELS = [0, 25, 50, 75, 100] as const;

export type VoteEstimate = (typeof VOTE_ESTIMATE_LEVELS)[number];

export function isVoteEstimate(value: unknown): value is VoteEstimate {
  return VOTE_ESTIMATE_LEVELS.some((level) => level === value);
}
