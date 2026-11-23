import { computed, signal } from '@angular/core';
import type { TaskLabelManagementResult } from '../../../core/models/task-label';

export class TaskLabelManagementStore {
  readonly search = signal({ text: '' });
  private readonly response = signal<TaskLabelManagementResult | null>(null);
  private readonly pending = signal(true);
  private readonly appliedSearch = signal<string | null>(null);
  readonly loading = computed(() => this.pending() || this.appliedSearch() !== this.search().text);
  readonly loadError = signal('');
  readonly actionError = signal('');
  readonly saving = signal(false);
  readonly results = computed(() => this.response()?.items ?? []);
  readonly total = computed(() => this.response()?.total ?? 0);
  readonly defaultColor = computed(() => this.response()?.defaultColor ?? '');

  startLoading(): void {
    this.pending.set(true);
    this.loadError.set('');
  }

  receiveResult(result: TaskLabelManagementResult, query: string): void {
    this.response.set(result);
    this.appliedSearch.set(query);
    this.pending.set(false);
  }

  fail(query: string): void {
    this.appliedSearch.set(query);
    this.pending.set(false);
    this.loadError.set('Não foi possível carregar as etiquetas das tarefas.');
  }
}
