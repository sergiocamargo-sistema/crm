import type { Task } from '../../../core/models/task';
import type { KanbanMoveTarget } from './kanban';

export function matchesKanbanColumn(task: Task, target: KanbanMoveTarget): boolean {
  return target.kind === 'status'
    ? task.status === target.status
    : task.customColumnId === target.columnId;
}

export function orderKanbanTasks<T extends Task>(
  tasks: readonly T[],
  order: readonly string[],
): T[] {
  const ranks = new Map(order.map((id, index) => [id, index]));
  const priorities = { high: 0, normal: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    const rankA = ranks.get(a.id);
    const rankB = ranks.get(b.id);
    if (rankA !== undefined || rankB !== undefined)
      return (rankA ?? Infinity) - (rankB ?? Infinity);
    if ((a.status === 'completed') !== (b.status === 'completed'))
      return a.status === 'completed' ? 1 : -1;
    if (a.status === 'completed' && b.status === 'completed')
      return Date.parse(b.completedAt!) - Date.parse(a.completedAt!) || a.id.localeCompare(b.id);
    return (
      priorities[a.priority] - priorities[b.priority] ||
      (a.dueAt ? Date.parse(a.dueAt) : Infinity) - (b.dueAt ? Date.parse(b.dueAt) : Infinity) ||
      a.id.localeCompare(b.id)
    );
  });
}
