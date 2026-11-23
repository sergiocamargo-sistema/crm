import { Service, signal } from '@angular/core';
import { CURRENT_USER, MOCK_CONVERSATIONS, TEAM } from '../data/inbox.mock';
import type {
  ActivityItem,
  ComposeMessage,
  Conversation,
  ConversationMessage,
} from '../../core/models/inbox';
import type { InboxRepository } from '../../core/repositories/inbox-repository';

@Service()
export class MockInboxRepository implements InboxRepository {
  private readonly state = signal<readonly Conversation[]>(structuredClone(MOCK_CONVERSATIONS));
  private sequence = 0;
  readonly user = CURRENT_USER;
  readonly team = TEAM.filter((member) => member.id !== CURRENT_USER.id);
  readonly conversations = this.state.asReadonly();

  markRead(id: string): void {
    this.update(id, (conversation) => ({ ...conversation, unread: 0 }));
  }

  assume(id: string): void {
    this.update(id, (conversation) => {
      if (conversation.owner && conversation.owner.id !== CURRENT_USER.id) {
        throw new Error(`Esta conversa está com ${conversation.owner.name}.`);
      }
      return {
        ...conversation,
        owner: CURRENT_USER,
        status: 'active',
        unread: 0,
        activities: [this.activity('Conversa assumida', 'assignment'), ...conversation.activities],
      };
    });
  }

  send(id: string, command: ComposeMessage): boolean {
    const text = command.text.trim();
    if (!text && command.attachments.length === 0) return false;
    this.update(id, (conversation) => {
      this.assertOwner(conversation);
      const time = this.nextTime();
      const message: ConversationMessage = {
        id: `demo-message-${++this.sequence}`,
        kind: command.mode === 'note' ? 'note' : 'outgoing',
        text,
        author: CURRENT_USER.name,
        time,
        sentAt: `2026-11-17T${time}:00-03:00`,
        attachments: structuredClone(command.attachments),
      };
      return {
        ...conversation,
        messages: [...conversation.messages, message],
        preview:
          command.mode === 'reply'
            ? text || `Anexo: ${command.attachments[0]?.name}`
            : conversation.preview,
        time: command.mode === 'reply' ? time : conversation.time,
        activities: [
          this.activity(
            command.mode === 'note'
              ? 'Nota interna adicionada'
              : 'Resposta registrada na demonstração',
            command.mode === 'note' ? 'note' : 'message',
          ),
          ...conversation.activities,
        ],
      };
    });
    return true;
  }

  transfer(id: string, staffId: string): void {
    const staff = TEAM.find((member) => member.id === staffId);
    if (!staff || staff.id === CURRENT_USER.id)
      throw new Error('Selecione outro atendente da equipe.');
    this.update(id, (conversation) => {
      this.assertOwner(conversation);
      return {
        ...conversation,
        owner: staff,
        activities: [
          this.activity(`Transferida para ${staff.name}`, 'assignment'),
          ...conversation.activities,
        ],
      };
    });
  }

  close(id: string): void {
    this.update(id, (conversation) => {
      this.assertOwner(conversation);
      return {
        ...conversation,
        status: 'closed',
        unread: 0,
        activities: [this.activity('Conversa encerrada', 'assignment'), ...conversation.activities],
      };
    });
  }

  reset(): void {
    this.sequence = 0;
    this.state.set(structuredClone(MOCK_CONVERSATIONS));
  }

  private update(id: string, transform: (conversation: Conversation) => Conversation): void {
    if (!this.state().some((conversation) => conversation.id === id))
      throw new Error('Conversa não encontrada.');
    this.state.update((conversations) =>
      conversations.map((conversation) =>
        conversation.id === id ? transform(conversation) : conversation,
      ),
    );
  }

  private assertOwner(conversation: Conversation): void {
    if (conversation.owner?.id !== CURRENT_USER.id || conversation.status !== 'active') {
      throw new Error(
        'Assuma uma conversa disponível antes de responder ou alterar seu atendimento.',
      );
    }
  }

  private nextTime(): string {
    const minutes = 9 * 60 + 42 + Math.floor(this.sequence / 2);
    return `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  }

  private activity(title: string, kind: ActivityItem['kind']): ActivityItem {
    return {
      id: `demo-activity-${++this.sequence}`,
      title,
      kind,
      author: CURRENT_USER.name,
      time: `Hoje, ${this.nextTime()}`,
    };
  }
}
