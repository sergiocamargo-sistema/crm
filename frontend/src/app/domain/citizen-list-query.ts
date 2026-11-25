import { CABINET_RATING_LEVELS, type CabinetRating } from '../core/models/cabinet-rating';
import {
  AGE_RANGES,
  BIRTHDAY_MONTHS,
  type CitizenListFacetChoices,
  type CitizenListItem,
  type CitizenListQuery,
} from '../features/citizens/models/citizen-list';
import { birthdayFiltersAreCompatible } from '../features/citizens/models/citizen-birth-filters';
import { departmentScopeIds } from '../features/requests/models/department-options';
import type { Department } from '../features/requests/models/request-detail';

// Campos de consulta são privados do domínio e não são enviados à listagem.
export interface CitizenQueryRecord extends CitizenListItem {
  readonly birthDate: string | null;
  readonly cabinetRating: CabinetRating | null;
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

export function citizenListFacetChoices(
  citizens: readonly CitizenQueryRecord[],
): CitizenListFacetChoices {
  const neighborhoods = [...new Set(citizens.map((person) => person.neighborhood))];
  return {
    neighborhoods: neighborhoods
      .filter((neighborhood) => neighborhood.trim())
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((neighborhood) => ({ value: neighborhood, label: neighborhood })),
    cabinetRatings: [
      { value: 'unset', label: 'Sem avaliação' },
      ...CABINET_RATING_LEVELS.map((level) => ({
        value: String(level),
        label: `${level} ${level === 1 ? 'estrela' : 'estrelas'}`,
      })),
    ],
    ageRanges: AGE_RANGES.map(({ value, label }) => ({ value, label })),
    birthdayDays: Array.from({ length: 31 }, (_, index) => {
      const day = String(index + 1);
      return { value: day, label: day };
    }),
    birthdayMonths: BIRTHDAY_MONTHS,
    requestStatuses: [
      { value: 'pending', label: 'Com solicitações pendentes' },
      { value: 'completed', label: 'Com solicitações finalizadas' },
      { value: 'none', label: 'Sem solicitações' },
    ],
  };
}

export function queryCitizens(
  citizens: readonly CitizenQueryRecord[],
  departments: readonly Department[],
  filters: CitizenListQuery,
  today: string,
): readonly CitizenQueryRecord[] {
  const includedDepartments = departmentScopeIds(departments, filters.includedDepartmentIds);
  const excludedDepartments = departmentScopeIds(departments, filters.excludedDepartmentIds);
  if (!birthdayFiltersAreCompatible(filters.birthdayDays, filters.birthdayMonths)) return [];
  const query = normalize(filters.query.trim());
  const terms = query.split(/\s+/).filter(Boolean);
  const digits = onlyDigits(query);
  const numericQuery = /^[\d\s()+.-]+$/.test(query) && digits.length > 0;
  return citizens
    .filter((person) => {
      const cabinetRating = person.cabinetRating === null ? 'unset' : String(person.cabinetRating);
      if (filters.cabinetRatings.length && !filters.cabinetRatings.includes(cabinetRating)) {
        return false;
      }
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
        (request) =>
          !filters.requestStatuses.length || filters.requestStatuses.includes(request.status),
      );
      const matchesRequestStatus =
        !filters.requestStatuses.length ||
        matchingRequests.length > 0 ||
        (filters.requestStatuses.includes('none') && !person.requests.length);
      const includedDepartment =
        !filters.includedDepartmentIds.length ||
        matchingRequests.some((request) => includedDepartments.has(request.departmentId));
      const excludedDepartment = person.requests.some((request) =>
        excludedDepartments.has(request.departmentId),
      );
      return (
        matchesQuery &&
        (!filters.neighborhoods.length || filters.neighborhoods.includes(person.neighborhood)) &&
        included &&
        !excluded &&
        includedDepartment &&
        !excludedDepartment &&
        matchesRequestStatus &&
        matchesCitizenBirthFilters(person.birthDate, filters, today)
      );
    })
    .sort((a, b) => compareCitizens(a, b, filters.order));
}

function compareCitizens(
  a: CitizenQueryRecord,
  b: CitizenQueryRecord,
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
  const { ageRanges, birthdayDays, birthdayMonths } = filters;
  if (!ageRanges.length && !birthdayDays.length && !birthdayMonths.length) return true;
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || birthDate > today) return false;
  const [year, month, day] = birthDate.split('-').map(Number);
  const date = new Date(`${birthDate}T12:00:00Z`);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  )
    return false;
  if (birthdayDays.length && !birthdayDays.includes(String(day))) return false;
  if (birthdayMonths.length && !birthdayMonths.includes(String(month))) return false;
  if (!ageRanges.length) return true;
  const age = Number(today.slice(0, 4)) - year - (today.slice(5) < birthDate.slice(5) ? 1 : 0);
  return AGE_RANGES.some(
    (range) => ageRanges.includes(range.value) && age >= range.min && age <= range.max,
  );
}
