import type {
  CitizenDetail,
  NewCitizenInteraction,
  NewCitizenRequest,
} from '../../features/citizens/models/citizen-detail';
import type {
  CitizenListQuery,
  CitizenListResult,
} from '../../features/citizens/models/citizen-list';
import type {
  CitizenEditingData,
  CitizenRegistrationCommand,
  CitizenRegistrationConfiguration,
  CitizenRegistrationResult,
  CitizenUpdateCommand,
} from '../../features/citizens/models/citizen-registration';
import type { LabelRecipient } from '../../features/labels/models/label-print';
import type { TaskStatus } from '../../core/models/task';
import type { VoteEstimate } from '../../core/models/vote-estimate';
import type {
  TaskLabel,
  TaskLabelDraft,
  TaskLabelManagementResult,
} from '../../core/models/task-label';
import type {
  KanbanWorkspace,
  TaskDraft,
  TaskCollaboration,
  KanbanMoveTarget,
} from '../../features/kanban/models/kanban';
import type { TextReference } from '../../core/models/collaboration';
import type {
  ActivityKind,
  ActivityRecord,
} from '../../features/activities/models/activity-detail';
import type { TimelineEntry } from '../../features/activities/models/timeline-entry';
import type {
  Department,
  DepartmentDraft,
  RequestPattern,
  RequestPatternDraft,
  RequestWorkspace,
  RequestEditorDraft,
  RequestAutomationPlan,
  NewRequestComment,
  NewRequestTask,
  RequestAttachment,
} from '../../features/requests/models/request-detail';

import type {
  RequestListQuery,
  RequestListResult,
} from '../../features/requests/models/request-list';

import type { DepartmentOption } from '../../features/requests/models/department-options';
import type { RequestPatternManagementResult } from '../../features/requests/models/request-pattern-management';

export interface CitizenDetailOperations {
  loadCitizenRegistration(): Promise<CitizenRegistrationConfiguration>;
  createCitizen(command: CitizenRegistrationCommand): Promise<CitizenRegistrationResult>;
  loadCitizenForEdit(id: string): Promise<CitizenEditingData | null>;
  updateCitizen(id: string, command: CitizenUpdateCommand): Promise<CitizenRegistrationResult>;
  listTaskLabels(): readonly TaskLabel[];
  loadTaskLabelManagement(query: string): Promise<TaskLabelManagementResult>;
  saveTaskLabel(id: string | null, draft: TaskLabelDraft): Promise<TaskLabel>;
  deleteTaskLabel(id: string): Promise<void>;
  loadRequestList(query: RequestListQuery): RequestListResult;
  loadKanbanWorkspace(): KanbanWorkspace;
  saveKanbanTask(id: string | null, draft: TaskDraft): string;
  loadTaskCollaboration(id: string): TaskCollaboration | null;
  addTaskComment(id: string, text: string, parentId: string | null): void;
  addTaskAttachments(id: string, attachments: readonly RequestAttachment[]): void;
  listTextReferences(): readonly TextReference[];
  moveKanbanTask(id: string, status: TaskStatus): void;
  positionKanbanTask(id: string, target: KanbanMoveTarget, beforeId: string | null): void;
  assignKanbanTaskColumn(id: string, columnId: string | null): void;
  createKanbanColumn(name: string): void;
  loadCitizenList(query: CitizenListQuery): Promise<CitizenListResult>;
  prepareLabelRecipients(citizenIds: readonly string[]): readonly LabelRecipient[];
  loadDetail(citizenId: string): CitizenDetail | null;
  loadActivityDetail(kind: ActivityKind, id: string): ActivityRecord | null;
  saveRequest(id: string | null, draft: RequestEditorDraft): string;
  createRequest(citizenId: string | null, request: NewCitizenRequest): string;
  loadRequestWorkspace(id: string): RequestWorkspace | null;
  listRequestAutomationPlans(
    patternId: string | null,
    requestId?: string,
  ): readonly RequestAutomationPlan[];
  startRequestAutomation(requestId: string, ruleId: string): void;
  loadCitizenTimeline(citizenId: string): readonly TimelineEntry[];
  listDepartments(): readonly Department[];
  searchDepartments(query: string): readonly DepartmentOption[];
  saveDepartment(id: string | null, draft: DepartmentDraft): Department;
  deleteDepartment(id: string): void;
  listRequestPatterns(): readonly RequestPattern[];
  loadRequestPatternManagement(query: string): Promise<RequestPatternManagementResult>;
  saveRequestPattern(id: string | null, draft: RequestPatternDraft): Promise<RequestPattern>;
  deleteRequestPattern(id: string): Promise<void>;
  assignRequestDepartment(requestId: string, departmentId: string): void;
  createAndAssignDepartment(requestId: string, name: string): void;
  assignRequestPattern(requestId: string, patternId: string | null): void;
  addRequestComment(requestId: string, comment: NewRequestComment): void;
  addRequestTask(requestId: string, task: NewRequestTask): string;
  addRequestAttachments(requestId: string, attachments: readonly RequestAttachment[]): void;
  addRequestAwareness(requestId: string, citizenId: string): void;
  removeRequestAwareness(requestId: string, awarenessId: string): void;
  registerRequestContact(requestId: string, contact: NewCitizenInteraction): void;
  setRequestTaskCompleted(requestId: string, taskId: string, completed: boolean): void;
  registerContact(citizenId: string, contact: NewCitizenInteraction): void;
  saveObservations(citizenId: string, text: string): void;
  saveVoteEstimate(citizenId: string, estimate: VoteEstimate | null): void;
  loadCitizenCategories(): Promise<readonly string[]>;
  createCitizenCategory(name: string): Promise<string>;
  addCategory(citizenId: string, name: string): Promise<string>;
  removeCategory(citizenId: string, name: string): Promise<void>;
}
