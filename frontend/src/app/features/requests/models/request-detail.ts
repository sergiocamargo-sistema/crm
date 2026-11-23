import type { CitizenDetail, CitizenRequest } from '../../citizens/models/citizen-detail';
import type { TimelineEntry } from '../../activities/models/timeline-entry';
import type { CitizenSummary } from '../../../core/models/citizen-summary';
import type { Task, TaskStatus, TaskPriority } from '../../../core/models/task';

export interface Department {
  readonly id: string;
  readonly parentId: string | null;
  readonly name: string;
}
export type DepartmentDraft = Pick<Department, 'name' | 'parentId'>;

export const REQUEST_PRIORITIES = ['Baixa', 'Normal', 'Alta'] as const;

export interface RequestEditorDraft {
  readonly citizenId: string | null;
  readonly title: string;
  readonly description: string;
  readonly departmentId: string;
  readonly patternId: string | null;
  readonly dueAt: string;
  readonly priority: string;
  readonly status: CitizenRequest['status'];
}

export interface RequestPattern {
  readonly id: string;
  readonly name: string;
  readonly departmentId: string;
}
export type RequestPatternDraft = Omit<RequestPattern, 'id'>;
export type RequestTask = Task;
export interface RequestComment {
  readonly id: string;
  readonly text: string;
  readonly author: string;
  readonly createdAt: string;
  readonly taskId: string | null;
  readonly parentId: string | null;
}
export interface RequestChange {
  readonly author: string;
  readonly type?: 'task' | 'request-update';
  readonly taskId?: string;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly occurredAt: string;
}
export interface RequestExtras {
  readonly awareness: readonly RequestAwareness[];
  readonly attachments: readonly RequestAttachment[];
  readonly departmentId: string;
  readonly patternId: string | null;
  readonly tasks: readonly RequestTask[];
  readonly comments: readonly RequestComment[];
  readonly changes: readonly RequestChange[];
}
export interface RequestAwareness {
  readonly id: string;
  readonly citizenId: string;
  readonly createdAt: string;
  readonly author: string;
}
export interface RequestAwarenessView extends RequestAwareness {
  readonly citizen: CitizenSummary;
}
export interface RequestAttachment {
  readonly id: string;
  readonly name: string;
  readonly kind: 'photo' | 'document' | 'audio';
  readonly mimeType: string;
  readonly size: number | null;
  readonly url: string;
  readonly createdAt: string;
  readonly author: string;
  readonly taskId?: string | null;
}
export interface RequestWorkspace {
  readonly citizen: CitizenDetail | null;
  readonly awareness: readonly RequestAwarenessView[];
  readonly request: CitizenRequest;
  readonly extras: RequestExtras;
  readonly timeline: readonly TimelineEntry[];
}
export interface NewRequestComment {
  readonly text: string;
  readonly taskId: string | null;
  readonly parentId: string | null;
}
export interface NewRequestTask {
  readonly title: string;
  readonly description: string;
  readonly assigneeIds: readonly string[];
  readonly labelIds: readonly string[];
  readonly dueAt: string;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly customColumnId?: string | null;
}
