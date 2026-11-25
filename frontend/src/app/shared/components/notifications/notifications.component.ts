import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamCollaborationService } from '../../../core/services/team-collaboration.service';
import { IconComponent } from '../icon/icon.component';
@Component({
  selector: 'app-notifications',
  imports: [DatePipe, RouterLink, IconComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  protected readonly team = inject(TeamCollaborationService);
  protected readonly items = computed(() =>
    this.team.notifications().filter((item) => item.recipientId === this.team.recipient().userId),
  );
  protected readonly unread = computed(() => this.items().filter((item) => !item.readAt).length);
  protected readonly recipientName = computed(
    () => this.team.users.find((user) => user.id === this.team.recipient().userId)?.name ?? '',
  );
  private readonly panel = viewChild.required<ElementRef<HTMLDialogElement>>('panel');
  private trigger: HTMLElement | null = null;
  protected open(trigger: HTMLElement): void {
    this.trigger = trigger;
    this.panel().nativeElement.showModal();
  }
  protected closed(): void {
    if (this.trigger?.isConnected) this.trigger.focus({ preventScroll: true });
    this.trigger = null;
  }
}
