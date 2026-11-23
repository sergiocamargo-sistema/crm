import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import type { Conversation, InboxCounts, QueueFilter } from '../../../../core/models/inbox';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-conversation-list',
  imports: [IconComponent],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss',
})
export class ConversationListComponent {
  readonly conversations = input.required<readonly Conversation[]>();
  readonly counts = input.required<InboxCounts>();
  readonly selectedId = input.required<string>();
  readonly currentUserId = input.required<string>();
  readonly connected = input(true);
  readonly query = input('');
  readonly filter = input<QueueFilter>('all');
  readonly onlyUnread = input(false);
  readonly queryChanged = output<string>();
  readonly filterChanged = output<QueueFilter>();
  readonly unreadChanged = output<boolean>();
  readonly conversationSelected = output<string>();
  readonly clearFilters = output<void>();
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  protected readonly filters: readonly { value: QueueFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'mine', label: 'Minhas' },
    { value: 'waiting', label: 'Aguardando' },
  ];
  focusSearch(): void {
    this.searchInput().nativeElement.focus();
  }
}
