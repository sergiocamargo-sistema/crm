import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  disabled,
  form,
  FormField,
  maxLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../../core/models/task';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AssigneePickerComponent } from '../../../../shared/components/assignee-picker/assignee-picker.component';
import { MentionEditorComponent } from '../../../../shared/components/mention-editor/mention-editor.component';
import { RichTextComponent } from '../../../../shared/components/rich-text/rich-text.component';
import { TaskCommentsComponent } from '../task-comments/task-comments.component';
import { TaskAttachmentsComponent } from '../task-attachments/task-attachments.component';
import { TaskHistoryComponent } from '../task-history/task-history.component';
import { TaskLabelPickerComponent } from '../../../../shared/components/task-label-picker/task-label-picker.component';
import type { KanbanMoveTarget, KanbanTask, TaskDraft } from '../../models/kanban';
import { KanbanService } from '../../services/kanban.service';

const emptyTask = (userId: string, target: KanbanMoveTarget | null = null): TaskDraft => ({
  title: '',
  description: '',
  assigneeIds: [userId],
  labelIds: [],
  dueAt: '',
  status: target?.kind === 'status' ? target.status : 'todo',
  priority: 'normal',
  requestId: '',
  customColumnId: target?.kind === 'custom' ? (target.columnId ?? '') : '',
});
const localDateTime = (value: string): string => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

@Component({
  imports: [
    FormField,
    AssigneePickerComponent,
    IconComponent,
    RouterLink,
    MentionEditorComponent,
    RichTextComponent,
    TaskCommentsComponent,
    TaskAttachmentsComponent,
    TaskHistoryComponent,
    TaskLabelPickerComponent,
  ],
  selector: 'app-task-editor',
  styleUrl: './task-editor.component.scss',
  templateUrl: './task-editor.component.html',
})
export class TaskEditorComponent {
  protected readonly board = inject(KanbanService);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly titleInput = viewChild.required<ElementRef<HTMLInputElement>>('titleInput');
  private readonly statusInput = viewChild.required<ElementRef<HTMLSelectElement>>('statusInput');
  private readonly columnInput = viewChild.required<ElementRef<HTMLSelectElement>>('columnInput');
  private readonly descriptionEditor = viewChild(MentionEditorComponent);
  private readonly comments = viewChild(TaskCommentsComponent);
  private trigger: HTMLElement | null = null;
  protected readonly taskId = signal<string | null>(null);
  protected readonly automationOrigin = computed(
    () => this.board.workspace().tasks.find((task) => task.id === this.taskId())?.automation,
  );
  protected readonly model = signal<TaskDraft>(emptyTask(this.board.currentUserId));
  protected readonly editingDescription = signal(false);
  protected readonly saveStatus = signal('');
  protected readonly attempted = signal(false);
  protected readonly failure = signal('');
  protected readonly statuses = TASK_STATUSES;
  protected readonly priorities = TASK_PRIORITIES;
  readonly saved = output<string>();
  readonly closed = output<void>();
  readonly focusFallback = output<void>();
  protected readonly taskForm = form(this.model, (schema) => {
    required(schema.title);
    maxLength(schema.title, 120);
    validate(schema.title, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Informe o título.' } : undefined,
    );
    validate(schema.assigneeIds, ({ value }) =>
      !value().length
        ? { kind: 'required', message: 'Selecione pelo menos um responsável.' }
        : undefined,
    );
    maxLength(schema.description, 1500);
    validate(schema.dueAt, ({ value }) =>
      value() && !Number.isFinite(Date.parse(value()))
        ? { kind: 'date', message: 'Informe um prazo válido.' }
        : undefined,
    );
    disabled(schema.requestId, () => this.taskId() !== null);
  });

  open(
    trigger: HTMLElement,
    task: KanbanTask | null = null,
    target: KanbanMoveTarget | null = null,
    focusPlacement = false,
    commentId: string | null = null,
  ): void {
    this.trigger = trigger;
    this.descriptionEditor()?.stop();
    this.comments()?.stop();
    this.editingDescription.set(!task);
    this.saveStatus.set('');
    this.taskId.set(task?.id ?? null);
    this.model.set(
      task
        ? {
            title: task.title,
            description: task.description,
            assigneeIds: [...task.assigneeIds],
            labelIds: [...task.labelIds],
            dueAt: localDateTime(task.dueAt),
            status: task.status,
            priority: task.priority,
            requestId: task.request?.id ?? '',
            customColumnId: task.customColumnId ?? '',
          }
        : emptyTask(this.board.currentUserId, target),
    );
    this.attempted.set(false);
    this.failure.set('');
    afterNextRender(
      () => {
        if (!this.dialog().nativeElement.open) this.dialog().nativeElement.showModal();
        const placement =
          this.board.viewSettings().mode === 'custom' ? this.columnInput() : this.statusInput();
        (focusPlacement ? placement : this.titleInput()).nativeElement.focus();
        if (commentId) this.focusComment(commentId);
      },
      { injector: this.injector },
    );
  }
  protected save(event: SubmitEvent): void {
    event.preventDefault();
    this.descriptionEditor()?.stop();
    this.comments()?.stop();
    this.attempted.set(true);
    this.failure.set('');
    void submit(this.taskForm, async () => {
      try {
        const id = this.board.saveTask(this.taskId(), this.model());
        this.taskId.set(id);
        this.editingDescription.set(false);
        this.saveStatus.set('Alterações salvas.');
        this.saved.emit(id);
      } catch (error: unknown) {
        this.failure.set(
          error instanceof Error ? error.message : 'Não foi possível salvar a tarefa.',
        );
      }
    });
  }
  currentTaskId(): string | null {
    return this.taskId();
  }
  dismiss(): void {
    if (this.dialog().nativeElement.open) this.close();
  }
  isOpen(): boolean {
    return this.dialog().nativeElement.open;
  }
  focusComment(id: string): void {
    this.comments()?.focusComment(id);
  }
  protected editDescription(): void {
    this.editingDescription.set(true);
    afterNextRender(() => this.descriptionEditor()?.focus(), { injector: this.injector });
  }
  protected close(): void {
    this.descriptionEditor()?.stop();
    this.comments()?.stop();
    this.dialog().nativeElement.close();
  }
  protected onClose(): void {
    this.descriptionEditor()?.stop();
    this.comments()?.stop();
    this.closed.emit();
    const trigger = this.trigger;
    this.trigger = null;
    afterNextRender(
      () => {
        if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        else this.focusFallback.emit();
      },
      { injector: this.injector },
    );
  }
}
