import { TeamCollaborationService } from '../../core/services/team-collaboration.service';
import { TeamStore } from '../../core/stores/team.store';
import { Component, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CitizenSearchComponent } from '../../shared/components/citizen-search/citizen-search.component';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgOptimizedImage, CitizenSearchComponent, NotificationsComponent],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  protected readonly profile = inject(TeamStore).current;

  constructor() {
    inject(TeamCollaborationService);
  }

  // Contrato preservado para adaptar o protótipo de conversas quando esse módulo for retomado.
  readonly availability = input<'available' | 'paused'>('available');
  readonly unreadNotifications = input(0);
  readonly availabilityChanged = output<'available' | 'paused'>();
  readonly notificationsRead = output<void>();
  readonly navigationRequested = output<void>();
  readonly helpRequested = output<void>();
}
