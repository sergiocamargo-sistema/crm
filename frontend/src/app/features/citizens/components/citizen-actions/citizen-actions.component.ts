import { Location } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { CitizenActionsSummary } from '../../../../core/models/citizen-summary';

@Component({
  imports: [IconComponent, RouterLink],
  selector: 'app-citizen-actions',
  styleUrl: './citizen-actions.component.scss',
  templateUrl: './citizen-actions.component.html',
  host: { '(window:resize)': 'close()', '(window:scroll)': 'close()' },
})
export class CitizenActionsComponent {
  readonly citizen = input.required<CitizenActionsSummary>();
  readonly idPrefix = input('list-citizen-actions');
  readonly navigationRequested = output<void>();
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(Location);
  private readonly injector = inject(Injector);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('actionsPanel');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('actionsTrigger');
  private readonly fallback = viewChild<ElementRef<HTMLInputElement>>('fallbackLink');
  protected readonly panelId = computed(() => `${this.idPrefix()}-${this.citizen().id}`);
  protected readonly expanded = signal(false);
  protected readonly position = signal({ top: 0, left: 0 });
  protected readonly status = signal('');
  protected readonly showLink = signal(false);
  protected readonly citizenUrl = computed(
    () =>
      new URL(
        this.location.prepareExternalUrl(`/municipes/${encodeURIComponent(this.citizen().id)}`),
        this.document.baseURI,
      ).href,
  );
  private timer: ReturnType<typeof setTimeout> | undefined;
  private alive = true;
  private readonly onAncestorScroll = (event: Event): void => {
    // Rolagem dentro do próprio menu não deve fechá-lo.
    if (event.target instanceof Node && this.panel().nativeElement.contains(event.target)) return;
    this.close();
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      clearTimeout(this.timer);
      this.document.removeEventListener('scroll', this.onAncestorScroll, true);
    });
  }

  protected onBeforeToggle(event: ToggleEvent): void {
    if (event.newState !== 'open') return;
    clearTimeout(this.timer);
    this.status.set('');
    this.showLink.set(false);
  }

  private placePanel(): void {
    const panel = this.panel().nativeElement;
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    const viewport = this.document.documentElement;
    const below = rect.bottom + 8;
    const top =
      below + panel.offsetHeight <= viewport.clientHeight - 8
        ? below
        : rect.top - panel.offsetHeight - 8;
    this.position.set({
      top: Math.max(8, Math.min(top, viewport.clientHeight - panel.offsetHeight - 8)),
      left: Math.max(
        8,
        Math.min(rect.right - panel.offsetWidth, viewport.clientWidth - panel.offsetWidth - 8),
      ),
    });
  }

  close(restoreFocus = true): void {
    this.document.removeEventListener('scroll', this.onAncestorScroll, true);
    const panel = this.panel().nativeElement;
    if (!panel.matches(':popover-open')) return;
    const hadFocus = panel.contains(this.document.activeElement);
    panel.hidePopover();
    this.expanded.set(false);
    if (hadFocus && restoreFocus) this.trigger().nativeElement.focus({ preventScroll: true });
  }

  protected onToggle(): void {
    const panel = this.panel().nativeElement;
    const expanded = panel.matches(':popover-open');
    this.expanded.set(expanded);
    if (expanded) {
      this.document.addEventListener('scroll', this.onAncestorScroll, true);
      this.placePanel();
      panel.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
    } else {
      this.document.removeEventListener('scroll', this.onAncestorScroll, true);
    }
  }

  protected openLabels(): void {
    this.close();
    this.navigationRequested.emit();
  }

  protected async copyLink(): Promise<void> {
    clearTimeout(this.timer);
    try {
      const clipboard = this.document.defaultView?.navigator.clipboard;
      if (!clipboard) throw new Error('Clipboard unavailable');
      await clipboard.writeText(this.citizenUrl());
      if (!this.alive) return;
      this.showLink.set(false);
      this.status.set('Link da ficha copiado.');
      this.timer = setTimeout(() => this.status.set(''), 5000);
    } catch {
      if (!this.alive) return;
      this.showLink.set(true);
      this.status.set('Copie o link da ficha abaixo.');
    }
    if (this.alive)
      afterNextRender(
        () => {
          if (!this.panel().nativeElement.matches(':popover-open')) return;
          this.placePanel();
          if (this.showLink()) {
            this.fallback()?.nativeElement.focus({ preventScroll: true });
            this.fallback()?.nativeElement.select();
          }
        },
        { injector: this.injector },
      );
  }
}
