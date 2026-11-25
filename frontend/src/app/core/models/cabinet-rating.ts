/** Avaliação do gabinete informada pelo munícipe; sem resposta é null. */
export const CABINET_RATING_LABEL = 'Avaliação do gabinete';
export const CABINET_RATING_LEVELS = [1, 2, 3, 4, 5] as const;
export type CabinetRating = (typeof CABINET_RATING_LEVELS)[number];

export function isCabinetRating(value: unknown): value is CabinetRating {
  return CABINET_RATING_LEVELS.some((level) => level === value);
}

export function cabinetRatingText(value: CabinetRating | null): string {
  return value === null ? 'Sem avaliação' : `${value} de 5 estrelas`;
}
