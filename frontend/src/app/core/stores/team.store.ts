import { Service, signal } from '@angular/core';
import type { MentionNotification, TeamUser } from '../models/collaboration';

@Service()
export class TeamStore {
  private readonly profile = signal<{ actor: TeamUser; users: readonly TeamUser[] } | null>(null);
  readonly current = this.profile.asReadonly();
  readonly notificationState = signal<readonly MentionNotification[]>([]);
  readonly notifications = this.notificationState.asReadonly();

  setTeam(team: { actor: TeamUser; users: readonly TeamUser[] }): void {
    this.profile.set(team);
  }
}
