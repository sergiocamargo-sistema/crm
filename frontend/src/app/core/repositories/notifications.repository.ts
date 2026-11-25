import { InjectionToken } from '@angular/core';
import type { MentionNotification } from '../models/collaboration';
export interface NotificationsRepository {
  load(): Promise<readonly MentionNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}
export const NOTIFICATIONS_REPOSITORY = new InjectionToken<NotificationsRepository>(
  'NotificationsRepository',
);
