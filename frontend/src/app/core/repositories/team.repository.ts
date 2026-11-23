import { InjectionToken } from '@angular/core';
import type { TeamUser } from '../models/collaboration';

export interface TeamRepository {
  load(): { readonly actor: TeamUser; readonly users: readonly TeamUser[] };
}

export const TEAM_REPOSITORY = new InjectionToken<TeamRepository>('TeamRepository');
