import type { CitizenDetail } from '../features/citizens/models/citizen-detail';
import { createState, type StateCell, type StateFactory } from './state-cell';

export type CitizenProfileEdits = Readonly<
  Record<string, Partial<Pick<CitizenDetail, 'observations' | 'categories' | 'cabinetRating'>>>
>;

export class CitizenRegistry {
  readonly citizens: StateCell<readonly CitizenDetail[]>;
  readonly profileEdits: StateCell<CitizenProfileEdits>;

  constructor(
    citizens: readonly CitizenDetail[] = [],
    profileEdits: CitizenProfileEdits = {},
    state: StateFactory = createState,
    private readonly changed?: (citizen: CitizenDetail) => void,
  ) {
    this.citizens = state(citizens);
    this.profileEdits = state(profileEdits);
  }

  add(citizen: CitizenDetail): void {
    this.changed?.(citizen);
    this.citizens.update((people) => [...people, citizen]);
  }

  update(citizen: CitizenDetail): void {
    this.changed?.(citizen);
    this.citizens.update((people) =>
      people.map((person) => (person.id === citizen.id ? citizen : person)),
    );
    if (this.profileEdits()[citizen.id]) {
      this.profileEdits.update(({ [citizen.id]: replaced, ...edits }) => edits);
    }
  }
}
