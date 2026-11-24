import { Component, computed, input, signal } from '@angular/core';
import type { FlowStep } from '../../models/automation';

@Component({
  selector: 'app-task-set-flow',
  templateUrl: './task-set-flow.component.html',
  styleUrl: './task-set-flow.component.scss',
})
export class TaskSetFlowComponent {
  readonly steps = input.required<readonly FlowStep[]>();
  readonly interactive = input(true);
  private readonly simulation = signal<{ signature: string; completed: readonly string[] }>({
    signature: '',
    completed: [],
  });
  private readonly signature = computed(() => JSON.stringify(this.steps()));
  protected readonly completed = computed(() =>
    this.simulation().signature === this.signature() ? this.simulation().completed : [],
  );
  protected readonly initial = computed(
    () => this.steps().filter((step) => !step.dependsOn.length).length,
  );
  protected readonly layers = computed(() => {
    const steps = this.steps();
    const remaining = new Map(steps.map((step) => [step.id, step]));
    const placed = new Set<string>();
    const layers: { steps: readonly FlowStep[]; blocked: boolean }[] = [];
    while (remaining.size) {
      const ready = [...remaining.values()].filter((step) =>
        step.dependsOn.every((id) => placed.has(id)),
      );
      if (!ready.length) {
        layers.push({ steps: [...remaining.values()], blocked: true });
        break;
      }
      layers.push({ steps: ready, blocked: false });
      ready.forEach((step) => {
        remaining.delete(step.id);
        placed.add(step.id);
      });
    }
    return layers;
  });
  protected dependencyNames(step: FlowStep): string {
    return step.dependsOn
      .map((id) => this.steps().find((item) => item.id === id)?.title ?? 'Etapa removida')
      .join(' + ');
  }
  protected available(step: FlowStep): boolean {
    return step.dependsOn.every((id) => this.completed().includes(id));
  }
  protected finish(id: string): void {
    const step = this.steps().find((item) => item.id === id);
    if (!step || !this.available(step) || this.completed().includes(id)) return;
    this.simulation.set({ signature: this.signature(), completed: [...this.completed(), id] });
  }
  protected reset(): void {
    this.simulation.set({ signature: this.signature(), completed: [] });
  }
}
