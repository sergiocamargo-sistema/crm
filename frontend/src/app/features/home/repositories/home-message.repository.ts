import { InjectionToken } from '@angular/core';

export interface HomeMessageRepository {
  loadMessage(): string;
}

export const HOME_MESSAGE_REPOSITORY = new InjectionToken<HomeMessageRepository>(
  'HomeMessageRepository',
);
