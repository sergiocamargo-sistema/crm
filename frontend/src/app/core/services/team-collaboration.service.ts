import { TEAM_REPOSITORY } from '../repositories/team.repository';
import { NOTIFICATIONS_REPOSITORY } from '../repositories/notifications.repository';
import { TeamStore } from '../stores/team.store';
import { DestroyRef, effect, inject, Service, signal } from '@angular/core';
import { RemoteReadStore } from '../stores/read-store';
import { SessionContext } from '../backend/session-context';
import { DataConnection } from '../backend/data-connection';

@Service()
export class TeamCollaborationService {
  private readonly store = inject(TeamStore);
  private readonly repository = inject(TEAM_REPOSITORY);
  private readonly notificationsRepository = inject(NOTIFICATIONS_REPOSITORY);
  private readonly session = inject(SessionContext);
  private readonly connection = inject(DataConnection);
  get users() {
    return this.repository.load().users;
  }
  get actor() {
    return this.repository.load().actor;
  }
  private readonly notificationTick = signal(0);
  readonly notifications = new RemoteReadStore(() => {
    this.notificationTick();
    return this.notificationsRepository.load();
  }, []).state;
  readonly recipient = signal({ userId: this.actor.id });

  constructor() {
    effect(() => {
      const profile = this.session.profile();
      if (profile) {
        this.store.setTeam(profile);
        this.recipient.set({ userId: profile.actor.id });
      }
    });
    const timer = setInterval(() => {
      if (this.session.profile() && document.visibilityState === 'visible')
        this.notificationTick.update((value) => value + 1);
    }, 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  assigneeNames(ids: readonly string[]): string[] {
    return ids.flatMap((id) => {
      const user = this.users.find((item) => item.id === id);
      return user ? [user.name] : [];
    });
  }
  validateAssignees(ids: readonly string[]): readonly string[] {
    const unique = [...new Set(ids)];
    if (!unique.length || unique.some((id) => !this.users.some((user) => user.id === id)))
      throw new Error('Selecione pelo menos um responsável da equipe.');
    return unique;
  }
  async markRead(id: string): Promise<void> {
    try {
      await this.notificationsRepository.markRead(id);
    } catch (error) {
      this.connection.error.set(
        error instanceof Error ? error.message : 'Não foi possível marcar a notificação.',
      );
    }
  }
  async markAllRead(): Promise<void> {
    try {
      await this.notificationsRepository.markAllRead();
    } catch (error) {
      this.connection.error.set(
        error instanceof Error ? error.message : 'Não foi possível marcar as notificações.',
      );
    }
  }
}
