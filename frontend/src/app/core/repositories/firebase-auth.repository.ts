import { inject, Service } from '@angular/core';
import type { Auth, User } from 'firebase/auth';
import { firebaseApplication } from '../backend/firebase-app';
import { AppCheckTokenProvider } from '../backend/app-check-token';
import { backendConfig } from '../config/backend.config';
import { SessionContext } from '../backend/session-context';
import type { TeamProfile } from '../../domain/contracts/backend-api';
import type { AuthSession, AuthUser, TeamAccessRole } from '../models/auth-session';
import type { AuthRepository } from './auth.repository';

interface FirebaseRuntime {
  readonly auth: Auth;
  readonly sdk: typeof import('firebase/auth');
}
@Service()
export class FirebaseAuthRepository implements AuthRepository {
  private readonly session = inject(SessionContext);
  private readonly appCheck = inject(AppCheckTokenProvider);
  private runtime: Promise<FirebaseRuntime> | undefined;
  observe(listener: (session: AuthSession) => void): () => void {
    let disposed = false;
    let revision = 0;
    let stop: (() => void) | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    void this.load()
      .then(({ auth, sdk }) => {
        if (disposed) return;
        stop = sdk.onIdTokenChanged(
          auth,
          (firebaseUser) => {
            clearInterval(timer);
            const current = ++revision;
            const active = (): boolean => !disposed && current === revision;
            if (this.session.profile()?.actor.id !== firebaseUser?.uid) this.session.set(null);
            if (!firebaseUser) {
              listener({ status: 'signed-out', user: null, role: null, error: null });
              return;
            }
            const user = this.userSummary(firebaseUser);
            if (!this.session.profile())
              listener({ status: 'loading', user, role: null, error: null });
            let checking = false;
            const confirm = async (): Promise<void> => {
              if (checking) return;
              checking = true;
              try {
                const [token, appToken] = await Promise.all([
                  firebaseUser.getIdToken(),
                  this.appCheck.token(),
                ]);
                const response = await fetch(`${backendConfig.url}/v1/session`, {
                  headers: { Authorization: `Bearer ${token}`, 'X-Firebase-AppCheck': appToken },
                  cache: 'no-store',
                  signal: AbortSignal.timeout(15_000),
                });
                if (!active()) return;
                if (response.status === 401 || response.status === 403) {
                  this.session.set(null);
                  listener({ status: 'denied', user, role: null, error: null });
                  return;
                }
                if (!response.ok) throw new Error('Falha ao confirmar o acesso.');
                const data = (await response.json()) as {
                  role: TeamAccessRole;
                  profile: TeamProfile;
                };
                if (!active()) return;
                if (!['admin', 'member'].includes(data.role) || data.profile.actor.id !== user.uid)
                  throw new Error('Sessão inválida.');
                // Não recriar stores em cada confirmação periódica sem mudança no perfil.
                if (JSON.stringify(this.session.profile()) !== JSON.stringify(data.profile))
                  this.session.set(data.profile);
                listener({ status: 'authorized', user, role: data.role, error: null });
              } catch {
                if (active()) {
                  this.session.set(null);
                  listener(this.accessError(user));
                }
              } finally {
                checking = false;
              }
            };
            void confirm();
            timer = setInterval(() => {
              if (document.visibilityState === 'visible') void confirm();
            }, 60_000);
          },
          () => {
            if (!disposed) {
              this.session.set(null);
              listener(this.accessError(null));
            }
          },
        );
      })
      .catch(() => {
        if (!disposed) listener(this.accessError(null));
      });
    return () => {
      disposed = true;
      ++revision;
      stop?.();
      clearInterval(timer);
    };
  }
  async getToken(forceRefresh = false): Promise<string> {
    const { auth } = await this.load();
    if (!auth.currentUser) throw new Error('Entre novamente para continuar.');
    return auth.currentUser.getIdToken(forceRefresh);
  }
  async signInWithGoogle(): Promise<void> {
    const { auth, sdk } = await this.load();
    const provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await sdk.signInWithPopup(auth, provider);
  }
  async signOut(): Promise<void> {
    const { auth, sdk } = await this.load();
    await sdk.signOut(auth);
    this.session.set(null);
  }
  private load(): Promise<FirebaseRuntime> {
    this.runtime ??= (async () => {
      const [app, sdk] = await Promise.all([firebaseApplication(), import('firebase/auth')]);
      const auth = sdk.getAuth(app);
      auth.languageCode = 'pt-BR';
      await sdk.setPersistence(auth, sdk.browserSessionPersistence);
      return { auth, sdk };
    })().catch((error: unknown) => {
      this.runtime = undefined;
      throw error;
    });
    return this.runtime;
  }
  private userSummary(user: User): AuthUser {
    const name = user.displayName?.trim() || user.email?.split('@')[0] || 'Usuário';
    const parts = name.split(/\s+/u);
    return {
      uid: user.uid,
      name,
      email: user.email ?? '',
      initials: [parts[0], ...(parts.length > 1 ? [parts.at(-1)] : [])]
        .map((part) => part?.[0] ?? '')
        .join('')
        .toUpperCase(),
    };
  }
  private accessError(user: AuthUser | null): AuthSession {
    return {
      status: 'error',
      user,
      role: null,
      error: 'Não foi possível confirmar seu acesso. Verifique a conexão e tente novamente.',
    };
  }
}
