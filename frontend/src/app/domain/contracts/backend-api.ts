import type { CitizenDetailOperations } from './citizen-operations';
import type { AutomationOperations } from './automation-operations';
import type {
  LabelConfiguration,
  LabelFormat,
  LabelTemplate,
} from '../../features/labels/models/label-print';
import type { ReferralTreeBranch } from '../../features/referral-tree/models/referral-tree';
import type { MentionNotification, TeamUser } from '../../core/models/collaboration';
import type { CitizenSearchResult } from '../../core/models/citizen-summary';

export interface TeamProfile {
  readonly actor: TeamUser;
  readonly users: readonly TeamUser[];
}

export interface SearchCachePage {
  readonly epoch: string;
  readonly revision: number;
  readonly reset: boolean;
  readonly records: readonly (CitizenSearchResult & { readonly searchText: string })[];
  readonly removedIds: readonly string[];
  readonly nextPage: string | null;
}

export interface BackendApi extends CitizenDetailOperations, AutomationOperations {
  searchCitizens(query: string, limit: number): readonly CitizenSearchResult[];
  loadWorkspaceVersion(): { readonly epoch: string; readonly revision: number };
  loadTeam(): TeamProfile;
  loadLabelConfiguration(): LabelConfiguration;
  saveLabelTemplate(template: LabelTemplate, asNew: boolean): LabelTemplate;
  saveLabelFormat(format: LabelFormat): LabelFormat;
  loadReferralBranch(id: string | null): ReferralTreeBranch | null;
  loadNotifications(): readonly MentionNotification[];
  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;
  loadHomeMessage(): string;
  syncCitizenSearch(epoch: string | null, revision: number, page: string | null): SearchCachePage;
}

export type BackendOperation = keyof BackendApi;
export type AsyncRepository<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : never;
};

export type ApiInvocation = {
  [K in BackendOperation]: {
    readonly operation: K;
    readonly args: Parameters<BackendApi[K]>;
    readonly requestId: string;
  };
}[BackendOperation];

export interface ApiResult<T> {
  readonly result: T;
  readonly revision: number;
}
