import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { departmentScopeIds } from '../../models/department-options';
import type { Department } from '../../models/request-detail';
import { DepartmentManagementService } from '../../services/department-management.service';

type EditorMode = { kind: 'create' } | { kind: 'edit' | 'remove'; department: Department };

@Component({
  imports: [RouterLink, FormField, IconComponent],
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrl: './department-management.component.scss',
})
export class DepartmentManagementComponent {
  private readonly service = inject(DepartmentManagementService);
  protected readonly state = this.service.store;
  protected readonly searchForm = form(this.state.search);
  protected readonly editor = signal<EditorMode>({ kind: 'create' });
  private readonly draft = signal({ name: '', parentId: '' });
  protected readonly editorForm = form(this.draft, (schema) => {
    required(schema.name);
    maxLength(schema.name, 120);
  });
  protected readonly failure = signal('');
  protected readonly status = signal('');
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('title');
  private readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>('editorDialog');
  private trigger: HTMLElement | null = null;
  protected readonly parentOptions = computed(() => {
    const editor = this.editor();
    const excluded =
      editor.kind === 'edit'
        ? departmentScopeIds(this.state.departments(), [editor.department.id])
        : null;
    return this.state.options().filter(({ id }) => !excluded?.has(id));
  });

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }

  protected open(editor: EditorMode, trigger: HTMLElement): void {
    this.trigger = trigger;
    this.editor.set(editor);
    this.failure.set('');
    this.status.set('');
    this.draft.set(
      editor.kind === 'edit'
        ? { name: editor.department.name, parentId: editor.department.parentId ?? '' }
        : { name: '', parentId: '' },
    );
    this.editorDialog().nativeElement.showModal();
  }

  protected save(event: SubmitEvent): void {
    event.preventDefault();
    const editor = this.editor();
    try {
      if (editor.kind === 'remove') {
        this.service.remove(editor.department.id);
        this.status.set('Unidade excluída.');
      } else {
        if (this.editorForm.name().invalid()) {
          this.failure.set('Informe um nome com até 120 caracteres.');
          return;
        }
        const { name, parentId } = this.draft();
        const saved = this.service.save(editor.kind === 'edit' ? editor.department.id : null, {
          name,
          parentId: parentId || null,
        });
        this.status.set(`${saved.name} salva.`);
      }
      this.editorDialog().nativeElement.close();
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível concluir a operação.',
      );
    }
  }

  protected restoreFocus(): void {
    const target = this.trigger?.isConnected ? this.trigger : this.heading().nativeElement;
    target.focus({ preventScroll: true });
    this.trigger = null;
  }
}
