import { TEAM_REPOSITORY } from '../repositories/team.repository';
import { TeamStore } from '../stores/team.store';
import { inject, Service, signal } from '@angular/core';
import { userMentionPattern, type MentionNotification } from '../models/collaboration';

@Service()
export class TeamCollaborationService {
  private readonly store = inject(TeamStore);
  private readonly repository = inject(TEAM_REPOSITORY);
  private readonly profile = this.repository.load();
  readonly users = this.profile.users;
  readonly actor = this.profile.actor;
  readonly notifications = this.store.notifications;
  readonly recipient = signal({ userId: this.actor.id });

  constructor() {
    this.store.setTeam(this.profile);
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

  notifyMentions(
    previousText: string,
    text: string,
    context: {
      readonly taskId: string;
      readonly taskTitle: string;
      readonly commentId?: string;
    },
  ): void {
    const handles = (value: string): Set<string> =>
      new Set(
        [
          ...value
            .replace(
              /https?:\/\/\S+|\/(?:municipes|solicitacoes|interacoes|conversas|agendamentos)\/\S+|\/kanban\?\S+/giu,
              ' ',
            )
            .matchAll(userMentionPattern()),
        ].map((match) => match[1].toLocaleLowerCase('en-US')),
      );
    const previous = handles(previousText);
    const current = handles(text);
    const notifications = this.users
      .filter((user) => current.has(user.handle) && !previous.has(user.handle))
      .map((user): MentionNotification => ({
        id: crypto.randomUUID(),
        recipientId: user.id,
        actor: this.actor.name,
        taskId: context.taskId,
        taskTitle: context.taskTitle,
        commentId: context.commentId ?? null,
        createdAt: new Date().toISOString(),
        readAt: null,
      }));
    if (notifications.length)
      this.store.notificationState.update((items) => [...notifications, ...items]);
  }
  markRead(id: string): void {
    const recipientId = this.recipient().userId;
    this.store.notificationState.update((items) =>
      items.map((item) =>
        item.id === id && item.recipientId === recipientId && !item.readAt
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ),
    );
  }
  markAllRead(): void {
    const recipientId = this.recipient().userId;
    this.store.notificationState.update((items) =>
      items.map((item) =>
        item.recipientId === recipientId && !item.readAt
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ),
    );
  }
}
