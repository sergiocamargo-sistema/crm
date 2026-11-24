import {
  afterNextRender,
  Component,
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
import {
  disabled,
  form,
  FormField,
  max,
  maxLength,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { TASK_PRIORITIES, type TaskPriority } from '../../../../core/models/task';
import { AssigneePickerComponent } from '../../../../shared/components/assignee-picker/assignee-picker.component';
import { TaskLabelPickerComponent } from '../../../../shared/components/task-label-picker/task-label-picker.component';
import { MentionEditorComponent } from '../../../../shared/components/mention-editor/mention-editor.component';
import { AutomationService } from '../../services/automation.service';
import type { TaskTemplate } from '../../models/automation';

@Component({
  selector: 'app-template-editor',
  imports: [FormField, AssigneePickerComponent, TaskLabelPickerComponent, MentionEditorComponent],
  templateUrl: './template-editor.component.html',
  styleUrl: '../../automation-editor.scss',
})
export class TemplateEditorComponent {
  readonly record = input<TaskTemplate | null>(null);
  readonly cancelled = output<void>();
  readonly saved = output<void>();
  private readonly service = inject(AutomationService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = this.service.store;
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');
  protected readonly draft = signal({
    title: '',
    description: '',
    assigneeIds: [] as readonly string[],
    labelIds: [] as readonly string[],
    priority: 'normal' as TaskPriority,
    dueEnabled: false,
    dueDays: 1,
  });
  protected readonly fields = form(this.draft, (schema) => {
    required(schema.title);
    maxLength(schema.title, 120);
    maxLength(schema.description, 1500);
    min(schema.dueDays, 0);
    max(schema.dueDays, 3650);
    disabled(schema.dueDays, () => !this.draft().dueEnabled);
    validate(schema.dueDays, ({ value }) =>
      Number.isInteger(value())
        ? undefined
        : { kind: 'integer', message: 'Informe um número inteiro de dias.' },
    );
  });
  protected readonly priorities = TASK_PRIORITIES;
  protected readonly error = signal('');
  constructor() {
    effect(() => {
      const record = this.record();
      untracked(() =>
        this.fields().reset(
          record
            ? {
                title: record.title,
                description: record.description,
                assigneeIds: record.assigneeIds,
                labelIds: record.labelIds,
                priority: record.priority,
                dueEnabled: record.dueInDays !== null,
                dueDays: record.dueInDays ?? 1,
              }
            : {
                title: '',
                description: '',
                assigneeIds: this.state.catalog().defaultAssigneeIds,
                labelIds: [],
                priority: 'normal',
                dueEnabled: false,
                dueDays: 1,
              },
        ),
      );
    });
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }
  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.error.set('');
    if (this.draft().dueEnabled && this.fields.dueDays().invalid()) {
      this.error.set('Informe um prazo inteiro entre 0 e 3.650 dias.');
      return;
    }
    if (this.fields().invalid() || !this.draft().assigneeIds.length) {
      this.error.set(
        'Informe um título com até 120 caracteres e selecione ao menos um responsável. A descrição aceita até 1.500 caracteres.',
      );
      return;
    }
    const { dueEnabled, dueDays, ...draft } = this.draft();
    const record = this.record();
    const result = await this.service.saveTemplate(record?.id ?? null, record?.version ?? null, {
      ...draft,
      dueInDays: dueEnabled ? dueDays : null,
    });
    if (result && !this.destroyRef.destroyed) this.saved.emit();
  }
}
