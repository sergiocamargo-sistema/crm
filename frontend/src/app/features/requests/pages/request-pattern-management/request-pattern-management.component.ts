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
import { disabled, form, FormField, maxLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { RequestPatternDraft } from '../../models/request-detail';
import type { RequestPatternListItem } from '../../models/request-pattern-management';
import { RequestPatternManagementService } from '../../services/request-pattern-management.service';

type EditorMode = { kind: 'create' } | { kind: 'edit' | 'remove'; pattern: RequestPatternListItem };

@Component({
  imports: [RouterLink, FormField, IconComponent],
  selector: 'app-request-pattern-management',
  styleUrl: './request-pattern-management.component.scss',
  templateUrl: './request-pattern-management.component.html',
})
export class RequestPatternManagementComponent {
  private readonly service = inject(RequestPatternManagementService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = this.service.store;
  protected readonly searchForm = form(this.state.search);
  protected readonly editor = signal<EditorMode>({ kind: 'create' });
  private readonly draft = signal<RequestPatternDraft>({ name: '', departmentId: '' });
  protected readonly editorForm = form(this.draft, (schema) => {
    required(schema.name);
    maxLength(schema.name, 120);
    required(schema.departmentId);
    disabled(schema.name, () => this.state.saving());
    disabled(schema.departmentId, () => this.state.saving());
  });
  private readonly attempted = signal(false);
  protected readonly showNameError = computed(
    () =>
      this.editorForm.name().invalid() && (this.attempted() || this.editorForm.name().touched()),
  );
  protected readonly showDepartmentError = computed(
    () =>
      this.editorForm.departmentId().invalid() &&
      (this.attempted() || this.editorForm.departmentId().touched()),
  );
  protected readonly status = signal('');
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('title');
  private readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>('editorDialog');
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('editorName');
  private readonly departmentSelect = viewChild<ElementRef<HTMLSelectElement>>('editorDepartment');
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
        ? { name: editor.pattern.name, departmentId: editor.pattern.departmentId }
        : { name: '', departmentId: '' },
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
      const removed = await this.service.remove(editor.pattern.id);
      if (this.destroyRef.destroyed || !removed) return;
      this.status.set('Padrão excluído.');
    } else {
      this.attempted.set(true);
      if (this.editorForm().invalid()) {
        const target = this.editorForm.name().invalid()
          ? this.nameInput()
          : this.departmentSelect();
        target?.nativeElement.focus();
        return;
      }
      const saved = await this.service.save(
        editor.kind === 'edit' ? editor.pattern.id : null,
        this.draft(),
      );
      if (this.destroyRef.destroyed || !saved) return;
      this.status.set(`Padrão “${saved.name}” salvo.`);
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
