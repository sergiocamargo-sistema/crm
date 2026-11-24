import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { disabled, form, FormField, maxLength } from '@angular/forms/signals';
import { CitizenCategoryService } from '../../../features/citizens/services/citizen-category.service';
import { IconComponent } from '../icon/icon.component';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/gu, ' ');

@Component({
  imports: [IconComponent, FormField],
  providers: [CitizenCategoryService],
  selector: 'app-citizen-categories',
  styleUrl: './citizen-categories.component.scss',
  templateUrl: './citizen-categories.component.html',
})
export class CitizenCategoriesComponent {
  readonly inputId = input.required<string>();
  readonly selected = input.required<readonly string[]>();
  readonly citizenId = input<string | null>(null);
  readonly disabled = input(false);
  readonly selectionChanged = output<readonly string[]>();
  protected readonly service = inject(CitizenCategoryService);
  protected readonly state = this.service.store;
  readonly busy = this.state.saving.asReadonly();
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly addButton = viewChild.required<ElementRef<HTMLButtonElement>>('addButton');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('categoryInput');
  private readonly options = viewChildren<ElementRef<HTMLButtonElement>>('categoryOption');
  private trigger: HTMLElement | null = null;
  private alive = true;
  private operation = 0;
  private readonly model = signal({ query: '' });
  protected readonly queryForm = form(this.model, (schema) => {
    maxLength(schema.query, 80, { message: 'Informe uma categoria de até 80 caracteres.' });
    disabled(schema, () => this.disabled() || this.busy());
  });
  protected readonly mode = signal<'add' | 'remove' | null>(null);
  protected readonly toRemove = signal('');
  protected readonly suggestionsOpen = signal(false);
  protected readonly attempted = signal(false);
  protected readonly status = signal('');
  protected readonly categoryOptions = computed(() => {
    const query = this.model().query.trim().replace(/\s+/gu, ' ');
    const terms = normalize(query).split(/\s+/u).filter(Boolean);
    const categories = this.state.categories();
    const selected = new Set(this.selected().map(normalize));
    const options = categories
      .filter((name) => terms.every((term) => normalize(name).includes(term)))
      .map((name) => ({ name, create: false, assigned: selected.has(normalize(name)) }));
    if (query && !categories.some((name) => normalize(name) === normalize(query)))
      options.push({ name: query, create: true, assigned: false });
    return options;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      this.operation++;
    });
    effect(() => {
      this.citizenId();
      untracked(() => {
        this.operation++;
        afterNextRender(
          () => {
            this.trigger = null;
            this.status.set('');
            if (this.dialog().nativeElement.open) this.dialog().nativeElement.close();
          },
          { injector: this.injector },
        );
      });
    });
  }

  protected open(mode: 'add' | 'remove', event: MouseEvent, category = ''): void {
    if (this.disabled() || this.busy()) return;
    this.trigger = event.currentTarget as HTMLElement;
    this.toRemove.set(category);
    this.model.set({ query: '' });
    this.attempted.set(false);
    this.service.clearError();
    this.status.set('');
    this.suggestionsOpen.set(true);
    this.mode.set(mode);
    this.dialog().nativeElement.showModal();
    afterNextRender(
      () =>
        this.dialog()
          .nativeElement.querySelector<HTMLElement>(
            mode === 'add' ? 'input[type=search]' : '[data-cancel]',
          )
          ?.focus(),
      { injector: this.injector },
    );
  }

  protected onInput(): void {
    this.suggestionsOpen.set(true);
    this.attempted.set(false);
    this.service.clearError();
  }

  protected async choose(name: string, create: boolean): Promise<void> {
    if (this.disabled() || this.busy() || this.state.loading() || this.state.loadError()) return;
    this.attempted.set(true);
    if (this.queryForm().invalid()) return;
    const operation = ++this.operation;
    const category = await this.service.choose(this.citizenId(), name, create);
    if (!this.alive || operation !== this.operation) return;
    if (category === null) {
      afterNextRender(() => this.searchInput()?.nativeElement.focus(), { injector: this.injector });
      return;
    }
    this.selectionChanged.emit([...new Set([...this.selected(), category])]);
    this.status.set('Categoria adicionada ao munícipe.');
    this.dialog().nativeElement.close();
  }

  protected async remove(): Promise<void> {
    if (this.disabled() || this.busy()) return;
    const operation = ++this.operation;
    const category = this.toRemove();
    const removed = await this.service.remove(this.citizenId(), category);
    if (!this.alive || operation !== this.operation) return;
    if (!removed) {
      afterNextRender(
        () =>
          this.dialog().nativeElement.querySelector<HTMLButtonElement>('[data-cancel]')?.focus(),
        { injector: this.injector },
      );
      return;
    }
    this.selectionChanged.emit(this.selected().filter((name) => name !== category));
    this.status.set('Categoria removida do munícipe.');
    this.dialog().nativeElement.close();
  }

  protected onFocusOut(event: FocusEvent): void {
    if (
      !(event.relatedTarget instanceof Node) ||
      !(event.currentTarget as HTMLElement).contains(event.relatedTarget)
    )
      this.suggestionsOpen.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const input = this.searchInput()?.nativeElement;
    const buttons = this.options()
      .map((item) => item.nativeElement)
      .filter((button) => !button.disabled);
    const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
    if (event.key === 'Escape' && this.suggestionsOpen()) {
      event.preventDefault();
      event.stopPropagation();
      input?.focus({ preventScroll: true });
      this.suggestionsOpen.set(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const target =
        event.key === 'ArrowDown'
          ? buttons[Math.min(index + 1, buttons.length - 1)]
          : index > 0
            ? buttons[index - 1]
            : input;
      this.suggestionsOpen.set(true);
      afterNextRender(() => target?.focus({ preventScroll: true }), { injector: this.injector });
    } else if (event.key === 'Enter' && event.currentTarget === input && this.suggestionsOpen()) {
      event.preventDefault();
      buttons[0]?.click();
    }
  }

  protected close(): void {
    if (!this.busy()) this.dialog().nativeElement.close();
  }
  protected onCancel(event: Event): void {
    if (this.busy()) event.preventDefault();
  }
  protected onClose(): void {
    this.mode.set(null);
    const trigger = this.trigger;
    this.trigger = null;
    if (trigger)
      afterNextRender(
        () => {
          if (this.alive)
            (trigger.isConnected ? trigger : this.addButton().nativeElement).focus({
              preventScroll: true,
            });
        },
        { injector: this.injector },
      );
  }
  protected onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialog().nativeElement;
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      this.close();
  }
}
