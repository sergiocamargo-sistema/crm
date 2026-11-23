export interface TeamUser {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly initials: string;
}
export interface MentionNotification {
  readonly id: string;
  readonly recipientId: string;
  readonly actor: string;
  readonly taskId: string;
  readonly taskTitle: string;
  readonly commentId: string | null;
  readonly createdAt: string;
  readonly readAt: string | null;
}
export interface TextReference {
  readonly id: string;
  readonly kind: 'citizen' | 'request' | 'interaction' | 'conversation' | 'appointment' | 'task';
  readonly title: string;
  readonly href: string;
}
export type RichTextPart =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'mention'; readonly text: string; readonly userId: string }
  | {
      readonly kind: 'link';
      readonly text: string;
      readonly href: string;
      readonly internal: boolean;
    };

export const userMentionPattern = (): RegExp =>
  /(?<![\p{L}\p{N}._@/])@([a-z0-9](?:[a-z0-9._-]*[a-z0-9])?)/giu;
