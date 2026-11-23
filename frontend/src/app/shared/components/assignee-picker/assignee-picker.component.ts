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
import { TeamCollaborationService } from '../../../core/services/team-collaboration.service';
import { IconComponent } from '../icon/icon.component';
@Component({
  selector: 'app-assignee-picker',
  imports: [IconComponent],
  templateUrl: './assignee-picker.component.html',
  styleUrl: './assignee-picker.component.scss',
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class AssigneePickerComponent implements FormValueControl<readonly string[]> {
  readonly value = model<readonly string[]>([]);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly touch = output<void>();
  protected readonly team = inject(TeamCollaborationService);
  protected readonly selected = computed(() =>
    this.value().flatMap((id) => {
      const user = this.team.users.find((item) => item.id === id);
      return user ? [user] : [];
    }),
  );
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly summary = viewChild.required<ElementRef<HTMLElement>>('summary');
  protected toggle(id: string, event: Event): void {
    if (this.disabled()) return;
    const selected = (event.target as HTMLInputElement).checked;
    this.value.update((ids) =>
      selected ? [...new Set([...ids, id])] : ids.filter((item) => item !== id),
    );
  }
  focus(options?: FocusOptions): void {
    this.summary().nativeElement.focus(options);
  }
  protected onFocusOut(event: FocusEvent): void {
    if (
      !(event.relatedTarget instanceof Node) ||
      !this.element.nativeElement.contains(event.relatedTarget)
    )
      this.touch.emit();
  }
}
