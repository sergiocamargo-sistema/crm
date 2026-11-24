import {
  afterNextRender,
  Injector,
  Component,
  DestroyRef,
  DOCUMENT,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { CitizenSearchService } from '../../../core/services/citizen-search';
import type { CitizenSummary } from '../../../core/models/citizen-summary';
import { IconComponent } from '../icon/icon.component';
import { CitizenActionsComponent } from '../../../features/citizens/components/citizen-actions/citizen-actions.component';

@Component({
  selector: 'app-citizen-search',
  imports: [IconComponent, FormField, RouterLink, NgTemplateOutlet, CitizenActionsComponent],
  templateUrl: './citizen-search.component.html',
  styleUrl: './citizen-search.component.scss',
  host: {
    '(window:keydown)': 'onGlobalKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class CitizenSearchComponent {
  readonly mode = input<'header' | 'picker'>('header');
  readonly inputId = input('global-citizen-search');
  readonly excludedIds = input<ReadonlySet<string>>(new Set<string>());
  readonly citizenSelected = output<CitizenSummary>();
  protected readonly isHeader = computed(() => this.mode() === 'header');
  protected readonly panelId = computed(() => this.inputId() + '-panel');
  protected readonly resultsId = computed(() => this.inputId() + '-results');
  protected readonly hintId = computed(() => this.inputId() + '-hint');
  private readonly search = inject(CitizenSearchService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly pickerStore = this.search.createStore(this.excludedIds);
  private readonly headerForm = form(this.search.store.model);
  private readonly pickerForm = form(this.pickerStore.model);
  protected readonly store = computed(() =>
    this.isHeader() ? this.search.store : this.pickerStore,
  );
  protected readonly searchField = computed(() =>
    this.isHeader() ? this.headerForm.query : this.pickerForm.query,
  );
  private readonly mobileMedia = this.document.defaultView?.matchMedia?.('(max-width: 600px)');
  private readonly narrowScreen = signal(this.mobileMedia?.matches ?? false);
  protected readonly mobile = computed(() => this.isHeader() && this.narrowScreen());
  protected readonly mobileExpanded = signal(false);
  protected readonly opened = signal(false);
  protected readonly resultsOpen = computed(() => this.opened() && this.store().hasQuery());
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchPanel = viewChild.required<ElementRef<HTMLElement>>('searchPanel');
  private readonly mobileTrigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('mobileTrigger');
  private readonly resultButtons = viewChildren<ElementRef<HTMLElement>>('resultButton');
  private readonly resultActions = viewChildren(CitizenActionsComponent);

  constructor() {
    effect(() => {
      this.store().results();
      this.resultsOpen();
      untracked(() => this.closeResultActions());
    });
    const media = this.mobileMedia;
    if (!media) return;
    const onChange = (event: MediaQueryListEvent): void => {
      if (!this.isHeader()) return;
      const panel = this.searchPanel().nativeElement;
      const hadFocus = panel.contains(this.document.activeElement);
      if (this.mobile()) this.closeMobileSearch(false);
      this.narrowScreen.set(event.matches);
      this.opened.set(false);
      if (hadFocus) {
        afterNextRender(() => this.focusSearch(), { injector: this.injector });
      }
    };
    media.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => media.removeEventListener('change', onChange));
  }

  protected openMobileSearch(): void {
    this.focusSearch(true);
  }

  protected closeMobileSearch(restoreFocus = true): void {
    this.closeResultActions();
    const panel = this.searchPanel().nativeElement;
    this.opened.set(false);
    this.mobileExpanded.set(false);
    if (panel.matches(':popover-open')) panel.hidePopover();
    if (restoreFocus) this.mobileTrigger().nativeElement.focus({ preventScroll: true });
  }

  protected onPanelToggle(): void {
    const expanded = this.mobile() && this.searchPanel().nativeElement.matches(':popover-open');
    this.mobileExpanded.set(expanded);
    if (!expanded) {
      this.closeResultActions();
      this.opened.set(false);
    }
  }

  private focusSearch(select = false): void {
    if (this.mobile()) {
      const panel = this.searchPanel().nativeElement;
      if (!panel.matches(':popover-open')) {
        panel.showPopover({ source: this.mobileTrigger().nativeElement });
      }
      this.mobileExpanded.set(true);
    }
    const input = this.searchInput().nativeElement;
    // Foco dentro do próprio gesto de toque, sem aguardar a animação.
    input.focus({ preventScroll: true });
    if (select) input.select();
    this.opened.set(true);
  }

  reset(): void {
    this.closeResultActions();
    this.store().model.set({ query: '' });
    this.opened.set(false);
  }

  focus(): void {
    this.focusSearch();
  }

  protected clear(): void {
    this.reset();
    this.searchInput().nativeElement.focus();
  }

  protected selectCitizen(): void {
    this.closeResultActions();
    this.opened.set(false);
    if (this.mobile()) this.closeMobileSearch(false);
  }

  private closeResultActions(): void {
    for (const actions of this.resultActions()) actions.close(false);
  }

  protected chooseCitizen(citizen: CitizenSummary): void {
    if (this.isHeader()) {
      this.selectCitizen();
      void this.router.navigate(['/municipes', citizen.id]);
    } else {
      this.citizenSelected.emit(citizen);
    }
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && this.store().results().length > 0) {
      event.preventDefault();
      this.opened.set(true);
      afterNextRender(() => this.resultButtons()[0]?.nativeElement.focus(), {
        injector: this.injector,
      });
    } else if (event.key === 'Enter') {
      const firstResult = this.resultsOpen() ? this.store().results()[0] : undefined;
      if (firstResult || !this.isHeader()) event.preventDefault();
      if (firstResult) this.chooseCitizen(firstResult);
    } else if (event.key === 'Escape' && (this.mobile() || this.resultsOpen())) {
      event.preventDefault();
      if (this.mobile()) this.closeMobileSearch();
      else this.opened.set(false);
    }
  }

  protected onResultKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.mobile()) {
        this.closeMobileSearch();
        return;
      }
      this.searchInput().nativeElement.focus();
      this.opened.set(false);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.resultButtons()[
        Math.min(index + 1, this.resultButtons().length - 1)
      ]?.nativeElement.focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index === 0) this.searchInput().nativeElement.focus();
      else this.resultButtons()[index - 1]?.nativeElement.focus();
    }
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    if (
      this.isHeader() &&
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'k' &&
      !this.document.querySelector('dialog[open]')
    ) {
      event.preventDefault();
      this.focusSearch(true);
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.element.nativeElement.contains(event.target))
      this.opened.set(false);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (
      !(event.relatedTarget instanceof Node) ||
      !this.element.nativeElement.contains(event.relatedTarget)
    ) {
      this.opened.set(false);
      if (this.mobile() && this.mobileExpanded()) this.closeMobileSearch(false);
    }
  }
}
