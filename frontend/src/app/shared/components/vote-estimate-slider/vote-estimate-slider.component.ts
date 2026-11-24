import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import {
  VOTE_ESTIMATE_LABEL,
  VOTE_ESTIMATE_LEVELS,
  type VoteEstimate,
} from '../../../core/models/vote-estimate';

@Component({
  selector: 'app-vote-estimate-slider',
  templateUrl: './vote-estimate-slider.component.html',
  styleUrl: './vote-estimate-slider.component.scss',
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class VoteEstimateSliderComponent implements FormValueControl<VoteEstimate | null> {
  readonly controlId = input.required<string>();
  readonly value = model<VoteEstimate | null>(null);
  readonly disabled = input(false);
  readonly touch = output<void>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly slider = viewChild.required<ElementRef<HTMLInputElement>>('slider');
  protected readonly label = VOTE_ESTIMATE_LABEL;
  protected readonly levels = VOTE_ESTIMATE_LEVELS;
  protected readonly position = computed(() => {
    const estimate = this.value();
    return estimate === null ? 0 : this.levels.indexOf(estimate) + 1;
  });
  protected readonly valueText = computed(() => {
    const estimate = this.value();
    return estimate === null ? 'Sem estimativa' : `${estimate}%`;
  });

  focus(options?: FocusOptions): void {
    this.slider().nativeElement.focus(options);
  }

  protected selectPosition(position: number): void {
    if (!this.disabled()) this.value.set(this.levels[position - 1] ?? null);
  }

  protected clear(): void {
    if (this.disabled()) return;
    this.value.set(null);
    this.focus({ preventScroll: true });
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.element.nativeElement.contains(next)) this.touch.emit();
  }
}
