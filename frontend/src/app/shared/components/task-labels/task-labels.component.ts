import { Component, computed, input, output } from '@angular/core';
import type { TaskLabel } from '../../../core/models/task-label';
import { TaskLabelChipComponent } from '../task-label-chip/task-label-chip.component';

@Component({
  imports: [TaskLabelChipComponent],
  selector: 'app-task-labels',
  styleUrl: './task-labels.component.scss',
  templateUrl: './task-labels.component.html',
})
export class TaskLabelsComponent {
  readonly labelIds = input.required<readonly string[]>();
  readonly catalog = input.required<readonly TaskLabel[]>();
  readonly removable = input(false);
  readonly disabled = input(false);
  readonly removed = output<string>();
  protected readonly selected = computed(() => {
    const labels = new Map(this.catalog().map((label) => [label.id, label]));
    return this.labelIds().flatMap((id) => {
      const label = labels.get(id);
      return label ? [label] : [];
    });
  });
}
