import { inject, Service } from '@angular/core';
import { MockCitizenRegistry } from './mock-citizen-registry';
import type { CitizenSummary } from '../../core/models/citizen-summary';
import type { CitizenSearchRepository } from '../../core/repositories/citizen-search-repository';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

@Service()
export class MockCitizenSearchRepository implements CitizenSearchRepository {
  private readonly registry = inject(MockCitizenRegistry);
  search(query: string): readonly CitizenSummary[] {
    const value = normalize(query.trim());
    if (value.length < 2) return [];
    const terms = value.split(/\s+/);
    const digits = value.replace(/\D/g, '');
    const isPhone = /^[\d\s()+.-]+$/.test(value) && digits.length >= 2;
    const edits = this.registry.profileEdits();
    return this.registry
      .citizens()
      .filter((citizen) => {
        const text = normalize(
          [
            citizen.name,
            citizen.neighborhood,
            citizen.cra ?? '',
            edits[citizen.id]?.observations ?? citizen.observations,
            ...(edits[citizen.id]?.categories ?? citizen.categories),
            ...citizen.phones.map((phone) => phone.number),
            ...citizen.emails.map((email) => email.address),
          ].join(' '),
        );
        return (
          (isPhone &&
            citizen.phones.some((phone) => phone.number.replace(/\D/g, '').includes(digits))) ||
          terms.every((term) => text.includes(term))
        );
      })
      .map(({ id, name, initials, neighborhood, phone }) => ({
        id,
        name,
        initials,
        neighborhood,
        phone,
      }));
  }
}
