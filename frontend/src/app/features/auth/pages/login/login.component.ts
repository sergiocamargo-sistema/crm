import { NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthStore } from '../../../../core/stores/auth.store';

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  protected readonly auth = inject(AuthService);
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');

  constructor() {
    afterNextRender(() => this.heading()?.nativeElement.focus());
    effect(() => {
      if (this.store.authorized()) {
        void this.router.navigateByUrl(this.returnUrl(), { replaceUrl: true });
      }
    });
  }

  private returnUrl(): string {
    const value = this.route.snapshot.queryParamMap.get('returnUrl');
    if (!value?.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/u.test(value))
      return '/';
    try {
      const parsed = this.router.parseUrl(value);
      const firstSegment = parsed.root.children['primary']?.segments[0]?.path;
      return firstSegment === 'login' || firstSegment === 'sair' ? '/' : value;
    } catch {
      return '/';
    }
  }
}
