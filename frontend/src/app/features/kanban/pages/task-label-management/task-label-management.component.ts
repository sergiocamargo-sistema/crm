import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { disabled, form, FormField, maxLength, required, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TaskLabelChipComponent } from '../../../../shared/components/task-label-chip/task-label-chip.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { TaskLabel, TaskLabelDraft } from '../../../../core/models/task-label';
import type { TaskLabelListItem } from '../../../../core/models/task-label';
import { TaskLabelManagementService } from '../../services/task-label-management.service';

type EditorMode = { kind: 'create' } | { kind: 'edit' | 'remove'; label: TaskLabelListItem };

@Component({
  imports: [RouterLink, FormField, IconComponent, TaskLabelChipComponent],
  selector: 'app-task-label-management',
  styleUrl: './task-label-management.component.scss',
  templateUrl: './task-label-management.component.html',
})
export class TaskLabelManagementComponent {
  private readonly service = inject(TaskLabelManagementService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = this.service.store;
  protected readonly searchForm = form(this.state.search);
  protected readonly editor = signal<EditorMode>({ kind: 'create' });
  private readonly draft = signal<TaskLabelDraft>({ name: '', color: '' });
  protected readonly editorForm = form(this.draft, (schema) => {
    required(schema.name);
    maxLength(schema.name, 60);
    required(schema.color);
    validate(schema.color, ({ value }) =>
      /^#[0-9a-f]{6}$/i.test(value())
        ? undefined
        : { kind: 'color', message: 'Escolha uma cor válida.' },
    );
    disabled(schema.name, () => this.state.saving());
    disabled(schema.color, () => this.state.saving());
  });
  private readonly attempted = signal(false);
  protected readonly showNameError = computed(
    () =>
      this.editorForm.name().invalid() && (this.attempted() || this.editorForm.name().touched()),
  );
  protected readonly showColorError = computed(
    () =>
      this.editorForm.color().invalid() && (this.attempted() || this.editorForm.color().touched()),
  );
  protected readonly preview = computed<TaskLabel>(() => ({
    id: 'preview',
    name: this.draft().name.trim() || 'Nome da etiqueta',
    color: this.draft().color,
  }));
  protected readonly status = signal('');
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('title');
  private readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>('editorDialog');
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('editorName');
  private readonly colorInput = viewChild<ElementRef<HTMLInputElement>>('editorColor');
  private readonly cancelButton = viewChild.required<ElementRef<HTMLButtonElement>>('cancelButton');
  private trigger: HTMLElement | null = null;

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }

  protected reload(): void {
    this.service.reload();
  }

  protected open(editor: EditorMode, trigger: HTMLElement): void {
    if (this.state.saving()) return;
    this.trigger = trigger;
    this.editor.set(editor);
    this.service.clearActionError();
    this.status.set('');
    this.attempted.set(false);
    this.editorForm().reset(
      editor.kind === 'edit'
        ? { name: editor.label.name, color: editor.label.color }
        : { name: '', color: this.state.defaultColor() },
    );
    this.editorDialog().nativeElement.showModal();
    afterNextRender(
      () => {
        if (!this.editorDialog().nativeElement.open) return;
        const target = editor.kind === 'remove' ? this.cancelButton() : this.nameInput();
        target?.nativeElement.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.state.saving()) return;
    const editor = this.editor();
    if (editor.kind === 'remove') {
      const removed = await this.service.remove(editor.label.id);
      if (this.destroyRef.destroyed || !removed) return;
      this.status.set('Etiqueta excluída.');
    } else {
      this.attempted.set(true);
      if (this.editorForm().invalid()) {
        const target = this.editorForm.name().invalid() ? this.nameInput() : this.colorInput();
        target?.nativeElement.focus();
        return;
      }
      const saved = await this.service.save(
        editor.kind === 'edit' ? editor.label.id : null,
        this.draft(),
      );
      if (this.destroyRef.destroyed || !saved) return;
      this.status.set(`Etiqueta “${saved.name}” salva.`);
    }
    this.editorDialog().nativeElement.close();
  }

  protected close(): void {
    if (!this.state.saving()) this.editorDialog().nativeElement.close();
  }

  protected onCancel(event: Event): void {
    if (this.state.saving()) event.preventDefault();
  }

  protected restoreFocus(): void {
    const target =
      this.trigger?.isConnected && !this.trigger.matches(':disabled')
        ? this.trigger
        : this.heading().nativeElement;
    target.focus({ preventScroll: true });
    this.trigger = null;
  }
}
