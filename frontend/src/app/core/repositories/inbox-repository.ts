import { InjectionToken } from '@angular/core';
import type { ComposeMessage, InboxDataSource, StaffMember } from '../models/inbox';

export interface InboxRepository extends InboxDataSource {
  readonly user: StaffMember;
  readonly team: readonly StaffMember[];
  markRead(conversationId: string): void;
  assume(conversationId: string): void;
  send(conversationId: string, message: ComposeMessage): boolean;
  transfer(conversationId: string, staffId: string): void;
  close(conversationId: string): void;
  reset(): void;
}

export const INBOX_REPOSITORY = new InjectionToken<InboxRepository>('InboxRepository');
