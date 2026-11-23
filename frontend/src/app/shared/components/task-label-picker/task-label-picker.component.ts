import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, type FormValueControl } from '@angular/forms/signals';
import type { TaskLabel } from '../../../core/models/task-label';
import { IconComponent } from '../icon/icon.component';
import { TaskLabelChipComponent } from '../task-label-chip/task-label-chip.component';
import { TaskLabelsComponent } from '../task-labels/task-labels.component';

const normalize = (text: string): string =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');

@Component({
  imports: [FormField, IconComponent, TaskLabelChipComponent, TaskLabelsComponent],
  selector: 'app-task-label-picker',
  styleUrl: './task-label-picker.component.scss',
  templateUrl: './task-label-picker.component.html',
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class TaskLabelPickerComponent implements FormValueControl<readonly string[]> {
  readonly controlId = input.required<string>();
  readonly catalog = input.required<readonly TaskLabel[]>();
  readonly value = model<readonly string[]>([]);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly touch = output<void>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly search = signal({ text: '' });
  protected readonly searchForm = form(this.search);
  protected readonly panelId = computed(() => `${this.controlId()}-options`);
  protected readonly selectedIds = computed(() => new Set(this.value()));
  protected readonly options = computed(() => {
    const terms = normalize(this.search().text.trim()).split(/\s+/u).filter(Boolean);
    if (!terms.length) return this.catalog();
    return this.catalog().filter(({ name }) => {
      const normalized = normalize(name);
      return terms.every((term) => normalized.includes(term));
    });
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const dialog = this.element.nativeElement.closest('dialog');
      if (!dialog) return;
      const dismiss = (): void => {
        if (!dialog.open) this.closePanel();
      };
      dialog.addEventListener('close', dismiss);
      destroyRef.onDestroy(() => dialog.removeEventListener('close', dismiss));
    });
  }

  protected toggle(id: string, event: Event): void {
    this.setSelected(id, (event.target as HTMLInputElement).checked);
  }

  protected remove(id: string): void {
    this.setSelected(id, false);
    this.focus({ preventScroll: true });
  }

  private setSelected(id: string, selected: boolean): void {
    if (this.disabled()) return;
    this.value.update((ids) =>
      selected ? [...new Set([...ids, id])] : ids.filter((item) => item !== id),
    );
  }

  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  protected onPanelToggle(): void {
    if (!this.panel().nativeElement.matches(':popover-open')) this.search.set({ text: '' });
  }

  protected onEscape(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.closePanel();
    this.focus({ preventScroll: true });
  }

  private closePanel(): void {
    const panel = this.panel().nativeElement;
    if (panel.matches(':popover-open')) panel.hidePopover();
  }

  protected onFocusOut(event: FocusEvent): void {
    if (
      !(event.relatedTarget instanceof Node) ||
      !this.element.nativeElement.contains(event.relatedTarget)
    ) {
      this.touch.emit();
      if (event.relatedTarget) this.closePanel();
    }
  }
}
