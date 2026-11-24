import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { IconComponent, type IconName } from '../../../../shared/components/icon/icon.component';
import { INTERACTION_CHANNELS, type TimelineFilters } from '../../models/citizen-detail';
import { CitizenDetailService, interactionCalendarDate } from '../../services/citizen-detail';
import { RouterLink } from '@angular/router';
import { interactionDetailRoute } from '../../../activities/models/activity-detail';
import { TIMELINE_TYPES, type TimelineEntry } from '../../../activities/models/timeline-entry';
import { RichTextComponent } from '../../../../shared/components/rich-text/rich-text.component';

interface TimelineItem extends TimelineEntry {
  readonly detailRoute: readonly [string, string];
  readonly icon: IconName;
  readonly typeLabel: string;
  readonly day: string;
  readonly month: string;
  readonly time: string;
}

interface TimelineGroup {
  readonly key: string;
  readonly label: string;
  readonly items: TimelineItem[];
}

const emptyFilters = (): TimelineFilters => ({
  from: '',
  to: '',
  department: '',
  type: '',
  query: '',
});
const dateOptions = { timeZone: 'America/Sao_Paulo' } as const;
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { ...dateOptions, month: 'short' });
const groupFormatter = new Intl.DateTimeFormat('pt-BR', {
  ...dateOptions,
  month: 'long',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  ...dateOptions,
  hour: '2-digit',
  minute: '2-digit',
});

@Component({
  imports: [IconComponent, FormField, RouterLink, RichTextComponent],
  selector: 'app-citizen-timeline',
  styleUrl: './citizen-timeline.component.scss',
  templateUrl: './citizen-timeline.component.html',
})
export class CitizenTimelineComponent {
  readonly interactions = input.required<readonly TimelineEntry[]>();
  readonly contextKey = input('timeline');
  readonly allowReplies = input(false);
  readonly showCardFooter = input(true);
  readonly replyRequested = output<string>();
  readonly contactRequested = output<HTMLElement>();
  protected readonly expanded = linkedSignal({ source: this.contextKey, computation: () => false });
  private readonly service = inject(CitizenDetailService);
  protected readonly interactionTypes = TIMELINE_TYPES;
  protected readonly filters = linkedSignal({
    source: this.contextKey,
    computation: () => emptyFilters(),
  });
  protected readonly filterForm = form(this.filters);
  protected readonly activeFilterCount = computed(
    () => Object.values(this.filters()).filter((value) => value.trim()).length,
  );
  protected readonly invalidDateRange = computed(() => {
    const { from, to } = this.filters();
    return !!from && !!to && from > to;
  });
  protected readonly departments = computed(() =>
    [
      ...new Set(
        this.interactions()
          .map((item) => item.department)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  );
  protected readonly visibleInteractions = computed(() =>
    this.service.filterTimeline(this.interactions(), this.filters()),
  );
  protected readonly groups = computed(() => {
    const groups = new Map<string, TimelineGroup>();
    for (const item of this.visibleInteractions()) {
      const date = new Date(item.occurredAt);
      const calendarDate = interactionCalendarDate(item.occurredAt);
      const key = calendarDate.slice(0, 7);
      const type = TIMELINE_TYPES.find((type) => type.value === item.type)!;
      const channel = INTERACTION_CHANNELS.find((channel) => channel.value === item.channel);
      const group: TimelineGroup = groups.get(key) ?? {
        key,
        label: groupFormatter.format(date),
        items: [],
      };
      group.items.push({
        ...item,
        detailRoute: interactionDetailRoute(item),
        icon: channel?.icon ?? type.icon,
        typeLabel: channel?.label ?? type.label,
        day: calendarDate.slice(8, 10),
        month: monthFormatter.format(date),
        time: timeFormatter.format(date),
      });
      groups.set(key, group);
    }
    return [...groups.values()];
  });

  protected clearFilters(): void {
    this.filters.set(emptyFilters());
  }
}
