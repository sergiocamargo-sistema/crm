import type { CitizenSummary } from '../../../core/models/citizen-summary';
import type { VoteEstimate } from '../../../core/models/vote-estimate';
import type { CitizenPhoto } from './citizen-detail';

export interface CitizenAddressDraft {
  key: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  reference: string;
}

export interface CitizenRegistrationDraft {
  name: string;
  birthDate: string;
  gender: string;
  occupation: string;
  cra: string;
  observations: string;
  phones: { key: string; number: string; label: string; whatsapp: boolean }[];
  emails: { key: string; address: string; label: string }[];
  addresses: CitizenAddressDraft[];
  documents: { key: string; type: string; value: string; issuer: string }[];
  categories: string[];
  referrerId: string;
  voteEstimate: VoteEstimate | null;
}

export interface CitizenRegistrationConfiguration {
  readonly genders: readonly { readonly value: string; readonly label: string }[];
  readonly documentTypes: readonly { readonly value: string; readonly label: string }[];
}

export interface CitizenEditingData {
  readonly draft: CitizenRegistrationDraft;
  readonly photos: readonly CitizenPhoto[];
  readonly referrer: CitizenSummary | null;
}

export interface CitizenDuplicateCandidate extends CitizenSummary {
  readonly reasons: readonly string[];
}

export type CitizenRegistrationResult =
  | { readonly kind: 'created'; readonly id: string }
  | { readonly kind: 'updated'; readonly id: string }
  | {
      readonly kind: 'review';
      readonly token: string;
      readonly candidates: readonly CitizenDuplicateCandidate[];
    };

export interface CitizenRegistrationCommand {
  readonly requestId: string;
  readonly draft: CitizenRegistrationDraft;
  readonly photos: readonly CitizenPhoto[];
  readonly review?: { readonly token: string; readonly reason: string };
}

export interface CitizenUpdateCommand {
  readonly requestId: string;
  readonly changes: Partial<CitizenRegistrationDraft>;
  readonly photos?: readonly CitizenPhoto[];
  readonly review?: CitizenRegistrationCommand['review'];
}

export const emptyCitizenDraft = (): CitizenRegistrationDraft => ({
  name: '',
  birthDate: '',
  gender: '',
  occupation: '',
  cra: '',
  observations: '',
  phones: [],
  emails: [],
  addresses: [],
  documents: [],
  categories: [],
  referrerId: '',
  voteEstimate: null,
});

export function validCitizenBirthDate(value: string, today: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value) || value > today || value < '0001-01-01') return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const citizenPhoneDigits = (value: string): string => value.replace(/\D/gu, '');

export function citizenPhoneIdentity(value: string): string {
  const digits = citizenPhoneDigits(value);
  return !value.trim().startsWith('+') && (digits.length === 10 || digits.length === 11)
    ? `55${digits}`
    : digits;
}

export function validCitizenPhone(value: string): boolean {
  return (
    !value.trim() ||
    (/^\+?[\d\s().-]+$/u.test(value) && /^\d{8,15}$/u.test(citizenPhoneDigits(value)))
  );
}
