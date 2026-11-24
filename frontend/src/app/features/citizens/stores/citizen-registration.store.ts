import { computed, signal } from '@angular/core';
import type { CitizenPhoto } from '../models/citizen-detail';
import type {
  CitizenEditingData,
  CitizenRegistrationConfiguration,
  CitizenRegistrationResult,
} from '../models/citizen-registration';

export class CitizenRegistrationStore {
  readonly configuration = signal<CitizenRegistrationConfiguration | null>(null);
  readonly editingData = signal<CitizenEditingData | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly notFound = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly photos = signal<readonly CitizenPhoto[]>([]);
  readonly photosChanged = computed(() => {
    const photos = this.photos();
    const original = this.editingData()?.photos ?? [];
    return (
      photos.length !== original.length ||
      photos.some((photo, index) => photo.src !== original[index].src)
    );
  });
  readonly review = signal<Extract<CitizenRegistrationResult, { kind: 'review' }> | null>(null);
  readonly savedId = signal<string | null>(null);
}
