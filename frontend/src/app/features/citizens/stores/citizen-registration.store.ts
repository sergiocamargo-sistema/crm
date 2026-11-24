import { signal } from '@angular/core';
import type { CitizenPhoto } from '../models/citizen-detail';
import type {
  CitizenRegistrationConfiguration,
  CitizenRegistrationResult,
} from '../models/citizen-registration';

export class CitizenRegistrationStore {
  readonly configuration = signal<CitizenRegistrationConfiguration | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly saving = signal(false);
  readonly error = signal('');
  readonly photos = signal<readonly CitizenPhoto[]>([]);
  readonly review = signal<Extract<CitizenRegistrationResult, { kind: 'review' }> | null>(null);
  readonly createdId = signal<string | null>(null);
}
