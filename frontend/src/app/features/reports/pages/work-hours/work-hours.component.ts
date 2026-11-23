import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { WorkHours } from '../../services/work-hours';
import { WorkTimelineComponent } from '../../components/work-timeline/work-timeline.component';
import { adjacentDay, reportDay, reportDayWindow } from '../../models/work-hours';

@Component({
  imports: [RouterLink, FormField, IconComponent, WorkTimelineComponent],
  selector: 'app-work-hours',
  styleUrl: './work-hours.component.scss',
  templateUrl: './work-hours.component.html',
})
export class WorkHoursComponent {
  protected readonly service = inject(WorkHours);
  protected readonly filters = form(this.service.query);
  private readonly now = signal(Date.now());
  protected readonly today = computed(() => reportDay(this.now()));
  protected readonly window = computed(() => reportDayWindow(this.service.query().day));
  protected readonly invalidDay = computed(
    () => !this.window() || this.service.query().day > this.today(),
  );
  protected readonly groups = this.service.observeReport(this.now, this.invalidDay).state;
  protected readonly totals = computed(() => {
    const groups = this.groups();
    const tiles = groups.flatMap((group) => group.tiles);
    return {
      cards: new Set(tiles.map((tile) => tile.task.id)).size,
      people: groups.length,
    };
  });
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
    const timer = setInterval(() => this.now.set(Date.now()), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected changeDay(step: number): void {
    if (this.invalidDay()) return;
    this.service.query.update((query) => ({ ...query, day: adjacentDay(query.day, step) }));
  }
  protected showToday(): void {
    this.now.set(Date.now());
    this.service.query.update((query) => ({ ...query, day: this.today() }));
  }
}
