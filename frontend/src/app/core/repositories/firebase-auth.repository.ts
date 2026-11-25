import { Service } from '@angular/core';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.config';
import type { AuthSession, AuthUser } from '../models/auth-session';
import type { AuthRepository } from './auth.repository';

interface FirebaseRuntime {
  readonly auth: Auth;
  readonly database: Firestore;
  readonly authSdk: typeof import('firebase/auth');
  readonly firestoreSdk: typeof import('firebase/firestore');
}

@Service()
export class FirebaseAuthRepository implements AuthRepository {
  private runtime: Promise<FirebaseRuntime> | undefined;

  observe(listener: (session: AuthSession) => void): () => void {
    let disposed = false;
    let revision = 0;
    let stopAuth: (() => void) | undefined;
    let stopAccess: (() => void) | undefined;
    let accessTimeout: ReturnType<typeof setTimeout> | undefined;
    const clearAccess = (): void => {
      stopAccess?.();
      stopAccess = undefined;
      clearTimeout(accessTimeout);
      accessTimeout = undefined;
    };

    void this.load()
      .then(({ auth, database, authSdk, firestoreSdk }) => {
        if (disposed) return;
        stopAuth = authSdk.onAuthStateChanged(
          auth,
          (firebaseUser) => {
            clearAccess();
            const currentRevision = ++revision;
            const active = (): boolean => !disposed && revision === currentRevision;
            if (!firebaseUser) {
              listener({ status: 'signed-out', user: null, role: null, error: null });
              return;
            }

            const user = this.userSummary(firebaseUser);
            listener({ status: 'loading', user, role: null, error: null });
            accessTimeout = setTimeout(() => {
              if (active()) listener(this.accessError(user));
            }, 15_000);

            void authSdk
              .getIdTokenResult(firebaseUser)
              .then((token) => {
                if (!active()) return;
                if (!firebaseUser.emailVerified || token.signInProvider !== 'google.com') {
                  clearTimeout(accessTimeout);
                  listener({ status: 'denied', user, role: null, error: null });
                  return;
                }

                stopAccess = firestoreSdk.onSnapshot(
                  firestoreSdk.doc(database, 'teamAccess', user.uid),
                  { includeMetadataChanges: true },
                  (snapshot) => {
                    // A autorização inicial precisa de confirmação do servidor.
                    if (!active() || snapshot.metadata.fromCache) return;
                    clearTimeout(accessTimeout);
                    const access: Record<string, unknown> | undefined = snapshot.data();
                    const role = access?.['role'];
                    const email = access?.['email'];
                    const allowed =
                      snapshot.exists() &&
                      access?.['active'] === true &&
                      typeof email === 'string' &&
                      email.trim().toLowerCase() === user.email.toLowerCase() &&
                      (role === 'admin' || role === 'member');
                    listener({
                      status: allowed ? 'authorized' : 'denied',
                      user,
                      role: allowed && (role === 'admin' || role === 'member') ? role : null,
                      error: null,
                    });
                  },
                  () => {
                    if (!active()) return;
                    clearTimeout(accessTimeout);
                    listener(this.accessError(user));
                  },
                );
              })
              .catch(() => {
                if (!active()) return;
                clearTimeout(accessTimeout);
                listener(this.accessError(user));
              });
          },
          () => {
            if (!disposed) {
              ++revision;
              clearAccess();
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
      stopAuth?.();
      clearAccess();
    };
  }

  async signInWithGoogle(): Promise<void> {
    const { auth, authSdk } = await this.load();
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await authSdk.signInWithPopup(auth, provider);
  }

  async signOut(): Promise<void> {
    const { auth, authSdk } = await this.load();
    await authSdk.signOut(auth);
  }

  private load(): Promise<FirebaseRuntime> {
    this.runtime ??= (async () => {
      const [appSdk, authSdk, firestoreSdk] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);
      const app =
        appSdk.getApps().find((item) => item.name === 'gabinete-crm') ??
        appSdk.initializeApp(firebaseConfig, 'gabinete-crm');
      const auth = authSdk.getAuth(app);
      auth.languageCode = 'pt-BR';
      await authSdk.setPersistence(auth, authSdk.browserSessionPersistence);
      return { auth, database: firestoreSdk.getFirestore(app), authSdk, firestoreSdk };
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
        .toLocaleUpperCase('pt-BR'),
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
