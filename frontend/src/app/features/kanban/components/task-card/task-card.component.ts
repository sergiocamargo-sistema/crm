import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TouchCardDragDirective } from '../../directives/touch-card-drag.directive';
import { MouseCardDragDirective } from '../../directives/mouse-card-drag.directive';
import type { DragPoint } from '../../browser/drag-point';
import { TeamCollaborationService } from '../../../../core/services/team-collaboration.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { taskPriorityLabel, taskStatusLabel } from '../../../../core/models/task';
import type { KanbanTask } from '../../models/kanban';
import type { TaskLabel } from '../../../../core/models/task-label';
import { TaskLabelsComponent } from '../../../../shared/components/task-labels/task-labels.component';

@Component({
  imports: [
    DatePipe,
    NgOptimizedImage,
    RouterLink,
    IconComponent,
    TouchCardDragDirective,
    MouseCardDragDirective,
    TaskLabelsComponent,
  ],
  selector: 'app-task-card',
  host: {
    '(window:blur)': 'cancelGesture()',
    '(document:visibilitychange)': 'cancelGesture()',
    '(document:keydown.escape)': 'cancelGesture()',
  },
  styleUrl: './task-card.component.scss',
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent {
  readonly task = input.required<KanbanTask>();
  readonly labels = input.required<readonly TaskLabel[]>();
  readonly overdue = input(false);
  readonly priorityCover = input(false);
  readonly canMoveUp = input(false);
  readonly canMoveDown = input(false);
  readonly reorderRequested = output<'up' | 'down'>();
  readonly editRequested = output<{ trigger: HTMLElement; focusPlacement: boolean }>();
  readonly dragRequested = output<DragEvent>();
  readonly dragFinished = output<void>();
  readonly touchStarted = output<DragPoint>();
  readonly touchMoved = output<DragPoint>();
  readonly touchDropped = output<DragPoint>();
  readonly mouseStarted = output<DragPoint>();
  readonly mouseMoved = output<DragPoint>();
  readonly mouseDropped = output<DragPoint>();
  protected readonly mouseActive = signal(false);
  protected readonly touchActive = signal(false);
  protected readonly failedCover = signal('');
  protected readonly priority = computed(() => taskPriorityLabel(this.task().priority));
  protected readonly status = computed(() => taskStatusLabel(this.task().status));
  private readonly team = inject(TeamCollaborationService);
  private readonly injector = inject(Injector);
  protected readonly assignees = computed(() =>
    this.task().assigneeIds.flatMap((id) => {
      const user = this.team.users.find((item) => item.id === id);
      return user ? [user] : [];
    }),
  );
  protected readonly assigneeLabel = computed(() =>
    this.assignees()
      .map((user) => user.name)
      .join(', '),
  );
  private blockedDragOrigin = false;
  private suppressClickUntil = 0;
  protected pointerDown(event: PointerEvent): void {
    this.blockedDragOrigin =
      event.target instanceof Element &&
      !!event.target.closest('a, input, textarea, select, details');
  }
  protected beginDrag(event: DragEvent): void {
    if (
      event.defaultPrevented ||
      this.mouseActive() ||
      this.touchActive() ||
      this.blockedDragOrigin ||
      !event.dataTransfer
    ) {
      event.preventDefault();
      return;
    }
    this.suppressClickUntil = Infinity;
    event.stopPropagation();
    this.dragRequested.emit(event);
  }
  protected finishDrag(): void {
    this.suppressClickUntil = Date.now() + 200;
    this.blockedDragOrigin = false;
    this.dragFinished.emit();
  }
  protected startTouch(point: DragPoint): void {
    this.touchActive.set(true);
    this.suppressClickUntil = Infinity;
    this.touchStarted.emit(point);
  }
  protected startMouse(point: DragPoint): void {
    this.mouseActive.set(true);
    this.suppressClickUntil = Infinity;
    this.mouseStarted.emit(point);
  }
  protected finishMouse(point: DragPoint): void {
    this.mouseActive.set(false);
    this.suppressClickUntil = Date.now() + 300;
    this.mouseDropped.emit(point);
  }
  protected cancelMouse(): void {
    this.mouseActive.set(false);
    this.suppressClickUntil = Date.now() + 300;
    this.dragFinished.emit();
  }
  protected finishTouch(point: DragPoint): void {
    this.touchActive.set(false);
    this.suppressClickUntil = Date.now() + 400;
    this.touchDropped.emit(point);
  }
  protected cancelTouch(): void {
    this.touchActive.set(false);
    this.mouseActive.set(false);
    this.suppressClickUntil = Date.now() + 400;
    this.dragFinished.emit();
  }
  protected cancelGesture(): void {
    if (this.suppressClickUntil !== Infinity && !this.touchActive() && !this.mouseActive()) return;
    this.touchActive.set(false);
    this.mouseActive.set(false);
    this.suppressClickUntil = Date.now() + 400;
    this.dragFinished.emit();
  }
  protected open(trigger: HTMLElement, focusPlacement: boolean): void {
    if (Date.now() < this.suppressClickUntil) return;
    this.editRequested.emit({ trigger, focusPlacement });
  }
  protected reorder(
    direction: 'up' | 'down',
    menu: HTMLDetailsElement,
    summary: HTMLElement,
  ): void {
    if (Date.now() < this.suppressClickUntil) return;
    menu.open = false;
    this.reorderRequested.emit(direction);
    afterNextRender(() => summary.focus({ preventScroll: true }), { injector: this.injector });
  }
}
