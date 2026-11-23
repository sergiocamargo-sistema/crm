import { inject, Service } from '@angular/core';
import { INBOX_REPOSITORY } from '../../../core/repositories/inbox-repository';
import type { ComposeMessage } from '../../../core/models/inbox';

import { InboxStore } from '../stores/inbox.store';

@Service()
export class InboxService {
  private readonly repository = inject(INBOX_REPOSITORY);
  readonly store = new InboxStore(
    this.repository.user,
    this.repository.team,
    this.repository.conversations,
  );
  readonly user = this.store.user;
  readonly team = this.store.team;
  readonly conversations = this.store.conversations;
  readonly selectedId = this.store.selectedId;
  readonly query = this.store.query;
  readonly filter = this.store.filter;
  readonly onlyUnread = this.store.onlyUnread;
  readonly connected = this.store.connected;
  readonly availability = this.store.availability;
  readonly selected = this.store.selected;
  readonly counts = this.store.counts;
  readonly filtered = this.store.filtered;

  select(id: string): void {
    this.selectedId.set(id);
    this.repository.markRead(id);
  }

  assume(): void {
    const id = this.selectedId();
    if (this.availability() === 'paused')
      throw new Error('Altere sua disponibilidade para assumir uma conversa.');
    this.repository.assume(id);
  }

  send(command: ComposeMessage): boolean {
    if (command.mode === 'reply' && !this.connected())
      throw new Error('Reconecte o canal antes de responder pelo WhatsApp.');
    return this.repository.send(this.selectedId(), command);
  }

  transfer(staffId: string): void {
    this.repository.transfer(this.selectedId(), staffId);
  }
  close(): void {
    this.repository.close(this.selectedId());
  }

  reset(): void {
    this.repository.reset();
    this.selectedId.set(this.conversations()[0]?.id ?? '');
    this.query.set('');
    this.filter.set('all');
    this.onlyUnread.set(false);
    this.connected.set(true);
    this.availability.set('available');
  }
}
