import type { Signal } from '@angular/core';

export class ReadStore<T> {
  constructor(readonly state: Signal<T>) {}
}
