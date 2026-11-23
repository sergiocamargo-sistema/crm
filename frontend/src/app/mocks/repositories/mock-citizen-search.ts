import { Service } from '@angular/core';
import { MOCK_CITIZENS } from '../data/citizens.mock';
import type { CitizenSummary } from '../../core/models/citizen-summary';
import type { CitizenSearchRepository } from '../../core/repositories/citizen-search-repository';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

@Service()
export class MockCitizenSearchRepository implements CitizenSearchRepository {
  search(query: string): readonly CitizenSummary[] {
    const value = normalize(query.trim());
    if (value.length < 2) return [];
    const terms = value.split(/\s+/);
    const digits = value.replace(/\D/g, '');
    const isPhone = /^[\d\s()+.-]+$/.test(value) && digits.length >= 2;
    return MOCK_CITIZENS.filter((citizen) =>
      isPhone
        ? citizen.phone.replace(/\D/g, '').includes(digits)
        : terms.every((term) => normalize(citizen.name).includes(term)),
    );
  }
}
