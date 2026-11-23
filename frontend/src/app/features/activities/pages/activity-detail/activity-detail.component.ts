import { DatePipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ACTIVITY_LABELS, ActivityDetailService } from '../../services/activity-detail.service';
import type { ActivityKind } from '../../models/activity-detail';

@Component({
  imports: [DatePipe, RouterLink, IconComponent],
  selector: 'app-activity-detail',
  styleUrl: './activity-detail.component.scss',
  templateUrl: './activity-detail.component.html',
})
export class ActivityDetailComponent {
  readonly id = input.required<string>();
  readonly kind = input.required<ActivityKind>();
  private readonly service = inject(ActivityDetailService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');
  private timer: ReturnType<typeof setTimeout> | undefined;
  protected readonly detail = this.service.observeActivity(this.kind, this.id).state;
  protected readonly notFound = computed(() => ACTIVITY_LABELS[this.kind()].notFound);
  protected readonly shareStatus = signal('');

  constructor() {
    effect(() => {
      this.id();
      this.kind();
      this.shareStatus.set('');
      clearTimeout(this.timer);
      afterNextRender(() => this.heading()?.nativeElement.focus({ preventScroll: true }), {
        injector: this.injector,
      });
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copyLink(): Promise<void> {
    const window = this.document.defaultView;
    try {
      if (!window?.navigator.clipboard) throw new Error('Clipboard unavailable');
      await window.navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}`,
      );
      this.shareStatus.set('Link copiado.');
    } catch {
      this.shareStatus.set('Não foi possível copiar. Copie o link na barra de endereço.');
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.shareStatus.set(''), 6000);
  }
}
