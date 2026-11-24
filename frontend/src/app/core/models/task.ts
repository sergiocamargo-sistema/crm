export const TASK_STATUSES = [
  { value: 'todo', label: 'A fazer' },
  { value: 'in-progress', label: 'Andamento' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'completed', label: 'Concluída' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number]['value'];
export type TaskPriority = (typeof TASK_PRIORITIES)[number]['value'];

export interface Task {
  readonly automation?: {
    readonly runId: string;
    readonly ruleId: string;
    readonly ruleName: string;
    readonly stepId: string;
    readonly templateId: string;
    readonly templateVersion: number;
  };
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly assigneeIds: readonly string[];
  readonly labelIds: readonly string[];
  readonly createdBy: string;
  readonly dueAt: string;
  readonly createdAt: string;
  readonly completedAt: string | null;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly customColumnId: string | null;
}

export const taskStatusLabel = (status: TaskStatus): string =>
  status === 'completed'
    ? 'Concluída'
    : (TASK_STATUSES.find((item) => item.value === status)?.label ?? status);

export const taskPriorityLabel = (priority: TaskPriority): string =>
  TASK_PRIORITIES.find((item) => item.value === priority)?.label ?? priority;
