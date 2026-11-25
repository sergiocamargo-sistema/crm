import { AuthStore } from '../../core/stores/auth.store';
import { Component, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CitizenSearchComponent } from '../../shared/components/citizen-search/citizen-search.component';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgOptimizedImage,
    CitizenSearchComponent,
    NotificationsComponent,
    IconComponent,
  ],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly profile = this.auth.user;

  // Contrato preservado para adaptar o protótipo de conversas quando esse módulo for retomado.
  readonly availability = input<'available' | 'paused'>('available');
  readonly unreadNotifications = input(0);
  readonly availabilityChanged = output<'available' | 'paused'>();
  readonly notificationsRead = output<void>();
  readonly navigationRequested = output<void>();
  readonly helpRequested = output<void>();
}
