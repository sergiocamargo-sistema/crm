import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { AppHeaderComponent } from '../app-header/app-header.component';

@Component({
  imports: [RouterOutlet, AppHeaderComponent],
  selector: 'app-authenticated-shell',
  styleUrl: './authenticated-shell.component.scss',
  templateUrl: './authenticated-shell.component.html',
})
export class AuthenticatedShellComponent {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const session = this.auth.session();
      const navigating = this.router.currentNavigation();
      if (session.status !== 'loading' && session.status !== 'authorized' && !navigating) {
        void this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url },
          replaceUrl: true,
        });
      }
    });
  }
}
