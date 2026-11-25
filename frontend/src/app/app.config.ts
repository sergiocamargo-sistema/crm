import { environment } from '../environments/environment';
import { MOCK_REPOSITORY_PROVIDERS } from './mocks/providers';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { AUTH_REPOSITORY } from './core/repositories/auth.repository';
import { FirebaseAuthRepository } from './core/repositories/firebase-auth.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: AUTH_REPOSITORY, useClass: FirebaseAuthRepository },
    ...(environment.mockEnabled ? MOCK_REPOSITORY_PROVIDERS : []),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
  ],
};
