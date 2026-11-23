import { computed, signal } from '@angular/core';
import type { RequestPatternManagementResult } from '../models/request-pattern-management';

export class RequestPatternManagementStore {
  readonly search = signal({ text: '' });
  private readonly response = signal<RequestPatternManagementResult | null>(null);
  private readonly pending = signal(true);
  private readonly appliedSearch = signal<string | null>(null);
  readonly loading = computed(() => this.pending() || this.appliedSearch() !== this.search().text);
  readonly loadError = signal('');
  readonly actionError = signal('');
  readonly saving = signal(false);
  readonly results = computed(() => this.response()?.items ?? []);
  readonly total = computed(() => this.response()?.total ?? 0);
  readonly departments = computed(() => this.response()?.departments ?? []);

  startLoading(): void {
    this.pending.set(true);
    this.loadError.set('');
  }

  receiveResult(result: RequestPatternManagementResult, query: string): void {
    this.response.set(result);
    this.appliedSearch.set(query);
    this.pending.set(false);
  }

  fail(query: string): void {
    this.appliedSearch.set(query);
    this.pending.set(false);
    this.loadError.set('Não foi possível carregar os padrões de solicitação.');
  }
}
