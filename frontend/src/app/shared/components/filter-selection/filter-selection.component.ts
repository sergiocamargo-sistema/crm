import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { IconComponent, type IconName } from '../icon/icon.component';

export interface FilterChoice {
  readonly value: string;
  readonly label: string;
}

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

@Component({
  imports: [FormField, IconComponent],
  selector: 'app-filter-selection',
  styleUrl: './filter-selection.component.scss',
  templateUrl: './filter-selection.component.html',
  host: { '(focusout)': 'onFocusOut($event)', '(document:click)': 'onDocumentClick($event)' },
})
export class FilterSelectionComponent {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly hint = input.required<string>();
  readonly choices = input.required<readonly FilterChoice[]>();
  readonly placeholder = input('Buscar categoria...');
  readonly itemLabel = input('Categoria');
  readonly icon = input<IconName>('tag');
  readonly selected = input.required<readonly string[]>();
  readonly excluding = input(false);
  readonly added = output<string>();
  readonly removed = output<string>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');
  private readonly model = signal({ query: '' });
  protected readonly queryForm = form(this.model);
  protected readonly opened = signal(false);
  protected readonly status = signal('');
  protected readonly hasQuery = computed(() => !!this.model().query.trim());
  protected readonly options = computed(() => {
    const terms = normalize(this.model().query.trim()).split(/\s+/).filter(Boolean);
    return this.choices().filter(
      (choice) =>
        !this.selected().includes(choice.value) &&
        terms.every((term) => normalize(choice.label).includes(term)),
    );
  });
  protected labelFor(value: string): string {
    return this.choices().find((choice) => choice.value === value)?.label ?? value;
  }

  protected add(category: string): void {
    this.added.emit(category);
    this.model.set({ query: '' });
    this.status.set(`Filtro adicionado: ${this.labelFor(category)}.`);
    this.searchInput().nativeElement.focus();
    this.opened.set(true);
  }
  protected remove(category: string): void {
    this.removed.emit(category);
    this.status.set(`Filtro removido: ${this.labelFor(category)}.`);
    this.searchInput().nativeElement.focus();
  }
  protected addFirst(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.hasQuery()) return;
    const category = this.options()[0];
    if (category) this.add(category.value);
  }
  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.opened.set(true);
      afterNextRender(() => this.optionButtons()[0]?.nativeElement.focus(), {
        injector: this.injector,
      });
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.opened.set(false);
    }
  }
  protected onOptionKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.optionButtons()[
        Math.min(index + 1, this.optionButtons().length - 1)
      ]?.nativeElement.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!index) this.searchInput().nativeElement.focus();
      else this.optionButtons()[index - 1]?.nativeElement.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.searchInput().nativeElement.focus();
      this.opened.set(false);
    }
  }
  protected onFocusOut(event: FocusEvent): void {
    if (
      !(event.relatedTarget instanceof Node) ||
      !this.element.nativeElement.contains(event.relatedTarget)
    )
      this.opened.set(false);
  }
  protected onDocumentClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.element.nativeElement.contains(event.target))
      this.opened.set(false);
  }
}
