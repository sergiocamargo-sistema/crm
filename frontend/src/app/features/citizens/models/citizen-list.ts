import type { CitizenSummary } from '../../../core/models/citizen-summary';
import type { VoteEstimate } from '../../../core/models/vote-estimate';
import type { CitizenDetail, CitizenPhoto } from './citizen-detail';
import type { DepartmentOption } from '../../requests/models/department-options';

// Projeção para a listagem; não transporta históricos, conversas ou anexos.
export interface CitizenListItem extends CitizenSummary {
  readonly cra: string | null;
  readonly photo: CitizenPhoto | null;
  readonly whatsappUrl: string;
  readonly socialLinks: CitizenDetail['socialLinks'];
  readonly categories: readonly string[];
  readonly pendingRequests: number;
  readonly completedRequests: number;
  readonly lastInteractionAt: string | null;
}

export interface CitizenListResult {
  readonly items: readonly CitizenListItem[];
  readonly total: number;
  readonly neighborhoods: readonly string[];
  readonly categories: readonly string[];
  readonly departments: readonly DepartmentOption[];
}

export interface CitizenListQuery {
  readonly query: string;
  readonly neighborhood: string;
  readonly voteEstimate: '' | 'unset' | `${VoteEstimate}`;
  readonly includedCategories: readonly string[];
  readonly excludedCategories: readonly string[];
  readonly categoryMatch: 'all' | 'any';
  readonly includedDepartmentIds: readonly string[];
  readonly excludedDepartmentIds: readonly string[];
  readonly ageRange: '' | (typeof AGE_RANGES)[number]['value'];
  readonly birthdayDay: string;
  readonly birthdayMonth: string;
  readonly requestStatus: '' | 'pending' | 'completed' | 'none';
  readonly order: 'name-asc' | 'name-desc' | 'recent';
}

export const AGE_RANGES = [
  { value: '16-24', label: '16 a 24 anos', min: 16, max: 24 },
  { value: '25-39', label: '25 a 39 anos', min: 25, max: 39 },
  { value: '40-59', label: '40 a 59 anos', min: 40, max: 59 },
  { value: '60-plus', label: '60 anos ou mais', min: 60, max: Infinity },
] as const;

export const BIRTHDAY_MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
].map((label, index) => ({ value: String(index + 1), label }));
