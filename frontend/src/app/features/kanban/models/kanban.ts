import type { Task, TaskPriority, TaskStatus } from '../../../core/models/task';
import type { TaskHistoryEvent } from '../../../core/models/task-history';
import type { TaskLabel } from '../../../core/models/task-label';
import type { RequestAttachment, RequestComment } from '../../requests/models/request-detail';

export interface TaskRequestChoice {
  readonly id: string;
  readonly title: string;
  readonly protocol: string;
  readonly departmentId: string;
  readonly department: string;
  readonly citizen: { readonly id: string; readonly name: string } | null;
}

// Projeção das tarefas originais, sem criar outro cadastro de cartões.
export interface KanbanTask extends Task {
  readonly request: TaskRequestChoice | null;
  readonly commentCount: number;
  readonly attachmentCount: number;
  readonly cover: RequestAttachment | null;
}

export interface TaskCollaboration {
  readonly history: readonly TaskHistoryEvent[];
  readonly task: KanbanTask;
  readonly comments: readonly RequestComment[];
  readonly attachments: readonly RequestAttachment[];
}

export interface KanbanWorkspace {
  readonly labels: readonly TaskLabel[];
  readonly history: readonly TaskHistoryEvent[];
  readonly tasks: readonly KanbanTask[];
  readonly requests: readonly TaskRequestChoice[];
  readonly customColumns: readonly CustomKanbanColumn[];
  readonly order: Readonly<Record<KanbanView, readonly string[]>>;
}

export interface CustomKanbanColumn {
  readonly id: string;
  readonly name: string;
}

export type KanbanView = 'status' | 'custom';
export type KanbanMoveTarget =
  | { readonly kind: 'status'; readonly status: TaskStatus }
  | { readonly kind: 'custom'; readonly columnId: string | null };

export interface KanbanDisplayColumn {
  readonly id: string;
  readonly label: string;
  readonly status: TaskStatus | null;
  readonly target: KanbanMoveTarget;
  readonly tasks: readonly KanbanTask[];
}

export interface TaskDraft {
  readonly title: string;
  readonly description: string;
  readonly assigneeIds: readonly string[];
  readonly labelIds: readonly string[];
  readonly dueAt: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly requestId: string;
  readonly customColumnId: string;
}

export interface KanbanQuery {
  readonly search: string;
  readonly assigneeId: string;
  readonly departmentId: string;
  readonly priority: '' | TaskPriority;
  readonly overdueOnly: boolean;
}
