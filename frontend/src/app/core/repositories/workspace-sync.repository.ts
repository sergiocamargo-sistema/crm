import { InjectionToken } from '@angular/core';
export interface WorkspaceVersion {
  readonly epoch: string;
  readonly revision: number;
}
export interface WorkspaceSyncRepository {
  loadVersion(): Promise<WorkspaceVersion>;
}
export const WORKSPACE_SYNC_REPOSITORY = new InjectionToken<WorkspaceSyncRepository>(
  'WorkspaceSyncRepository',
);
