import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AutomationService } from '../../services/automation.service';
import {
  flowSteps,
  taskSetGraphError,
  type TaskSet,
  type TaskSetStep,
} from '../../models/automation';
import { TaskSetFlowComponent } from '../task-set-flow/task-set-flow.component';

@Component({
  selector: 'app-set-editor',
  imports: [FormField, IconComponent, TaskSetFlowComponent],
  templateUrl: './set-editor.component.html',
  styleUrl: '../../automation-editor.scss',
})
export class SetEditorComponent {
  readonly record = input<TaskSet | null>(null);
  readonly cancelled = output<void>();
  readonly saved = output<void>();
  private readonly service = inject(AutomationService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = this.service.store;
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');
  protected readonly draft = signal({ name: '' });
  protected readonly fields = form(this.draft, (schema) => {
    required(schema.name);
    maxLength(schema.name, 120);
  });
  protected readonly selection = signal({ templateId: '' });
  protected readonly selectionForm = form(this.selection);
  protected readonly steps = signal<readonly TaskSetStep[]>([]);
  protected readonly available = computed(() =>
    this.state
      .templates()
      .filter((template) => !this.steps().some((step) => step.templateId === template.id)),
  );
  protected readonly graphError = computed(() => taskSetGraphError(this.steps()));
  protected readonly preview = computed(() =>
    flowSteps(
      { name: this.draft().name, steps: this.steps() },
      this.state.templates(),
      this.state.catalog().users,
    ),
  );
  protected readonly error = signal('');
  protected readonly announcement = signal('');
  constructor() {
    effect(() => {
      const record = this.record();
      this.fields().reset({ name: record?.name ?? '' });
      this.steps.set(record?.steps ?? []);
    });
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }
  protected title(id: string): string {
    return (
      this.state.templates().find((item) => item.id === id)?.title ?? 'Tarefa modelo indisponível'
    );
  }
  protected dependencyNames(step: TaskSetStep): string {
    return step.dependsOn
      .map((id) => this.steps().find((item) => item.id === id))
      .map((item) => (item ? this.title(item.templateId) : 'Etapa removida'))
      .join(' + ');
  }
  protected add(): void {
    const id = this.selection().templateId;
    if (!this.available().some((item) => item.id === id) || this.steps().length >= 50) return;
    this.steps.update((steps) => [
      ...steps,
      { id: `step-${crypto.randomUUID()}`, templateId: id, dependsOn: [] },
    ]);
    this.selectionForm().reset({ templateId: '' });
    this.announcement.set(`Tarefa ${this.title(id)} adicionada ao início do fluxo.`);
  }
  protected remove(id: string): void {
    this.steps.update((steps) =>
      steps
        .filter((step) => step.id !== id)
        .map((step) => ({
          ...step,
          dependsOn: step.dependsOn.filter((dependency) => dependency !== id),
        })),
    );
    this.announcement.set(
      'Etapa removida. Revise as dependências: os vínculos com esta etapa também foram removidos.',
    );
    this.heading().nativeElement.focus({ preventScroll: true });
  }
  protected toggle(stepId: string, dependencyId: string, event: Event): void {
    const selected = (event.target as HTMLInputElement).checked;
    this.steps.update((steps) =>
      steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              dependsOn: selected
                ? [...new Set([...step.dependsOn, dependencyId])]
                : step.dependsOn.filter((id) => id !== dependencyId),
            }
          : step,
      ),
    );
  }
  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.error.set('');
    if (this.fields().invalid() || this.graphError()) {
      this.error.set(this.graphError() || 'Informe um nome com até 120 caracteres.');
      return;
    }
    const record = this.record();
    const result = await this.service.saveSet(record?.id ?? null, record?.version ?? null, {
      name: this.draft().name,
      steps: this.steps(),
    });
    if (result && !this.destroyRef.destroyed) this.saved.emit();
  }
}
