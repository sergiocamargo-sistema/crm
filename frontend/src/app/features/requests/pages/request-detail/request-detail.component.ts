import { DatePipe, Location } from '@angular/common';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CitizenTimelineComponent } from '../../../citizens/components/citizen-timeline/citizen-timeline.component';
import { NewInteractionComponent } from '../../../citizens/components/new-interaction/new-interaction.component';
import { CitizenBriefComponent } from '../../components/citizen-brief/citizen-brief.component';
import { RequestComposerComponent } from '../../components/request-composer/request-composer.component';
import { RequestAttachmentsComponent } from '../../components/request-attachments/request-attachments.component';
import { RequestAwarenessComponent } from '../../components/request-awareness/request-awareness.component';
import { RequestDetailService } from '../../services/request-detail.service';
import { TeamCollaborationService } from '../../../../core/services/team-collaboration.service';
import { taskStatusLabel } from '../../../../core/models/task';
import { TaskLabelsComponent } from '../../../../shared/components/task-labels/task-labels.component';

@Component({
  imports: [
    DatePipe,
    RouterLink,
    IconComponent,
    CitizenTimelineComponent,
    NewInteractionComponent,
    CitizenBriefComponent,
    RequestComposerComponent,
    RequestAttachmentsComponent,
    RequestAwarenessComponent,
    TaskLabelsComponent,
  ],
  selector: 'app-request-detail',
  styleUrl: './request-detail.component.scss',
  templateUrl: './request-detail.component.html',
})
export class RequestDetailComponent {
  protected readonly team = inject(TeamCollaborationService);
  protected readonly taskStatusLabel = taskStatusLabel;
  readonly id = input.required<string>();
  private readonly service = inject(RequestDetailService);
  protected readonly taskLabels = this.service.catalog.taskLabels;
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(Location);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly tasksHeading = viewChild<ElementRef<HTMLHeadingElement>>('tasksHeading');
  private readonly composer = viewChild(RequestComposerComponent);
  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);
  protected readonly workspace = this.service.observeRequest(this.id).state;
  private readonly automationPlans = this.service.observeAutomationPlans(
    computed(() => this.workspace()?.extras.patternId),
    this.id,
  ).state;
  protected readonly availableAutomations = computed(() =>
    this.automationPlans().filter((plan) => plan.enabled),
  );
  protected readonly patternLabel = computed(
    () =>
      this.service.catalog
        .patterns()
        .find((pattern) => pattern.id === this.workspace()?.extras.patternId)?.name ??
      'Solicitação livre',
  );
  protected readonly completedTasks = computed(
    () => this.workspace()?.extras.tasks.filter((task) => !!task.completedAt).length ?? 0,
  );
  protected readonly status = signal('');
  protected readonly failure = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      this.id();
      const fragment = this.fragment();
      this.status.set('');
      this.failure.set('');
      afterNextRender(
        () => {
          const target = fragment ? this.document.getElementById(fragment) : null;
          if (target) {
            if (target.tagName === 'DETAILS') (target as HTMLDetailsElement).open = true;
            target.focus({ preventScroll: true });
            target.scrollIntoView({ block: 'start' });
          } else this.heading()?.nativeElement.focus({ preventScroll: true });
        },
        { injector: this.injector },
      );
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  protected reply(id: string, trigger: HTMLElement): void {
    const comment = this.workspace()?.extras.comments.find((item) => item.id === id);
    if (comment) this.composer()?.openComment(trigger, comment.taskId, id);
  }
  protected replyFromTimeline(id: string): void {
    const trigger = this.document.activeElement;
    if (trigger && 'focus' in trigger) this.reply(id, trigger as HTMLElement);
  }
  protected completeTask(taskId: string, completed: boolean): void {
    this.failure.set('');
    try {
      this.service.completeTask(this.id(), taskId, completed);
      this.saved();
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível atualizar a tarefa.',
      );
    }
  }
  protected startAutomation(ruleId: string): void {
    this.failure.set('');
    try {
      this.service.startAutomation(this.id(), ruleId);
      this.announce('Automação iniciada.');
      afterNextRender(() => this.tasksHeading()?.nativeElement.focus({ preventScroll: true }), {
        injector: this.injector,
      });
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível iniciar a automação.',
      );
    }
  }
  protected saved(): void {
    this.announce('Registro adicionado ao histórico da solicitação.');
  }
  private announce(message: string): void {
    this.status.set(message);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.status.set(''), 6000);
  }
  protected async copyLink(): Promise<void> {
    const window = this.document.defaultView;
    try {
      if (!window?.navigator.clipboard) throw new Error('Clipboard unavailable');
      await window.navigator.clipboard.writeText(
        new URL(
          this.location.prepareExternalUrl(`/solicitacoes/${encodeURIComponent(this.id())}`),
          this.document.baseURI,
        ).href,
      );
      this.announce('Link da solicitação copiado.');
    } catch {
      this.announce('Não foi possível copiar. Copie o link na barra de endereço.');
    }
  }
}
