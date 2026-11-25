import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { RequestWorkspace } from '../../models/request-detail';
import { departmentOptions } from '../../models/department-options';
import { RequestDetailService } from '../../services/request-detail.service';

@Component({
  imports: [FormField, IconComponent],
  selector: 'app-request-classification',
  styleUrl: './request-classification.component.scss',
  templateUrl: './request-classification.component.html',
})
export class RequestClassificationComponent {
  readonly workspace = input.required<RequestWorkspace>();
  private readonly service = inject(RequestDetailService);
  private readonly injector = inject(Injector);
  protected readonly departments = computed(() =>
    departmentOptions(this.service.catalog.departments()),
  );
  protected readonly patterns = this.service.catalog.patterns;
  protected readonly selectedDepartment = computed(() =>
    this.departments().find((item) => item.id === this.workspace().extras.departmentId),
  );
  private readonly model = linkedSignal({
    source: () =>
      `${this.workspace().request.id}/${this.workspace().extras.departmentId}/${this.workspace().extras.patternId}`,
    computation: () => ({
      departmentQuery: this.selectedDepartment()?.name ?? '',
      patternId: this.workspace().extras.patternId ?? '',
    }),
  });
  protected readonly fields = form(this.model, (schema) => maxLength(schema.departmentQuery, 80));
  protected readonly open = signal(false);
  protected readonly status = signal('');
  protected readonly failure = signal('');
  private skipFocusOpen = false;
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('departmentInput');
  private readonly patternSelect =
    viewChild.required<ElementRef<HTMLSelectElement>>('patternSelect');
  private readonly options = viewChildren<ElementRef<HTMLButtonElement>>('departmentOption');
  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
  protected readonly matches = computed(() => {
    const terms = this.normalize(this.model().departmentQuery).split(/\s+/).filter(Boolean);
    return this.departments().filter((item) =>
      terms.every((term) => this.normalize(item.label).includes(term)),
    );
  });
  protected readonly newName = computed(() => {
    const name = this.model().departmentQuery.trim();
    return name &&
      !this.departments().some((item) => this.normalize(item.name) === this.normalize(name))
      ? name
      : '';
  });
  protected readonly suggestedDepartment = computed(() => {
    const pattern = this.patterns().find((item) => item.id === this.workspace().extras.patternId);
    return pattern && pattern.departmentId !== this.workspace().extras.departmentId
      ? this.departments().find((item) => item.id === pattern.departmentId)
      : null;
  });

  protected showSuggestions(event: FocusEvent): void {
    if (this.skipFocusOpen) {
      this.skipFocusOpen = false;
      return;
    }
    this.open.set(true);
    (event.target as HTMLInputElement).select();
  }
  protected chooseDepartment(id: string): void {
    this.persist(
      async () => await this.service.assignDepartment(this.workspace().request.id, id),
      'Departamento atualizado.',
    );
    this.open.set(false);
    afterNextRender(() => this.patternSelect().nativeElement.focus(), { injector: this.injector });
  }
  protected createDepartment(): void {
    if (this.fields.departmentQuery().invalid()) return;
    this.persist(
      async () => await this.service.createDepartment(this.workspace().request.id, this.newName()),
      'Departamento cadastrado e vinculado.',
    );
    this.open.set(false);
    afterNextRender(() => this.patternSelect().nativeElement.focus(), { injector: this.injector });
  }
  protected choosePattern(event: Event): void {
    this.persist(
      async () =>
        await this.service.assignPattern(
          this.workspace().request.id,
          (event.target as HTMLSelectElement).value,
        ),
      'Padrão atualizado.',
    );
  }
  protected focusOut(event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement;
    if (!event.relatedTarget || !container.contains(event.relatedTarget as Node)) {
      this.open.set(false);
      this.model.update((model) => ({
        ...model,
        departmentQuery: this.selectedDepartment()?.name ?? '',
      }));
    }
  }
  protected keydown(event: KeyboardEvent): void {
    const buttons = this.options()
      .map((item) => item.nativeElement)
      .filter((item) => !item.disabled);
    const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.open.set(false);
      this.skipFocusOpen = event.currentTarget !== this.input().nativeElement;
      this.input().nativeElement.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open.set(true);
      afterNextRender(
        () => {
          const available = this.options()
            .map((item) => item.nativeElement)
            .filter((item) => !item.disabled);
          const target =
            event.key === 'ArrowDown'
              ? available[Math.min(index + 1, available.length - 1)]
              : index > 0
                ? available[index - 1]
                : this.input().nativeElement;
          target?.focus();
        },
        { injector: this.injector },
      );
    } else if (event.key === 'Enter' && event.currentTarget === this.input().nativeElement) {
      event.preventDefault();
      buttons[0]?.click();
    }
  }
  private async persist(action: () => Promise<unknown>, status: string): Promise<void> {
    this.failure.set('');
    this.status.set('');
    try {
      await action();
      this.status.set(status);
    } catch (error: unknown) {
      this.failure.set(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }
}
