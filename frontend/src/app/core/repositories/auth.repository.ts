import { InjectionToken } from '@angular/core';
import type { AuthSession } from '../models/auth-session';

export interface AuthRepository {
  observe(listener: (session: AuthSession) => void): () => void;
  signInWithGoogle(): Promise<void>;
  getToken(forceRefresh?: boolean): Promise<string>;
  signOut(): Promise<void>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');
