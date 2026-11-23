import type { EmployeeWork, WorkPeriod, WorkTile } from './work-hours';

const HOUR = 3_600_000;
export interface WorkBlock extends WorkPeriod {
  readonly id: string;
  readonly tile: WorkTile;
  readonly left: number;
  readonly width: number;
  readonly lane: number;
  readonly overlap: boolean;
  readonly color: number;
}
export interface TimelineEmployee {
  readonly group: EmployeeWork;
  readonly blocks: readonly WorkBlock[];
  readonly overlapDuration: number;
  readonly height: number;
}

function simultaneousDuration(periods: readonly WorkPeriod[]): number {
  const boundaries = periods
    .flatMap((period) => [
      { at: period.start, delta: 1 },
      { at: period.end, delta: -1 },
    ])
    .sort((a, b) => a.at - b.at || a.delta - b.delta);
  let active = 0;
  let previous = 0;
  let duration = 0;
  for (const boundary of boundaries) {
    if (active > 1) duration += boundary.at - previous;
    active += boundary.delta;
    previous = boundary.at;
  }
  return duration;
}

export function workTimeline(
  groups: readonly EmployeeWork[],
  window: { start: number; end: number } | null,
) {
  if (!window) return { hours: 10, ticks: [], rows: [] };
  const periods = groups.flatMap((group) => group.tiles.flatMap((tile) => tile.periods));
  // Começar com a faixa de expediente, ampliando para incluir TODOS os períodos.
  const first = periods.reduce(
    (earliest, period) => Math.min(earliest, period.start),
    window.start + 8 * HOUR,
  );
  const last = periods.reduce(
    (latest, period) => Math.max(latest, period.end),
    window.start + 18 * HOUR,
  );
  const start = Math.max(
    window.start,
    window.start + Math.floor((first - window.start) / HOUR) * HOUR,
  );
  const end = Math.min(window.end, window.start + Math.ceil((last - window.start) / HOUR) * HOUR);
  const hours = (end - start) / HOUR;
  const ticks = Array.from({ length: Math.floor(hours) + 1 }, (_, index) => ({
    instant: start + index * HOUR,
    left: (index / hours) * 100,
  }));
  const rows: TimelineEmployee[] = groups.map((group) => {
    const entries = group.tiles
      .flatMap((tile) =>
        tile.periods.map((period) => ({
          ...period,
          tile,
          id: `${tile.task.id}-${period.start}`,
        })),
      )
      .sort((a, b) => a.start - b.start || b.end - a.end || a.id.localeCompare(b.id));
    const overlaps = new Set<string>();
    const lanes: number[] = [];
    let active: typeof entries = [];
    const blocks = entries.map((entry) => {
      active = active.filter((other) => other.end > entry.start);
      if (active.length) {
        overlaps.add(entry.id);
        for (const other of active) overlaps.add(other.id);
      }
      active.push(entry);
      let lane = lanes.findIndex((until) => until <= entry.start);
      if (lane < 0) lane = lanes.length;
      lanes[lane] = entry.end;
      let hash = 0;
      for (const character of entry.tile.task.id)
        hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
      return {
        ...entry,
        lane,
        color: hash % 4,
        left: ((entry.start - start) / (end - start)) * 100,
        width: ((entry.end - entry.start) / (end - start)) * 100,
      };
    });
    return {
      group,
      blocks: blocks.map((block) => ({ ...block, overlap: overlaps.has(block.id) })),
      overlapDuration: simultaneousDuration(entries),
      height: Math.max(88, 72 + lanes.length * 20),
    };
  });
  return { hours, ticks, rows };
}
