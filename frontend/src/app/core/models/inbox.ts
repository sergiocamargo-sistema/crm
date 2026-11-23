import type { Signal } from '@angular/core';

export type ConversationStatus = 'waiting' | 'active' | 'closed';
export type QueueFilter = 'all' | 'mine' | 'waiting';
export type MessageMode = 'reply' | 'note';
export type AvatarColor = 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'slate';

export interface StaffMember {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export interface Citizen {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly color: AvatarColor;
  readonly neighborhood: string;
  readonly phone: string;
  readonly address: string;
  readonly age: number;
  readonly classifications: readonly string[];
  readonly observations: string;
  readonly lastContact: string;
  readonly totalRequests: number;
}

export interface MessageAttachment {
  readonly id: string;
  readonly name: string;
  readonly sizeLabel: string;
  readonly mimeType: string;
}

export interface ConversationMessage {
  readonly id: string;
  readonly kind: 'incoming' | 'outgoing' | 'note';
  readonly text: string;
  readonly author: string;
  readonly time: string;
  readonly sentAt: string;
  readonly attachments: readonly MessageAttachment[];
}

export interface CaseSummary {
  readonly protocol: string;
  readonly title: string;
  readonly category: string;
  readonly status: string;
  readonly openedAt: string;
  readonly responsible: string;
  readonly nextAction: string;
  readonly dueAt: string;
}

export interface ActivityItem {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly time: string;
  readonly kind: 'message' | 'assignment' | 'request' | 'note';
}

export interface Conversation {
  readonly id: string;
  readonly citizen: Citizen;
  readonly status: ConversationStatus;
  readonly owner: StaffMember | null;
  readonly preview: string;
  readonly time: string;
  readonly unread: number;
  readonly waitingSince: string;
  readonly messages: readonly ConversationMessage[];
  readonly request: CaseSummary | null;
  readonly activities: readonly ActivityItem[];
  readonly suggestedReply: string;
}

export interface ComposeMessage {
  readonly text: string;
  readonly mode: MessageMode;
  readonly attachments: readonly MessageAttachment[];
}

export interface InboxCounts {
  readonly all: number;
  readonly mine: number;
  readonly waiting: number;
  readonly active: number;
  readonly closed: number;
  readonly unread: number;
}

export interface InboxDataSource {
  readonly conversations: Signal<readonly Conversation[]>;
}

export interface ComposerDraft {
  readonly text: string;
  readonly mode: MessageMode;
  readonly attachments: readonly MessageAttachment[];
}

export const EMPTY_DRAFT: ComposerDraft = { text: '', mode: 'reply', attachments: [] };
