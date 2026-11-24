import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AutomationService } from '../../services/automation.service';
import {
  taskSetGraphError,
  type TaskSet,
  type TaskSetStep,
  type TaskTemplate,
} from '../../models/automation';

const MAX_TASKS = 50;
const listFormat = new Intl.ListFormat('pt-BR', { type: 'conjunction' });

@Component({
  selector: 'app-set-editor',
  imports: [FormField, IconComponent],
  templateUrl: './set-editor.component.html',
  styleUrl: '../../automation-editor.scss',
})
export class SetEditorComponent {
  readonly record = input<TaskSet | null>(null);
  readonly createdTemplate = input<TaskTemplate | null>(null);
  readonly createTemplate = output<HTMLElement>();
  readonly cancelled = output<void>();
  readonly saved = output<TaskSet>();
  private readonly service = inject(AutomationService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = this.service.store;
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  private readonly templateSelect =
    viewChild.required<ElementRef<HTMLSelectElement>>('templateSelect');
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
  protected readonly atLimit = computed(() => this.steps().length >= MAX_TASKS);
  protected readonly error = signal('');
  protected readonly announcement = signal('');
  constructor() {
    effect(() => {
      const record = this.record();
      this.fields().reset({ name: record?.name ?? '' });
      this.steps.set(record?.steps ?? []);
    });
    effect(() => {
      const template = this.createdTemplate();
      if (template) untracked(() => this.append(template));
    });
  }
  protected title(id: string): string {
    const template = this.state.templates().find((item) => item.id === id);
    return (
      template?.title ??
      (this.createdTemplate()?.id === id ? this.createdTemplate()?.title : undefined) ??
      'Tarefa modelo indisponível'
    );
  }
  protected dependencyNames(step: TaskSetStep): string {
    return listFormat.format(
      step.dependsOn.map((id) => {
        const dependency = this.steps().find((item) => item.id === id);
        return dependency ? this.title(dependency.templateId) : 'tarefa removida';
      }),
    );
  }
  protected add(): void {
    const template = this.available().find((item) => item.id === this.selection().templateId);
    if (!template) return;
    this.append(template);
    this.selectionForm().reset({ templateId: '' });
    this.templateSelect().nativeElement.focus();
  }
  private append(template: TaskTemplate): void {
    if (this.atLimit() || this.steps().some((step) => step.templateId === template.id)) return;
    this.error.set('');
    this.steps.update((steps) => [
      ...steps,
      { id: `step-${crypto.randomUUID()}`, templateId: template.id, dependsOn: [] },
    ]);
    this.announcement.set(`${template.title} adicionada ao conjunto.`);
  }
  protected remove(id: string): void {
    const linked = this.steps().some((step) => step.dependsOn.includes(id));
    this.error.set('');
    this.steps.update((steps) =>
      steps
        .filter((step) => step.id !== id)
        .map((step) => ({
          ...step,
          dependsOn: step.dependsOn.filter((dependency) => dependency !== id),
        })),
    );
    this.announcement.set(
      linked
        ? 'Tarefa removida. Confira quando as tarefas relacionadas serão criadas.'
        : 'Tarefa removida.',
    );
    this.templateSelect().nativeElement.focus();
  }
  protected toggle(stepId: string, dependencyId: string, selected: boolean): void {
    this.error.set('');
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
    if (this.fields().invalid() || !this.draft().name.trim()) {
      this.error.set('Informe um nome com até 120 caracteres.');
      this.nameInput().nativeElement.focus();
      return;
    }
    if (this.graphError()) {
      this.error.set(this.graphError());
      if (!this.steps().length) this.templateSelect().nativeElement.focus();
      return;
    }
    const record = this.record();
    const result = await this.service.saveSet(record?.id ?? null, record?.version ?? null, {
      name: this.draft().name,
      steps: this.steps(),
    });
    if (result && !this.destroyRef.destroyed) this.saved.emit(result);
  }
}
