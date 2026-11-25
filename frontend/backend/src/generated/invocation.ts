// Gerado de BackendApi e seus contratos. Não editar manualmente.
import type {
  CitizenDetail,
  NewCitizenInteraction,
  NewCitizenRequest,
} from '../../../src/app/features/citizens/models/citizen-detail';
import type {
  CitizenListQuery,
  CitizenListResult,
} from '../../../src/app/features/citizens/models/citizen-list';
import type {
  CitizenEditingData,
  CitizenRegistrationCommand,
  CitizenRegistrationConfiguration,
  CitizenRegistrationResult,
  CitizenUpdateCommand,
} from '../../../src/app/features/citizens/models/citizen-registration';
import type {
  LabelRecipient,
  LabelConfiguration,
  LabelFormat,
  LabelTemplate,
} from '../../../src/app/features/labels/models/label-print';
import type { TaskStatus } from '../../../src/app/core/models/task';
import type { CabinetRating } from '../../../src/app/core/models/cabinet-rating';
import type {
  TaskLabel,
  TaskLabelDraft,
  TaskLabelManagementResult,
} from '../../../src/app/core/models/task-label';
import type {
  KanbanWorkspace,
  TaskDraft,
  TaskCollaboration,
  KanbanMoveTarget,
} from '../../../src/app/features/kanban/models/kanban';
import type {
  TextReference,
  MentionNotification,
  TeamUser,
} from '../../../src/app/core/models/collaboration';
import type {
  ActivityKind,
  ActivityRecord,
} from '../../../src/app/features/activities/models/activity-detail';
import type { TimelineEntry } from '../../../src/app/features/activities/models/timeline-entry';
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
} from '../../../src/app/features/requests/models/request-detail';
import type {
  RequestListQuery,
  RequestListResult,
} from '../../../src/app/features/requests/models/request-list';
import type { DepartmentOption } from '../../../src/app/features/requests/models/department-options';
import type { RequestPatternManagementResult } from '../../../src/app/features/requests/models/request-pattern-management';
import type {
  AutomationRule,
  AutomationRuleDraft,
  AutomationWorkspace,
  TaskSet,
  TaskSetDraft,
  TaskTemplate,
  TaskTemplateDraft,
} from '../../../src/app/features/automations/models/automation';
import type { CitizenDetailOperations } from '../../../src/app/domain/contracts/citizen-operations';
import type { AutomationOperations } from '../../../src/app/domain/contracts/automation-operations';
import type { ReferralTreeBranch } from '../../../src/app/features/referral-tree/models/referral-tree';
import type { CitizenSearchResult } from '../../../src/app/core/models/citizen-summary';
export type ConcreteInvocation =
  | { readonly operation: 'loadCitizenRegistration'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'createCitizen';
      readonly requestId: string;
      readonly args: [command: CitizenRegistrationCommand];
    }
  | {
      readonly operation: 'loadCitizenForEdit';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | {
      readonly operation: 'updateCitizen';
      readonly requestId: string;
      readonly args: [id: string, command: CitizenUpdateCommand];
    }
  | { readonly operation: 'listTaskLabels'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'loadTaskLabelManagement';
      readonly requestId: string;
      readonly args: [query: string];
    }
  | {
      readonly operation: 'saveTaskLabel';
      readonly requestId: string;
      readonly args: [id: string | null, draft: TaskLabelDraft];
    }
  | {
      readonly operation: 'deleteTaskLabel';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | {
      readonly operation: 'loadRequestList';
      readonly requestId: string;
      readonly args: [query: RequestListQuery];
    }
  | { readonly operation: 'loadKanbanWorkspace'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'saveKanbanTask';
      readonly requestId: string;
      readonly args: [id: string | null, draft: TaskDraft];
    }
  | {
      readonly operation: 'loadTaskCollaboration';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | {
      readonly operation: 'addTaskComment';
      readonly requestId: string;
      readonly args: [id: string, text: string, parentId: string | null];
    }
  | {
      readonly operation: 'addTaskAttachments';
      readonly requestId: string;
      readonly args: [id: string, attachments: readonly RequestAttachment[]];
    }
  | { readonly operation: 'listTextReferences'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'moveKanbanTask';
      readonly requestId: string;
      readonly args: [id: string, status: TaskStatus];
    }
  | {
      readonly operation: 'positionKanbanTask';
      readonly requestId: string;
      readonly args: [id: string, target: KanbanMoveTarget, beforeId: string | null];
    }
  | {
      readonly operation: 'assignKanbanTaskColumn';
      readonly requestId: string;
      readonly args: [id: string, columnId: string | null];
    }
  | {
      readonly operation: 'createKanbanColumn';
      readonly requestId: string;
      readonly args: [name: string];
    }
  | {
      readonly operation: 'loadCitizenList';
      readonly requestId: string;
      readonly args: [query: CitizenListQuery];
    }
  | {
      readonly operation: 'prepareLabelRecipients';
      readonly requestId: string;
      readonly args: [citizenIds: readonly string[]];
    }
  | {
      readonly operation: 'loadDetail';
      readonly requestId: string;
      readonly args: [citizenId: string];
    }
  | {
      readonly operation: 'loadActivityDetail';
      readonly requestId: string;
      readonly args: [kind: ActivityKind, id: string];
    }
  | {
      readonly operation: 'saveRequest';
      readonly requestId: string;
      readonly args: [id: string | null, draft: RequestEditorDraft];
    }
  | {
      readonly operation: 'createRequest';
      readonly requestId: string;
      readonly args: [citizenId: string | null, request: NewCitizenRequest];
    }
  | {
      readonly operation: 'loadRequestWorkspace';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | {
      readonly operation: 'listRequestAutomationPlans';
      readonly requestId: string;
      readonly args: [patternId: string | null, requestId?: string];
    }
  | {
      readonly operation: 'startRequestAutomation';
      readonly requestId: string;
      readonly args: [requestId: string, ruleId: string];
    }
  | {
      readonly operation: 'loadCitizenTimeline';
      readonly requestId: string;
      readonly args: [citizenId: string];
    }
  | { readonly operation: 'listDepartments'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'searchDepartments';
      readonly requestId: string;
      readonly args: [query: string];
    }
  | {
      readonly operation: 'saveDepartment';
      readonly requestId: string;
      readonly args: [id: string | null, draft: DepartmentDraft];
    }
  | {
      readonly operation: 'deleteDepartment';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | { readonly operation: 'listRequestPatterns'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'loadRequestPatternManagement';
      readonly requestId: string;
      readonly args: [query: string];
    }
  | {
      readonly operation: 'saveRequestPattern';
      readonly requestId: string;
      readonly args: [id: string | null, draft: RequestPatternDraft];
    }
  | {
      readonly operation: 'deleteRequestPattern';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | {
      readonly operation: 'assignRequestDepartment';
      readonly requestId: string;
      readonly args: [requestId: string, departmentId: string];
    }
  | {
      readonly operation: 'createAndAssignDepartment';
      readonly requestId: string;
      readonly args: [requestId: string, name: string];
    }
  | {
      readonly operation: 'assignRequestPattern';
      readonly requestId: string;
      readonly args: [requestId: string, patternId: string | null];
    }
  | {
      readonly operation: 'addRequestComment';
      readonly requestId: string;
      readonly args: [requestId: string, comment: NewRequestComment];
    }
  | {
      readonly operation: 'addRequestTask';
      readonly requestId: string;
      readonly args: [requestId: string, task: NewRequestTask];
    }
  | {
      readonly operation: 'addRequestAttachments';
      readonly requestId: string;
      readonly args: [requestId: string, attachments: readonly RequestAttachment[]];
    }
  | {
      readonly operation: 'addRequestAwareness';
      readonly requestId: string;
      readonly args: [requestId: string, citizenId: string];
    }
  | {
      readonly operation: 'removeRequestAwareness';
      readonly requestId: string;
      readonly args: [requestId: string, awarenessId: string];
    }
  | {
      readonly operation: 'registerRequestContact';
      readonly requestId: string;
      readonly args: [requestId: string, contact: NewCitizenInteraction];
    }
  | {
      readonly operation: 'setRequestTaskCompleted';
      readonly requestId: string;
      readonly args: [requestId: string, taskId: string, completed: boolean];
    }
  | {
      readonly operation: 'registerContact';
      readonly requestId: string;
      readonly args: [citizenId: string, contact: NewCitizenInteraction];
    }
  | {
      readonly operation: 'saveObservations';
      readonly requestId: string;
      readonly args: [citizenId: string, text: string];
    }
  | {
      readonly operation: 'saveCabinetRating';
      readonly requestId: string;
      readonly args: [citizenId: string, rating: CabinetRating | null];
    }
  | { readonly operation: 'loadCitizenCategories'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'createCitizenCategory';
      readonly requestId: string;
      readonly args: [name: string];
    }
  | {
      readonly operation: 'addCategory';
      readonly requestId: string;
      readonly args: [citizenId: string, name: string];
    }
  | {
      readonly operation: 'removeCategory';
      readonly requestId: string;
      readonly args: [citizenId: string, name: string];
    }
  | {
      readonly operation: 'loadAutomationWorkspace';
      readonly requestId: string;
      readonly args: [query: string];
    }
  | {
      readonly operation: 'saveAutomationTemplate';
      readonly requestId: string;
      readonly args: [id: string | null, version: number | null, draft: TaskTemplateDraft];
    }
  | {
      readonly operation: 'deleteAutomationTemplate';
      readonly requestId: string;
      readonly args: [id: string, version: number];
    }
  | {
      readonly operation: 'saveAutomationSet';
      readonly requestId: string;
      readonly args: [id: string | null, version: number | null, draft: TaskSetDraft];
    }
  | {
      readonly operation: 'deleteAutomationSet';
      readonly requestId: string;
      readonly args: [id: string, version: number];
    }
  | {
      readonly operation: 'saveAutomationRule';
      readonly requestId: string;
      readonly args: [id: string | null, version: number | null, draft: AutomationRuleDraft];
    }
  | {
      readonly operation: 'deleteAutomationRule';
      readonly requestId: string;
      readonly args: [id: string, version: number];
    }
  | {
      readonly operation: 'retryAutomationRun';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | {
      readonly operation: 'searchCitizens';
      readonly requestId: string;
      readonly args: [query: string, limit: number];
    }
  | { readonly operation: 'loadWorkspaceVersion'; readonly requestId: string; readonly args: [] }
  | { readonly operation: 'loadTeam'; readonly requestId: string; readonly args: [] }
  | { readonly operation: 'loadLabelConfiguration'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'saveLabelTemplate';
      readonly requestId: string;
      readonly args: [template: LabelTemplate, asNew: boolean];
    }
  | {
      readonly operation: 'saveLabelFormat';
      readonly requestId: string;
      readonly args: [format: LabelFormat];
    }
  | {
      readonly operation: 'loadReferralBranch';
      readonly requestId: string;
      readonly args: [id: string | null];
    }
  | { readonly operation: 'loadNotifications'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'markNotificationRead';
      readonly requestId: string;
      readonly args: [id: string];
    }
  | {
      readonly operation: 'markAllNotificationsRead';
      readonly requestId: string;
      readonly args: [];
    }
  | { readonly operation: 'loadHomeMessage'; readonly requestId: string; readonly args: [] }
  | {
      readonly operation: 'syncCitizenSearch';
      readonly requestId: string;
      readonly args: [epoch: string | null, revision: number, page: string | null];
    };
