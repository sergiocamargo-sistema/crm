import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChildren,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import {
  CABINET_RATING_LABEL,
  CABINET_RATING_LEVELS,
  cabinetRatingText,
  type CabinetRating,
} from '../../../core/models/cabinet-rating';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-cabinet-rating',
  imports: [IconComponent],
  templateUrl: './cabinet-rating.component.html',
  styleUrl: './cabinet-rating.component.scss',
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class CabinetRatingComponent implements FormValueControl<CabinetRating | null> {
  readonly controlId = input.required<string>();
  readonly value = model<CabinetRating | null>(null);
  readonly disabled = input(false);
  readonly readOnly = input(false);
  readonly touch = output<void>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly choices = viewChildren<ElementRef<HTMLInputElement>>('choice');
  protected readonly label = CABINET_RATING_LABEL;
  protected readonly levels = CABINET_RATING_LEVELS;
  protected readonly valueText = computed(() => cabinetRatingText(this.value()));

  focus(options?: FocusOptions): void {
    const choices = this.choices();
    (choices.find(({ nativeElement }) => nativeElement.checked) ?? choices[0])?.nativeElement.focus(
      options,
    );
  }
  protected select(rating: CabinetRating): void {
    if (!this.disabled() && !this.readOnly()) this.value.set(rating);
  }
  protected clear(): void {
    if (this.disabled() || this.readOnly()) return;
    this.value.set(null);
    this.focus({ preventScroll: true });
  }
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.element.nativeElement.contains(next)) this.touch.emit();
  }
}
