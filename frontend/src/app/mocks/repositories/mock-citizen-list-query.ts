import type { VoteEstimate } from '../../core/models/vote-estimate';
import {
  AGE_RANGES,
  type CitizenListItem,
  type CitizenListQuery,
} from '../../features/citizens/models/citizen-list';
import { birthdayCombinationIsValid } from '../../features/citizens/models/citizen-birth-filters';
import { departmentScopeIds } from '../../features/requests/models/department-options';
import type { Department } from '../../features/requests/models/request-detail';

// Campos de consulta ficam no mock e não são enviados à listagem.
export interface MockCitizenListRecord extends CitizenListItem {
  readonly birthDate: string | null;
  readonly voteEstimate: VoteEstimate | null;
  readonly observations: string;
  readonly phoneNumbers: readonly string[];
  readonly requests: readonly {
    readonly departmentId: string;
    readonly status: 'pending' | 'completed';
  }[];
}

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export function queryMockCitizens(
  citizens: readonly MockCitizenListRecord[],
  departments: readonly Department[],
  filters: CitizenListQuery,
  today: string,
): readonly MockCitizenListRecord[] {
  const includedDepartments = departmentScopeIds(departments, filters.includedDepartmentIds);
  const excludedDepartments = departmentScopeIds(departments, filters.excludedDepartmentIds);
  if (!birthdayCombinationIsValid(filters.birthdayDay, filters.birthdayMonth)) return [];
  const query = normalize(filters.query.trim());
  const terms = query.split(/\s+/).filter(Boolean);
  const digits = onlyDigits(query);
  const numericQuery = /^[\d\s()+.-]+$/.test(query) && digits.length > 0;
  return citizens
    .filter((person) => {
      if (
        filters.voteEstimate &&
        filters.voteEstimate !==
          (person.voteEstimate === null ? 'unset' : String(person.voteEstimate))
      )
        return false;
      const text = normalize(
        [
          person.name,
          person.neighborhood,
          person.cra ?? '',
          person.observations,
          ...person.categories,
          ...person.phoneNumbers,
          ...person.phoneNumbers.map(onlyDigits),
        ].join(' '),
      );
      const matchesQuery =
        terms.every((term) => text.includes(term)) ||
        (numericQuery &&
          (!!person.cra?.includes(digits) ||
            person.phoneNumbers.some((phone) => onlyDigits(phone).includes(digits))));
      const included =
        !filters.includedCategories.length ||
        (filters.categoryMatch === 'all'
          ? filters.includedCategories.every((category) => person.categories.includes(category))
          : filters.includedCategories.some((category) => person.categories.includes(category)));
      const excluded = filters.excludedCategories.some((category) =>
        person.categories.includes(category),
      );
      const matchingRequests = person.requests.filter(
        (request) => !filters.requestStatus || request.status === filters.requestStatus,
      );
      const includedDepartment =
        !filters.includedDepartmentIds.length ||
        matchingRequests.some((request) => includedDepartments.has(request.departmentId));
      const excludedDepartment = person.requests.some((request) =>
        excludedDepartments.has(request.departmentId),
      );
      return (
        matchesQuery &&
        (!filters.neighborhood || person.neighborhood === filters.neighborhood) &&
        included &&
        !excluded &&
        includedDepartment &&
        !excludedDepartment &&
        matchesCitizenBirthFilters(person.birthDate, filters, today) &&
        (!filters.requestStatus ||
          (filters.requestStatus === 'none' ? !person.requests.length : !!matchingRequests.length))
      );
    })
    .sort((a, b) => compareCitizens(a, b, filters.order));
}

function compareCitizens(
  a: MockCitizenListRecord,
  b: MockCitizenListRecord,
  order: CitizenListQuery['order'],
): number {
  const byName = a.name.localeCompare(b.name, 'pt-BR');
  if (order === 'name-desc') return -byName;
  if (order === 'recent') {
    const latestA = a.lastInteractionAt ? Date.parse(a.lastInteractionAt) : 0;
    const latestB = b.lastInteractionAt ? Date.parse(b.lastInteractionAt) : 0;
    return latestB - latestA || byName;
  }
  return byName;
}

function matchesCitizenBirthFilters(
  birthDate: string | null,
  filters: CitizenListQuery,
  today: string,
): boolean {
  if (!filters.ageRange && !filters.birthdayDay && !filters.birthdayMonth) return true;
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || birthDate > today) return false;
  const [year, month, day] = birthDate.split('-').map(Number);
  const date = new Date(`${birthDate}T12:00:00Z`);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  )
    return false;
  if (filters.birthdayDay && Number(filters.birthdayDay) !== day) return false;
  if (filters.birthdayMonth && Number(filters.birthdayMonth) !== month) return false;
  if (!filters.ageRange) return true;
  const age = Number(today.slice(0, 4)) - year - (today.slice(5) < birthDate.slice(5) ? 1 : 0);
  const range = AGE_RANGES.find((range) => range.value === filters.ageRange);
  return !!range && age >= range.min && age <= range.max;
}
