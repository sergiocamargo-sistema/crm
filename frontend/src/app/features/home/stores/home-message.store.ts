import { Service, signal } from '@angular/core';

@Service()
export class HomeMessageStore {
  private readonly value = signal<string | null>(null);
  readonly message = this.value.asReadonly();

  setMessage(message: string): void {
    this.value.set(message);
  }
}
