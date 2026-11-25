import { Service, signal } from '@angular/core';

@Service()
export class DataConnection {
  readonly revision = signal(0);
  readonly pending = signal(0);
  readonly error = signal('');
  refresh(): void {
    this.error.set('');
    this.revision.update((value) => value + 1);
  }
}
