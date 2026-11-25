import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../stores/auth.store';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const store = inject(AuthStore);
  const router = inject(Router);
  await auth.ready;
  return (
    store.authorized() ||
    router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    })
  );
};

// A navegação passa primeiro pelos canDeactivate dos formulários existentes.
export const signOutGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (await auth.signOut()) ? router.createUrlTree(['/login']) : false;
};
