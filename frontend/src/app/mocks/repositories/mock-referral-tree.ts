import { computed, inject, Service } from '@angular/core';
import type {
  ReferralTreeBranch,
  ReferralTreeEntry,
  ReferralTreePerson,
} from '../../features/referral-tree/models/referral-tree';
import type { ReferralTreeRepository } from '../../features/referral-tree/repositories/referral-tree.repository';
import { MockCitizenRegistry } from './mock-citizen-registry';

const byName = new Intl.Collator('pt-BR');

function toPerson({ id, name, initials }: ReferralTreePerson): ReferralTreePerson {
  return { id, name, initials };
}

@Service()
export class MockReferralTreeRepository implements ReferralTreeRepository {
  private readonly registry = inject(MockCitizenRegistry);
  private readonly index = computed(() => {
    const people = this.registry
      .citizens()
      .map(({ id, name, initials, referrerId }) => ({ id, name, initials, referrerId }))
      .sort((a, b) => byName.compare(a.name, b.name));
    const byId = new Map(people.map((person) => [person.id, person]));
    const children = new Map<string, ReferralTreePerson[]>();

    for (const person of people) {
      const { id, referrerId } = person;
      if (!referrerId || referrerId === id || !byId.has(referrerId)) continue;
      const siblings = children.get(referrerId) ?? [];
      siblings.push(person);
      children.set(referrerId, siblings);
    }

    const entry = (person: ReferralTreePerson): ReferralTreeEntry => ({
      ...toPerson(person),
      childCount: children.get(person.id)?.length ?? 0,
    });
    const roots = people
      .filter((person) => !person.referrerId && children.has(person.id))
      .map(entry);

    return { byId, children, roots, entry };
  });

  async loadBranch(id: string | null): Promise<ReferralTreeBranch | null> {
    const { byId, children, roots, entry } = this.index();
    if (id === null) return { ancestry: [], entries: roots };

    const ancestry: ReferralTreePerson[] = [];
    const visited = new Set<string>();
    let person = byId.get(id);
    while (person) {
      if (visited.has(person.id)) return null;
      visited.add(person.id);
      ancestry.push(toPerson(person));

      if (!person.referrerId) {
        if (!children.has(person.id)) return null;
        return { ancestry: ancestry.reverse(), entries: (children.get(id) ?? []).map(entry) };
      }

      person = byId.get(person.referrerId);
    }
    return null;
  }
}
