import { computed, Service, signal } from '@angular/core';
import type { AuthAction, AuthSession } from '../models/auth-session';

@Service()
export class AuthStore {
  private readonly sessionState = signal<AuthSession>({
    status: 'loading',
    user: null,
    role: null,
    error: null,
  });
  private readonly actionState = signal<AuthAction>(null);
  private readonly feedbackState = signal<string | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.session().user);
  readonly authorized = computed(() => this.session().status === 'authorized');
  readonly loading = computed(() => this.session().status === 'loading');
  readonly action = this.actionState.asReadonly();
  readonly busy = computed(() => this.loading() || this.action() !== null);
  readonly error = computed(() => this.feedbackState() ?? this.session().error);

  setSession(session: AuthSession): void {
    this.sessionState.set(session);
  }

  startLoading(): void {
    this.feedbackState.set(null);
    this.sessionState.update((session) => ({ ...session, status: 'loading', error: null }));
  }

  setAction(action: AuthAction): void {
    this.actionState.set(action);
    if (action) this.feedbackState.set(null);
  }

  setFeedback(message: string | null): void {
    this.feedbackState.set(message);
  }
}
