import { DatePipe } from '@angular/common';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { CitizenDetail } from '../../models/citizen-detail';
import { RouterLink } from '@angular/router';
import { interactionDetailRoute } from '../../../activities/models/activity-detail';

type ActivitySection = 'requests' | 'interactions' | 'conversations' | 'appointments';

@Component({
  imports: [DatePipe, IconComponent, RouterLink],
  selector: 'app-citizen-activity-shortcuts',
  styleUrl: './citizen-activity-shortcuts.component.scss',
  templateUrl: './citizen-activity-shortcuts.component.html',
})
export class CitizenActivityShortcutsComponent {
  readonly citizen = input.required<CitizenDetail>();
  protected readonly detailRoute = interactionDetailRoute;
  protected readonly conversations = computed(() =>
    this.citizen().interactions.filter((item) => !!item.conversation),
  );
  protected readonly selected = linkedSignal({
    source: () => this.citizen().id,
    computation: (): ActivitySection | null => null,
  });
  protected readonly pendingRequests = computed(
    () => this.citizen().requests.filter((request) => request.status === 'pending').length,
  );
  protected readonly completedRequests = computed(
    () => this.citizen().requests.filter((request) => request.status === 'completed').length,
  );
  protected readonly requestsLabel = computed(
    () =>
      `Solicitações: ${this.pendingRequests()} pendentes e ${this.completedRequests()} finalizadas`,
  );

  protected toggle(section: ActivitySection): void {
    this.selected.update((current) => (current === section ? null : section));
  }
}
