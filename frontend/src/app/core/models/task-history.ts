import { taskPriorityLabel, taskStatusLabel, type Task, type TaskStatus } from './task';

export const TASK_HISTORY_FIELDS = {
  title: 'Título',
  description: 'Descrição',
  assigneeIds: 'Responsáveis',
  labelIds: 'Etiquetas',
  status: 'Status',
  customColumnId: 'Coluna personalizada',
  dueAt: 'Prazo',
  priority: 'Prioridade',
} as const;

export interface TaskFieldChange {
  readonly field: keyof typeof TASK_HISTORY_FIELDS;
  readonly label: string;
  readonly before: string;
  readonly after: string;
}

// Estado histórico de status e responsáveis, sem copiar o cadastro inteiro do card.
export interface TaskHistoryEvent {
  readonly id: string;
  readonly taskId: string;
  readonly kind: 'created' | 'updated';
  readonly occurredAt: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly status: TaskStatus;
  readonly assigneeIds: readonly string[];
  readonly changes: readonly TaskFieldChange[];
}

interface NamedReference {
  readonly id: string;
  readonly name: string;
}

export function taskHistoryEvent(
  previous: Task | null,
  task: Task,
  actor: NamedReference,
  users: readonly NamedReference[],
  columns: readonly NamedReference[],
  occurredAt: string,
  labels: readonly NamedReference[] = [],
): TaskHistoryEvent | null {
  const display = (item: Task, field: keyof typeof TASK_HISTORY_FIELDS): string => {
    switch (field) {
      case 'labelIds':
        return (
          item.labelIds
            .map((id) => labels.find((label) => label.id === id)?.name ?? id)
            .join(', ') || 'Sem etiquetas'
        );
      case 'assigneeIds':
        return item.assigneeIds
          .map((id) => users.find((user) => user.id === id)?.name ?? id)
          .join(', ');
      case 'status':
        return taskStatusLabel(item.status);
      case 'priority':
        return taskPriorityLabel(item.priority);
      case 'customColumnId':
        return columns.find((column) => column.id === item.customColumnId)?.name ?? 'Sem coluna';
      case 'dueAt':
        return item.dueAt
          ? new Intl.DateTimeFormat('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(new Date(item.dueAt))
          : 'Sem prazo';
      default:
        return item[field] || 'Sem descrição';
    }
  };
  const fields = Object.keys(TASK_HISTORY_FIELDS) as (keyof typeof TASK_HISTORY_FIELDS)[];
  const changes = previous
    ? fields
        .filter((field) =>
          field === 'assigneeIds' || field === 'labelIds'
            ? [...previous[field]].sort().join('|') !== [...task[field]].sort().join('|')
            : previous[field] !== task[field],
        )
        .map((field): TaskFieldChange => ({
          field,
          label: TASK_HISTORY_FIELDS[field],
          before: display(previous, field),
          after: display(task, field),
        }))
    : [];
  if (previous && !changes.length) return null;
  return {
    id: `task-event-${crypto.randomUUID()}`,
    taskId: task.id,
    kind: previous ? 'updated' : 'created',
    occurredAt,
    actorId: actor.id,
    actorName: actor.name,
    status: task.status,
    assigneeIds: [...task.assigneeIds],
    changes,
  };
}
