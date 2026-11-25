import { DestroyRef, inject, Service } from '@angular/core';
import { AUTH_REPOSITORY } from '../repositories/auth.repository';
import { AuthStore } from '../stores/auth.store';

@Service()
export class AuthService {
  private readonly repository = inject(AUTH_REPOSITORY);
  private readonly store = inject(AuthStore);
  private stopObserving: (() => void) | undefined;
  private resolveReady: () => void = () => {};
  readonly ready = new Promise<void>((resolve) => {
    this.resolveReady = resolve;
  });

  constructor() {
    this.observe();
    inject(DestroyRef).onDestroy(() => this.stopObserving?.());
  }

  async signInWithGoogle(): Promise<void> {
    if (this.store.busy()) return;
    this.store.setAction('sign-in');
    try {
      await this.repository.signInWithGoogle();
    } catch (error: unknown) {
      const code = this.errorCode(error);
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        this.store.setFeedback(
          code === 'auth/popup-blocked'
            ? 'Permita a janela de login do Google no navegador e tente novamente.'
            : code === 'auth/unauthorized-domain'
              ? 'Este endereço ainda precisa ser autorizado nas configurações de login do gabinete.'
              : code === 'auth/operation-not-allowed'
                ? 'O login com Google ainda precisa ser ativado para o gabinete.'
                : 'Não foi possível entrar com o Google. Tente novamente.',
        );
      }
    } finally {
      this.store.setAction(null);
    }
  }

  async signOut(): Promise<boolean> {
    if (this.store.action()) return false;
    this.store.setAction('sign-out');
    try {
      await this.repository.signOut();
      return true;
    } catch {
      this.store.setFeedback('Não foi possível sair da conta. Tente novamente.');
      return false;
    } finally {
      this.store.setAction(null);
    }
  }

  refreshAccess(): void {
    if (this.store.busy()) return;
    this.stopObserving?.();
    this.store.startLoading();
    this.observe();
  }

  private observe(): void {
    this.stopObserving = this.repository.observe((session) => {
      this.store.setSession(session);
      if (session.status !== 'loading') this.resolveReady();
    });
  }

  private errorCode(error: unknown): string | null {
    return typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
      ? error.code
      : null;
  }
}
