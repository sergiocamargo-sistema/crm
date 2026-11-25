import { Location } from '@angular/common';
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
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { VOTE_ESTIMATE_LABEL } from '../../../../core/models/vote-estimate';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { VoteEstimateSliderComponent } from '../../../../shared/components/vote-estimate-slider/vote-estimate-slider.component';
import { CitizenDetailService } from '../../services/citizen-detail';
import { CitizenTimelineComponent } from '../../components/citizen-timeline/citizen-timeline.component';
import { CitizenPhotoGalleryComponent } from '../../components/citizen-photo-gallery/citizen-photo-gallery.component';
import { CitizenNotesComponent } from '../../components/citizen-notes/citizen-notes.component';
import { NewInteractionComponent } from '../../components/new-interaction/new-interaction.component';
import { CitizenActivityShortcutsComponent } from '../../components/citizen-activity-shortcuts/citizen-activity-shortcuts.component';

const registrationFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
});

@Component({
  imports: [
    CitizenPhotoGalleryComponent,
    RouterLink,
    IconComponent,
    CitizenTimelineComponent,
    NewInteractionComponent,
    CitizenNotesComponent,
    CitizenActivityShortcutsComponent,
    FormField,
    VoteEstimateSliderComponent,
  ],
  selector: 'app-citizen-detail',
  styleUrl: './citizen-detail.component.scss',
  templateUrl: './citizen-detail.component.html',
})
export class CitizenDetailComponent {
  readonly id = input.required<string>();
  private readonly service = inject(CitizenDetailService);
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(Location);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly voteEstimateSlider = viewChild(VoteEstimateSliderComponent);
  private readonly actionsTrigger = viewChild<ElementRef<HTMLButtonElement>>('actionsTrigger');
  private readonly actionsPanel = viewChild<ElementRef<HTMLElement>>('actionsPanel');
  private readonly mobileMedia = this.document.defaultView?.matchMedia('(max-width: 600px)');
  protected readonly mobileActions = signal(this.mobileMedia?.matches ?? false);
  protected readonly actionsExpanded = signal(false);
  private statusTimer: ReturnType<typeof setTimeout> | undefined;
  protected readonly citizenState = this.service.observeCitizen(this.id);
  protected readonly citizen = this.citizenState.state;
  protected readonly voteEstimateLabel = VOTE_ESTIMATE_LABEL;
  private readonly savedVoteEstimate = computed(() => this.citizen()?.voteEstimate ?? null);
  private readonly voteEstimateDraft = linkedSignal({
    source: () => ({ id: this.id(), estimate: this.savedVoteEstimate() }),
    computation: ({ estimate }) => ({ estimate }),
  });
  protected readonly voteEstimateForm = form(this.voteEstimateDraft);
  protected readonly voteEstimateChanged = computed(
    () => this.voteEstimateDraft().estimate !== this.savedVoteEstimate(),
  );
  protected readonly voteEstimateStatus = signal('');
  protected readonly voteEstimateError = signal('');
  protected readonly addresses = computed(() => {
    const person = this.citizen();
    if (!person) return [];
    return (person.addresses ?? [{ ...person.address, neighborhood: person.neighborhood }]).filter(
      (address) => Object.values(address).some(Boolean),
    );
  });
  protected readonly timeline = this.service.observeTimeline(this.id).state;
  protected readonly primaryWhatsapp = computed(
    () => this.citizen()?.phones.find((phone) => phone.whatsappUrl)?.whatsappUrl ?? '',
  );
  protected readonly registrationDate = computed(() => {
    const date = this.citizen()?.registeredAt;
    return date ? registrationFormatter.format(new Date(`${date}T12:00:00-03:00`)) : '';
  });
  protected readonly shareStatus = signal('');

  constructor() {
    effect(() => {
      this.citizenState.loading();
      this.id();
      this.shareStatus.set('');
      this.voteEstimateStatus.set('');
      this.voteEstimateError.set('');
      this.closeActions();
      afterNextRender(
        () => {
          this.pageTitle()?.nativeElement.focus({ preventScroll: true });
        },
        { injector: this.injector },
      );
    });
    this.destroyRef.onDestroy(() => clearTimeout(this.statusTimer));
    const media = this.mobileMedia;
    if (media) {
      const onChange = (event: MediaQueryListEvent): void => {
        const hadFocus = this.actionsPanel()?.nativeElement.contains(this.document.activeElement);
        this.closeActions();
        this.mobileActions.set(event.matches);
        if (hadFocus) {
          afterNextRender(
            () => {
              if (event.matches)
                this.actionsTrigger()?.nativeElement.focus({ preventScroll: true });
              else
                this.actionsPanel()
                  ?.nativeElement.querySelector<HTMLElement>('a, button')
                  ?.focus({ preventScroll: true });
            },
            { injector: this.injector },
          );
        }
      };
      media.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => media.removeEventListener('change', onChange));
    }
  }

  protected async saveVoteEstimate(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!this.voteEstimateChanged()) return;
    this.voteEstimateStatus.set('');
    this.voteEstimateError.set('');
    const { estimate } = this.voteEstimateDraft();
    try {
      await this.service.saveVoteEstimate(this.id(), estimate);
      this.voteEstimateStatus.set(estimate === null ? 'Estimativa removida.' : 'Estimativa salva.');
      this.voteEstimateSlider()?.focus({ preventScroll: true });
    } catch (error: unknown) {
      this.voteEstimateError.set(
        error instanceof Error ? error.message : 'Não foi possível salvar a estimativa.',
      );
    }
  }

  protected toggleActions(): void {
    const panel = this.actionsPanel()?.nativeElement;
    const trigger = this.actionsTrigger()?.nativeElement;
    if (!this.mobileActions() || !panel || !trigger) return;
    if (panel.matches(':popover-open')) {
      this.closeActions();
      return;
    }
    panel.showPopover({ source: trigger });
    const rect = trigger.getBoundingClientRect();
    panel.style.top = `${Math.max(8, Math.min(rect.bottom + 8, (this.document.defaultView?.innerHeight ?? rect.bottom) - panel.offsetHeight - 8))}px`;
    panel.style.right = `${Math.max(8, this.document.documentElement.clientWidth - rect.right)}px`;
    this.actionsExpanded.set(true);
    panel.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
  }

  protected closeActions(): void {
    const panel = this.actionsPanel()?.nativeElement;
    if (panel?.matches(':popover-open')) panel.hidePopover();
    this.actionsExpanded.set(false);
  }

  protected onActionsToggle(): void {
    this.actionsExpanded.set(this.actionsPanel()?.nativeElement.matches(':popover-open') ?? false);
  }

  protected async copyLink(): Promise<void> {
    const window = this.document.defaultView;
    try {
      if (!window?.navigator.clipboard) throw new Error('Clipboard unavailable');
      await window.navigator.clipboard.writeText(
        new URL(
          this.location.prepareExternalUrl(`/municipes/${encodeURIComponent(this.id())}`),
          this.document.baseURI,
        ).href,
      );
      this.shareStatus.set('Link do munícipe copiado.');
    } catch {
      this.shareStatus.set(
        'Não foi possível copiar. Copie o link na barra de endereço do navegador.',
      );
    }
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => this.shareStatus.set(''), 6000);
  }

  protected onContactRegistered(): void {
    this.shareStatus.set('Registro adicionado à linha do tempo.');
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => this.shareStatus.set(''), 6000);
  }
}
