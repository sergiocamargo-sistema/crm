import { computed, signal, type Signal } from '@angular/core';
import type {
  Conversation,
  InboxCounts,
  QueueFilter,
  StaffMember,
} from '../../../core/models/inbox';

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export class InboxStore {
  constructor(
    readonly user: StaffMember,
    readonly team: readonly StaffMember[],
    readonly conversations: Signal<readonly Conversation[]>,
  ) {
    this.selectedId.set(conversations()[0]?.id ?? '');
  }

  readonly selectedId = signal('');
  readonly query = signal('');
  readonly filter = signal<QueueFilter>('all');
  readonly onlyUnread = signal(false);
  readonly connected = signal(true);
  readonly availability = signal<'available' | 'paused'>('available');
  readonly selected = computed(
    () =>
      this.conversations().find((conversation) => conversation.id === this.selectedId()) ?? null,
  );
  readonly counts = computed<InboxCounts>(() => ({
    all: this.conversations().length,
    mine: this.conversations().filter(
      (conversation) => conversation.owner?.id === this.user.id && conversation.status === 'active',
    ).length,
    waiting: this.conversations().filter((conversation) => conversation.status === 'waiting')
      .length,
    active: this.conversations().filter((conversation) => conversation.status === 'active').length,
    closed: this.conversations().filter((conversation) => conversation.status === 'closed').length,
    unread: this.conversations().filter((conversation) => conversation.unread > 0).length,
  }));
  readonly filtered = computed(() => {
    const terms = normalize(this.query().trim()).split(/\s+/).filter(Boolean);
    return this.conversations().filter((conversation) => {
      const matchesFilter =
        this.filter() === 'all' ||
        (this.filter() === 'mine' &&
          conversation.owner?.id === this.user.id &&
          conversation.status === 'active') ||
        (this.filter() === 'waiting' && conversation.status === 'waiting');
      const haystack = normalize(
        `${conversation.citizen.name} ${conversation.citizen.neighborhood} ${conversation.preview} ${conversation.request?.protocol ?? ''} ${conversation.request?.title ?? ''}`,
      );
      return (
        matchesFilter &&
        (!this.onlyUnread() || conversation.unread > 0) &&
        terms.every((term) => haystack.includes(term))
      );
    });
  });
}
