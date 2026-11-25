import type { CitizenDetail } from '../features/citizens/models/citizen-detail';
import type {
  ReferralTreeBranch,
  ReferralTreeEntry,
  ReferralTreePerson,
} from '../features/referral-tree/models/referral-tree';
import type { CitizenProfileEdits } from './citizen-registry';

export function referralBranch(
  citizens: readonly CitizenDetail[],
  edits: CitizenProfileEdits,
  id: string | null,
): ReferralTreeBranch | null {
  const people = citizens
    .map((person) => ({
      id: person.id,
      name: person.name,
      initials: person.initials,
      referrerId: person.referrerId,
      cabinetRating:
        edits[person.id]?.cabinetRating === undefined
          ? (person.cabinetRating ?? null)
          : (edits[person.id].cabinetRating ?? null),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
  const byId = new Map(people.map((person) => [person.id, person]));
  const children = new Map<string, ReferralTreePerson[]>();
  const toPerson = (person: ReferralTreePerson): ReferralTreePerson => ({
    id: person.id,
    name: person.name,
    initials: person.initials,
    cabinetRating: person.cabinetRating,
  });
  for (const person of people) {
    if (!person.referrerId || person.referrerId === person.id || !byId.has(person.referrerId))
      continue;
    children.set(person.referrerId, [...(children.get(person.referrerId) ?? []), toPerson(person)]);
  }
  const entry = (person: ReferralTreePerson): ReferralTreeEntry => ({
    ...toPerson(person),
    childCount: children.get(person.id)?.length ?? 0,
  });
  if (id === null)
    return {
      ancestry: [],
      entries: people.filter((person) => !person.referrerId && children.has(person.id)).map(entry),
    };
  const ancestry: ReferralTreePerson[] = [];
  const visited = new Set<string>();
  let person = byId.get(id);
  while (person) {
    if (visited.has(person.id)) return null;
    visited.add(person.id);
    ancestry.unshift(toPerson(person));
    if (!person.referrerId) break;
    person = byId.get(person.referrerId);
  }
  if (!person || !ancestry.length || !children.has(ancestry[0].id)) return null;
  return { ancestry, entries: (children.get(id) ?? []).map(entry) };
}
