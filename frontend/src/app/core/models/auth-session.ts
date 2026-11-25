export type TeamAccessRole = 'admin' | 'member';

export interface AuthUser {
  readonly uid: string;
  readonly name: string;
  readonly email: string;
  readonly initials: string;
}

export interface AuthSession {
  readonly status: 'loading' | 'signed-out' | 'authorized' | 'denied' | 'error';
  readonly user: AuthUser | null;
  readonly role: TeamAccessRole | null;
  readonly error: string | null;
}

export type AuthAction = 'sign-in' | 'sign-out' | null;
