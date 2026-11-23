import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { form, FormField, maxLength, required, submit, validate } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { CitizenDetail } from '../../models/citizen-detail';
import { CitizenDetailService } from '../../services/citizen-detail';

@Component({
  imports: [IconComponent, FormField],
  selector: 'app-citizen-notes',
  styleUrl: './citizen-notes.component.scss',
  templateUrl: './citizen-notes.component.html',
})
export class CitizenNotesComponent {
  readonly citizen = input.required<CitizenDetail>();
  private readonly citizenId = computed(() => this.citizen().id);
  private readonly service = inject(CitizenDetailService);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private trigger: HTMLElement | null = null;
  private readonly observationModel = signal({ text: '' });
  private readonly categoryModel = signal({ choice: '', name: '', query: '' });
  protected readonly mode = signal<'observations' | 'category' | 'remove-category' | null>(null);
  protected readonly categoryToRemove = signal('');
  private readonly addCategoryButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('addCategoryButton');
  protected readonly attempted = signal(false);
  protected readonly failure = signal('');
  protected readonly status = signal('');
  protected readonly categories = computed(() =>
    this.service.categoryStore
      .state()
      .map((name) => ({ name, assigned: this.citizen().categories.includes(name) })),
  );
  private readonly categoryInput = viewChild<ElementRef<HTMLInputElement>>('categoryInput');
  private readonly categoryButtons = viewChildren<ElementRef<HTMLButtonElement>>('categoryOption');
  protected readonly suggestionsOpen = signal(false);
  protected readonly categoryOptions = computed(() => {
    const query = this.categoryModel().query.trim();
    const normalize = (value: string): string =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR');
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const options = this.categories()
      .filter((category) => terms.every((term) => normalize(category.name).includes(term)))
      .map((category) => ({ ...category, value: `existing:${category.name}` }));
    if (
      query &&
      !this.categories().some((category) => normalize(category.name) === normalize(query))
    ) {
      options.push({ value: 'new', name: query, assigned: false });
    }
    return options;
  });
  protected readonly observationForm = form(this.observationModel, (schema) =>
    maxLength(schema.text, 5000),
  );
  protected readonly categoryForm = form(this.categoryModel, (schema) => {
    required(schema.choice);
    maxLength(schema.query, 80);
    required(schema.name, { when: ({ valueOf }) => valueOf(schema.choice) === 'new' });
    maxLength(schema.name, 80);
    validate(schema.name, ({ value, valueOf }) =>
      valueOf(schema.choice) === 'new' && !value().trim()
        ? { kind: 'required', message: 'Informe o nome da categoria.' }
        : undefined,
    );
  });

  constructor() {
    effect(() => {
      this.citizenId();
      afterNextRender(
        () => {
          this.trigger = null;
          this.status.set('');
          if (this.dialog().nativeElement.open) this.dialog().nativeElement.close();
        },
        { injector: this.injector },
      );
    });
  }

  protected requestRemoval(category: string, event: MouseEvent): void {
    this.categoryToRemove.set(category);
    this.open('remove-category', event);
  }

  protected open(mode: 'observations' | 'category' | 'remove-category', event: MouseEvent): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.observationModel.set({ text: this.citizen().observations });
    this.categoryModel.set({ choice: '', name: '', query: '' });
    this.suggestionsOpen.set(true);
    this.attempted.set(false);
    this.failure.set('');
    this.status.set('');
    this.mode.set(mode);
    this.dialog().nativeElement.showModal();
    afterNextRender(
      () =>
        this.dialog()
          .nativeElement.querySelector<HTMLElement>(
            mode === 'remove-category' ? '[data-cancel]' : 'textarea, input[type=search]',
          )
          ?.focus(),
      { injector: this.injector },
    );
  }

  protected onCategoryInput(query: string): void {
    this.categoryModel.update((model) => ({ ...model, query, choice: '', name: '' }));
    this.suggestionsOpen.set(true);
    this.attempted.set(false);
    this.failure.set('');
  }

  protected selectCategory(choice: string, name: string): void {
    this.categoryModel.set({ choice, name: choice === 'new' ? name : '', query: name });
    this.failure.set('');
    this.persist(() => {
      this.service.addCategory(this.citizenId(), name);
      this.status.set('Categoria adicionada ao munícipe.');
    });
  }

  protected onCategoryFocusOut(event: FocusEvent): void {
    if (
      !(event.relatedTarget instanceof Node) ||
      !(event.currentTarget as HTMLElement).contains(event.relatedTarget)
    ) {
      this.suggestionsOpen.set(false);
    }
  }

  protected onCategoryKeydown(event: KeyboardEvent): void {
    const input = this.categoryInput()?.nativeElement;
    const buttons = this.categoryButtons()
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

  protected save(event: SubmitEvent): void {
    event.preventDefault();
    this.attempted.set(true);
    this.failure.set('');
    if (this.mode() === 'observations') {
      void submit(this.observationForm, async () =>
        this.persist(() => {
          this.service.saveObservations(this.citizenId(), this.observationModel().text);
          this.status.set('Observação salva.');
        }),
      );
    } else if (this.mode() === 'remove-category') {
      this.persist(() => {
        this.service.removeCategory(this.citizenId(), this.categoryToRemove());
        this.status.set('Categoria removida do munícipe.');
      });
    } else {
      void submit(this.categoryForm, async () =>
        this.persist(() => {
          const { choice, name } = this.categoryModel();
          this.service.addCategory(
            this.citizenId(),
            choice === 'new' ? name : choice.slice('existing:'.length),
          );
          this.status.set('Categoria adicionada ao munícipe.');
        }),
      );
    }
  }

  private persist(action: () => void): void {
    try {
      action();
      this.dialog().nativeElement.close();
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível salvar a alteração.',
      );
    }
  }

  protected onClose(): void {
    this.mode.set(null);
    const trigger = this.trigger;
    if (trigger)
      afterNextRender(
        () => {
          (trigger.isConnected ? trigger : this.addCategoryButton().nativeElement).focus({
            preventScroll: true,
          });
        },
        { injector: this.injector },
      );
    this.trigger = null;
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
      dialog.close();
  }
}
