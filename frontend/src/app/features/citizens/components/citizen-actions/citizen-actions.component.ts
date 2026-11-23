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
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { CitizenListItem } from '../../models/citizen-list';

type CitizenActionsSummary = Pick<CitizenListItem, 'id' | 'name' | 'socialLinks' | 'whatsappUrl'>;

@Component({
  imports: [IconComponent],
  selector: 'app-citizen-actions',
  styleUrl: './citizen-actions.component.scss',
  templateUrl: './citizen-actions.component.html',
  host: { '(window:resize)': 'close()', '(window:scroll)': 'close()' },
})
export class CitizenActionsComponent {
  readonly citizen = input.required<CitizenActionsSummary>();
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(Location);
  private readonly injector = inject(Injector);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('actionsPanel');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('actionsTrigger');
  private readonly fallback = viewChild<ElementRef<HTMLInputElement>>('fallbackLink');
  protected readonly panelId = computed(() => `list-citizen-actions-${this.citizen().id}`);
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

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      clearTimeout(this.timer);
    });
  }

  protected toggle(): void {
    const panel = this.panel().nativeElement;
    if (panel.matches(':popover-open')) {
      this.close();
      return;
    }
    clearTimeout(this.timer);
    this.status.set('');
    this.showLink.set(false);
    panel.showPopover({ source: this.trigger().nativeElement });
    this.expanded.set(true);
    this.placePanel();
    panel.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
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

  protected close(): void {
    const panel = this.panel().nativeElement;
    if (!panel.matches(':popover-open')) return;
    const hadFocus = panel.contains(this.document.activeElement);
    panel.hidePopover();
    this.expanded.set(false);
    if (hadFocus) this.trigger().nativeElement.focus({ preventScroll: true });
  }

  protected onToggle(): void {
    this.expanded.set(this.panel().nativeElement.matches(':popover-open'));
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
