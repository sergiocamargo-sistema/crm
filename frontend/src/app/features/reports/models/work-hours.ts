import type { TaskHistoryEvent } from '../../../core/models/task-history';
import type { TeamUser } from '../../../core/models/collaboration';
import type { KanbanTask } from '../../kanban/models/kanban';

export const REPORT_TIME_ZONE = 'America/Sao_Paulo';
const calendar = new Intl.DateTimeFormat('sv-SE', { timeZone: REPORT_TIME_ZONE });
const clock = new Intl.DateTimeFormat('pt-BR', {
  timeZone: REPORT_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
export const reportDay = (instant: number): string => calendar.format(instant);
export const adjacentDay = (day: string, step: number): string =>
  new Date(Date.parse(`${day}T12:00:00Z`) + step * 86_400_000).toISOString().slice(0, 10);
export const durationLabel = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60_000);
  if (!minutes) return milliseconds > 0 ? '< 1 min' : '0 min';
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
};

function midnight(day: string): number {
  const expected = Date.parse(`${day}T00:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  let instant = expected;
  for (let pass = 0; pass < 3; pass++) {
    const part = (name: Intl.DateTimeFormatPartTypes): number =>
      Number(formatter.formatToParts(instant).find((item) => item.type === name)?.value);
    const localAsUtc = Date.UTC(
      part('year'),
      part('month') - 1,
      part('day'),
      part('hour'),
      part('minute'),
      part('second'),
    );
    instant += expected - localAsUtc;
  }
  return instant;
}

export function reportDayWindow(day: string): { start: number; end: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const parsed = Date.parse(`${day}T12:00:00Z`);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== day) return null;
  return { start: midnight(day), end: midnight(adjacentDay(day, 1)) };
}

export interface WorkPeriod {
  readonly start: number;
  readonly end: number;
  readonly running: boolean;
}
export interface WorkTile {
  readonly task: KanbanTask;
  readonly duration: number;
  readonly periods: readonly WorkPeriod[];
  readonly completedOnDay: boolean;
}
export interface EmployeeWork {
  readonly user: TeamUser;
  readonly tiles: readonly WorkTile[];
  readonly duration: number;
}

export const periodClock = (instant: number, dayEnd: number): string =>
  instant === dayEnd ? '24:00' : clock.format(instant);

export function employeeWork(
  tasks: readonly KanbanTask[],
  history: readonly TaskHistoryEvent[],
  users: readonly TeamUser[],
  query: { readonly day: string },
  now: number,
): readonly EmployeeWork[] {
  const window = reportDayWindow(query.day);
  if (!window || window.start >= now) return [];
  const end = Math.min(window.end, now);
  const eventsByTask = new Map<string, TaskHistoryEvent[]>();
  for (const event of history) {
    if (!Number.isFinite(Date.parse(event.occurredAt)) || Date.parse(event.occurredAt) > now)
      continue;
    const events = eventsByTask.get(event.taskId) ?? [];
    events.push(event);
    eventsByTask.set(event.taskId, events);
  }
  const byUser = new Map<string, WorkTile[]>();
  for (const task of tasks) {
    const events = (eventsByTask.get(task.id) ?? []).sort(
      (a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
    );
    const periods = new Map<string, WorkPeriod[]>();
    for (let index = 0; index < events.length; index++) {
      const event = events[index];
      if (event.status !== 'in-progress') continue;
      const start = Math.max(window.start, Date.parse(event.occurredAt));
      const next = events[index + 1];
      const stop = Math.min(end, next ? Date.parse(next.occurredAt) : now);
      if (stop <= start) continue;
      for (const userId of new Set(event.assigneeIds)) {
        const entries = periods.get(userId) ?? [];
        const previous = entries.at(-1);
        const period = { start, end: stop, running: !next && stop === now && now < window.end };
        if (previous?.end === start)
          entries[entries.length - 1] = { ...period, start: previous.start };
        else entries.push(period);
        periods.set(userId, entries);
      }
    }
    const completedOnDay = events.some(
      (event, index) =>
        event.status === 'completed' &&
        events[index - 1]?.status !== 'completed' &&
        Date.parse(event.occurredAt) >= window.start &&
        Date.parse(event.occurredAt) < end,
    );
    for (const [userId, entries] of periods) {
      const tiles = byUser.get(userId) ?? [];
      tiles.push({
        task,
        periods: entries,
        completedOnDay,
        duration: entries.reduce((sum, period) => sum + period.end - period.start, 0),
      });
      byUser.set(userId, tiles);
    }
  }
  return users.flatMap((user) => {
    const tiles = (byUser.get(user.id) ?? []).sort((a, b) => b.duration - a.duration);
    return tiles.length
      ? [{ user, tiles, duration: tiles.reduce((sum, tile) => sum + tile.duration, 0) }]
      : [];
  });
}
