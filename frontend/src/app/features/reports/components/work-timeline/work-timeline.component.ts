import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  durationLabel,
  periodClock,
  reportDayWindow,
  type EmployeeWork,
} from '../../models/work-hours';
import { workTimeline, type WorkBlock } from '../../models/work-timeline';

@Component({
  imports: [RouterLink],
  selector: 'app-work-timeline',
  styleUrl: './work-timeline.component.scss',
  templateUrl: './work-timeline.component.html',
})
export class WorkTimelineComponent {
  readonly groups = input.required<readonly EmployeeWork[]>();
  readonly day = input.required<string>();
  private readonly window = computed(() => reportDayWindow(this.day()));
  protected readonly layout = computed(() => workTimeline(this.groups(), this.window()));
  protected readonly duration = durationLabel;
  protected time(instant: number): string {
    return periodClock(instant, this.window()?.end ?? 0);
  }
  protected description(block: WorkBlock): string {
    return `${block.tile.task.title}: ${this.time(block.start)} às ${this.time(block.end)}, ${durationLabel(block.end - block.start)}${block.running ? ', em curso' : ''}${block.overlap ? ', sobreposto a outro card' : ''}`;
  }
}
