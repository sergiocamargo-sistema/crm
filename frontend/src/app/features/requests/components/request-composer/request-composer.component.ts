import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required, submit, validate } from '@angular/forms/signals';
import { AssigneePickerComponent } from '../../../../shared/components/assignee-picker/assignee-picker.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SpeechToTextDirective } from '../../../../shared/directives/speech-to-text.directive';
import { DictationButtonComponent } from '../../../../shared/components/dictation-button/dictation-button.component';
import type { RequestWorkspace } from '../../models/request-detail';
import { RequestDetailService } from '../../services/request-detail.service';
import { TaskLabelPickerComponent } from '../../../../shared/components/task-label-picker/task-label-picker.component';

@Component({
  imports: [
    IconComponent,
    FormField,
    AssigneePickerComponent,
    SpeechToTextDirective,
    DictationButtonComponent,
    TaskLabelPickerComponent,
  ],
  selector: 'app-request-composer',
  styleUrl: './request-composer.component.scss',
  templateUrl: './request-composer.component.html',
})
export class RequestComposerComponent {
  readonly workspace = input.required<RequestWorkspace>();
  readonly saved = output<void>();
  private readonly service = inject(RequestDetailService);
  protected readonly taskLabels = this.service.catalog.taskLabels;
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly dictation = viewChild(SpeechToTextDirective);
  private trigger: HTMLElement | null = null;
  protected readonly mode = signal<'comment' | 'task'>('comment');
  protected readonly taskId = signal<string | null>(null);
  protected readonly parentId = signal<string | null>(null);
  protected readonly parent = computed(() =>
    this.workspace().extras.comments.find((item) => item.id === this.parentId()),
  );
  protected readonly context = computed(
    () =>
      this.workspace().extras.tasks.find((item) => item.id === this.taskId())?.title ??
      'Solicitação',
  );
  protected readonly attempted = signal(false);
  protected readonly failure = signal('');
  private readonly commentModel = signal({ text: '' });
  protected readonly commentForm = form(this.commentModel, (schema) => {
    required(schema.text);
    maxLength(schema.text, 5000);
    validate(schema.text, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Escreva o comentário.' } : undefined,
    );
  });
  private readonly taskModel = signal({
    title: '',
    description: '',
    assigneeIds: [this.service.currentUserId] as readonly string[],
    labelIds: [] as readonly string[],
    dueAt: '',
  });
  protected readonly taskForm = form(this.taskModel, (schema) => {
    required(schema.title);
    maxLength(schema.title, 120);
    required(schema.dueAt);
    maxLength(schema.description, 1500);
    validate(schema.title, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Informe o título.' } : undefined,
    );
    validate(schema.assigneeIds, ({ value }) =>
      !value().length
        ? { kind: 'required', message: 'Selecione pelo menos um responsável.' }
        : undefined,
    );
    validate(schema.dueAt, ({ value }) =>
      !Number.isFinite(Date.parse(value()))
        ? { kind: 'date', message: 'Informe um prazo válido.' }
        : undefined,
    );
  });

  constructor() {
    const requestId = computed(() => this.workspace().request.id);
    effect(() => {
      requestId();
      afterNextRender(
        () => {
          this.dictation()?.stop();
          this.trigger = null;
          this.dialog().nativeElement.close();
        },
        { injector: this.injector },
      );
    });
  }
  openComment(
    trigger: HTMLElement,
    taskId: string | null = null,
    parentId: string | null = null,
  ): void {
    this.mode.set('comment');
    this.taskId.set(taskId);
    this.parentId.set(parentId);
    this.open(trigger);
  }
  openTask(trigger: HTMLElement): void {
    this.mode.set('task');
    this.taskId.set(null);
    this.parentId.set(null);
    this.open(trigger);
  }
  private open(trigger: HTMLElement): void {
    this.dictation()?.reset();
    this.trigger = trigger;
    this.commentModel.set({ text: '' });
    this.taskModel.set({
      title: '',
      description: '',
      assigneeIds: [this.service.currentUserId],
      labelIds: [],
      dueAt: '',
    });
    this.attempted.set(false);
    this.failure.set('');
    afterNextRender(
      () => {
        this.dialog().nativeElement.showModal();
        this.dialog().nativeElement.querySelector<HTMLElement>('textarea, input')?.focus();
      },
      { injector: this.injector },
    );
  }
  protected saveComment(event: SubmitEvent): void {
    event.preventDefault();
    this.dictation()?.stop();
    this.attempted.set(true);
    void submit(this.commentForm, async () =>
      this.persist(
        async () =>
          await this.service.addComment(this.workspace().request.id, {
            text: this.commentModel().text,
            taskId: this.taskId(),
            parentId: this.parentId(),
          }),
      ),
    );
  }
  protected saveTask(event: SubmitEvent): void {
    event.preventDefault();
    this.attempted.set(true);
    void submit(this.taskForm, async () =>
      this.persist(
        async () => await this.service.addTask(this.workspace().request.id, this.taskModel()),
      ),
    );
  }
  private async persist(action: () => Promise<unknown>): Promise<void> {
    this.failure.set('');
    try {
      await action();
      this.dialog().nativeElement.close();
      this.saved.emit();
    } catch (error: unknown) {
      this.failure.set(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }
  protected close(): void {
    this.dictation()?.stop();
    this.dialog().nativeElement.close();
  }
  protected onClose(): void {
    this.dictation()?.stop();
    if (this.trigger?.isConnected) this.trigger.focus({ preventScroll: true });
    this.trigger = null;
  }
}
