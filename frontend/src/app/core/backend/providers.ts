import { inject, type Provider } from '@angular/core';
import { ApiClient } from './api-client';
import { SessionContext } from './session-context';
import type {
  AsyncRepository,
  BackendApi,
  BackendOperation,
} from '../../domain/contracts/backend-api';
import { CITIZEN_DETAIL_REPOSITORY } from '../../features/citizens/repositories/citizen-detail-repository';
import { AUTOMATION_REPOSITORY } from '../../features/automations/repositories/automation-repository';
import { LABEL_PRINT_REPOSITORY } from '../../features/labels/repositories/label-print-repository';
import { REFERRAL_TREE_REPOSITORY } from '../../features/referral-tree/repositories/referral-tree.repository';
import { HOME_MESSAGE_REPOSITORY } from '../../features/home/repositories/home-message.repository';
import { TEAM_REPOSITORY } from '../repositories/team.repository';
import { CITIZEN_SEARCH_REPOSITORY } from '../repositories/citizen-search-repository';
import { WORKSPACE_SYNC_REPOSITORY } from '../repositories/workspace-sync.repository';
import { FILES_REPOSITORY } from '../repositories/files.repository';
import { NOTIFICATIONS_REPOSITORY } from '../repositories/notifications.repository';
import { CachedCitizenSearch } from './citizen-search-cache';

function apiRepository(): AsyncRepository<BackendApi> {
  const client = inject(ApiClient);
  const call = client.call.bind(client) as (
    operation: BackendOperation,
    ...args: readonly unknown[]
  ) => Promise<unknown>;
  return new Proxy({} as AsyncRepository<BackendApi>, {
    get: (_target, key) =>
      typeof key === 'string' && key !== 'then'
        ? (...args: readonly unknown[]) => call(key as BackendOperation, ...args)
        : undefined,
  });
}
/** A aplicação escolhe os contratos aqui; nenhum componente conhece o provedor do banco. */
export const BACKEND_PROVIDERS: Provider[] = [
  {
    provide: WORKSPACE_SYNC_REPOSITORY,
    useFactory: () => {
      const api = inject(ApiClient);
      return { loadVersion: () => api.call('loadWorkspaceVersion') };
    },
  },
  {
    provide: FILES_REPOSITORY,
    useFactory: () => {
      const api = inject(ApiClient);
      return { upload: (file: File) => api.upload(file) };
    },
  },
  {
    provide: NOTIFICATIONS_REPOSITORY,
    useFactory: () => {
      const api = inject(ApiClient);
      return {
        load: () => api.call('loadNotifications'),
        markRead: (id: string) => api.call('markNotificationRead', id),
        markAllRead: () => api.call('markAllNotificationsRead'),
      };
    },
  },
  { provide: CITIZEN_DETAIL_REPOSITORY, useFactory: apiRepository },
  { provide: AUTOMATION_REPOSITORY, useFactory: apiRepository },
  {
    provide: TEAM_REPOSITORY,
    useFactory: () => {
      const session = inject(SessionContext);
      return { load: () => session.require() };
    },
  },
  { provide: CITIZEN_SEARCH_REPOSITORY, useExisting: CachedCitizenSearch },
  {
    provide: LABEL_PRINT_REPOSITORY,
    useFactory: () => {
      const api = inject(ApiClient);
      return {
        loadConfiguration: () => api.call('loadLabelConfiguration'),
        saveTemplate: (...args: Parameters<BackendApi['saveLabelTemplate']>) =>
          api.call('saveLabelTemplate', ...args),
        saveFormat: (...args: Parameters<BackendApi['saveLabelFormat']>) =>
          api.call('saveLabelFormat', ...args),
      };
    },
  },
  {
    provide: REFERRAL_TREE_REPOSITORY,
    useFactory: () => {
      const api = inject(ApiClient);
      return { loadBranch: (id: string | null) => api.call('loadReferralBranch', id) };
    },
  },
  {
    provide: HOME_MESSAGE_REPOSITORY,
    useFactory: () => {
      const api = inject(ApiClient);
      return { loadMessage: () => api.call('loadHomeMessage') };
    },
  },
];
