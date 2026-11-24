import { Component, computed, input, linkedSignal } from '@angular/core';
import type { FlowStep } from '../../models/automation';

const dependencyList = new Intl.ListFormat('pt-BR', { type: 'conjunction' });

@Component({
  selector: 'app-task-set-flow',
  templateUrl: './task-set-flow.component.html',
  styleUrl: './task-set-flow.component.scss',
})
export class TaskSetFlowComponent {
  readonly steps = input.required<readonly FlowStep[]>();
  private readonly titles = computed(
    () => new Map(this.steps().map(({ id, title }) => [id, title])),
  );
  private readonly simulation = linkedSignal({
    source: this.steps,
    computation: () => ({ started: false, completed: [] as readonly string[] }),
  });
  protected readonly simulating = computed(() => this.simulation().started);
  protected readonly completed = computed(() => this.simulation().completed);

  protected dependencyNames(step: FlowStep): string {
    return dependencyList.format(
      step.dependsOn.map((id) => this.titles().get(id) ?? 'Tarefa indisponível'),
    );
  }

  protected available(step: FlowStep): boolean {
    return step.dependsOn.every((id) => this.completed().includes(id));
  }

  protected finish(step: FlowStep): void {
    if (!this.available(step) || this.completed().includes(step.id)) return;
    this.simulation.update((state) => ({ ...state, completed: [...state.completed, step.id] }));
  }

  protected reset(): void {
    this.simulation.set({ started: true, completed: [] });
  }
}
