import { taskHistoryEvent, type TaskHistoryEvent } from '../../core/models/task-history';
import type { Task } from '../../core/models/task';
import type { TeamUser } from '../../core/models/collaboration';
import type { CustomKanbanColumn } from '../../features/kanban/models/kanban';

// Transições fictícias explícitas para demonstrar o relatório de 18/11/2026.
// A partir da inicialização, toda alteração usa seu instante real.
export function initialTaskHistory(
  tasks: readonly Task[],
  users: readonly TeamUser[],
  columns: readonly CustomKanbanColumn[],
): readonly TaskHistoryEvent[] {
  return tasks.flatMap((task, index) => {
    const actor = users.find((user) => user.name === task.createdBy) ?? users[0];
    let current: Task = { ...task, status: 'todo', completedAt: null };
    const events: TaskHistoryEvent[] = [];
    const created = taskHistoryEvent(null, current, actor, users, columns, task.createdAt);
    if (created) events.push(created);
    const completed = task.completedAt ? Date.parse(task.completedAt) : null;
    const start =
      completed !== null
        ? Math.max(Date.parse(task.createdAt), completed - 90 * 60_000)
        : Math.max(
            Date.parse(task.createdAt) + 15 * 60_000,
            Date.parse(`2026-11-18T${String(9 + (index % 5)).padStart(2, '0')}:00:00-03:00`),
          );
    const transition = (status: Task['status'], at: number): void => {
      const next = { ...task, status };
      const event = taskHistoryEvent(
        current,
        next,
        actor,
        users,
        columns,
        new Date(at).toISOString(),
      );
      if (event) events.push(event);
      current = next;
    };
    transition('in-progress', start);
    if (task.status === 'in-progress') {
      transition('waiting', start + 45 * 60_000);
      transition(
        'in-progress',
        Math.max(start + 90 * 60_000, Date.parse('2026-11-18T16:00:00-03:00')),
      );
    } else {
      transition(task.status, completed ?? start + (35 + (index % 4) * 20) * 60_000);
    }
    return events;
  });
}
