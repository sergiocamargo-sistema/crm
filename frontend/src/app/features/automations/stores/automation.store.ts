import { computed, signal } from '@angular/core';
import type { AutomationWorkspace } from '../models/automation';

export class AutomationStore {
  readonly search = signal({ text: '' });
  readonly response = signal<AutomationWorkspace | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly saving = signal(false);
  readonly actionError = signal('');
  readonly templates = computed(() => this.response()?.templates ?? []);
  readonly sets = computed(() => this.response()?.sets ?? []);
  readonly rules = computed(() => this.response()?.rules ?? []);
  readonly runs = computed(() => this.response()?.runs ?? []);
  readonly catalog = computed(
    () =>
      this.response()?.catalog ?? { patterns: [], users: [], labels: [], defaultAssigneeIds: [] },
  );
  readonly templateResults = computed(() =>
    this.templates().filter((item) => this.response()?.templateResultIds.includes(item.id)),
  );
  readonly setResults = computed(() =>
    this.sets().filter((item) => this.response()?.setResultIds.includes(item.id)),
  );
  readonly ruleResults = computed(() =>
    this.rules().filter((item) => this.response()?.ruleResultIds.includes(item.id)),
  );
  readonly runResults = computed(() =>
    this.runs().filter((item) => this.response()?.runResultIds.includes(item.id)),
  );
}
