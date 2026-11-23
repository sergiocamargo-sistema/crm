import { Component, computed, input, output } from '@angular/core';
import type { TaskLabel } from '../../../core/models/task-label';
import { contrastTextColor } from '../../utils/color-contrast';
import { IconComponent } from '../icon/icon.component';

@Component({
  imports: [IconComponent],
  selector: 'app-task-label-chip',
  styleUrl: './task-label-chip.component.scss',
  templateUrl: './task-label-chip.component.html',
  host: {
    '[style.--task-label-background]': 'label().color',
    '[style.--task-label-foreground]': 'foreground()',
  },
})
export class TaskLabelChipComponent {
  readonly label = input.required<TaskLabel>();
  readonly removable = input(false);
  readonly disabled = input(false);
  readonly removed = output<string>();
  protected readonly foreground = computed(() => contrastTextColor(this.label().color));
}
