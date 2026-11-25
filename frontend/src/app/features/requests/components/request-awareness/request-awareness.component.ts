import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitizenSearchComponent } from '../../../../shared/components/citizen-search/citizen-search.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { RequestAwarenessView, RequestWorkspace } from '../../models/request-detail';
import { RequestDetailService } from '../../services/request-detail.service';

@Component({
  imports: [CitizenSearchComponent, RouterLink, IconComponent],
  selector: 'app-request-awareness',
  styleUrl: './request-awareness.component.scss',
  templateUrl: './request-awareness.component.html',
})
export class RequestAwarenessComponent {
  readonly workspace = input.required<RequestWorkspace>();
  readonly changed = output<void>();
  private readonly service = inject(RequestDetailService);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly addButton = viewChild.required<ElementRef<HTMLButtonElement>>('addButton');
  private readonly picker = viewChild(CitizenSearchComponent);
  private trigger: HTMLElement | null = null;
  protected readonly removing = signal<RequestAwarenessView | null>(null);
  protected readonly failure = signal('');
  protected readonly status = signal('');
  protected readonly excludedCitizenIds = computed(() => {
    const detail = this.workspace();
    const excluded = new Set(detail.awareness.map((item) => item.citizenId));
    if (detail.citizen) excluded.add(detail.citizen.id);
    return excluded;
  });

  constructor() {
    const requestId = computed(() => this.workspace().request.id);
    effect(() => {
      requestId();
      this.status.set('');
      afterNextRender(
        () => {
          this.trigger = null;
          this.dialog().nativeElement.close();
        },
        { injector: this.injector },
      );
    });
  }

  protected openAdd(trigger: HTMLElement): void {
    this.removing.set(null);
    this.open(trigger);
  }

  protected openRemove(link: RequestAwarenessView, trigger: HTMLElement): void {
    this.removing.set(link);
    this.open(trigger);
  }

  private open(trigger: HTMLElement): void {
    this.trigger = trigger;
    this.failure.set('');
    this.status.set('');
    afterNextRender(
      () => {
        this.picker()?.reset();
        this.dialog().nativeElement.showModal();
        this.picker()?.focus();
      },
      { injector: this.injector },
    );
  }

  protected add(citizenId: string): void {
    this.persist(
      async () => await this.service.addAwareness(this.workspace().request.id, citizenId),
      'Munícipe vinculado para ciência.',
    );
  }

  protected remove(): void {
    const link = this.removing();
    if (!link) return;
    this.persist(
      async () => await this.service.removeAwareness(this.workspace().request.id, link.id),
      'Vínculo de ciência removido.',
    );
  }

  private async persist(action: () => Promise<unknown>, message: string): Promise<void> {
    this.failure.set('');
    try {
      await action();
      this.dialog().nativeElement.close();
      this.status.set(message);
      this.changed.emit();
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível atualizar o vínculo.',
      );
    }
  }

  protected onClose(): void {
    (this.trigger?.isConnected ? this.trigger : this.addButton().nativeElement).focus({
      preventScroll: true,
    });
    this.trigger = null;
  }
}
