import { signal } from '@angular/core';

export class CitizenCategoryStore {
  readonly categories = signal<readonly string[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly saving = signal(false);
  readonly error = signal('');
}
