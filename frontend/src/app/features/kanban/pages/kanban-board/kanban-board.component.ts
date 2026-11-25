import {
  afterNextRender,
  Component,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, FormField, maxLength, required, submit, validate } from '@angular/forms/signals';
import { TASK_PRIORITIES } from '../../../../core/models/task';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskEditorComponent } from '../../components/task-editor/task-editor.component';
import { KanbanService } from '../../services/kanban.service';
import { KanbanDragScroller } from '../../browser/kanban-drag-scroller';
import type { DragPoint } from '../../browser/drag-point';
import type { KanbanDisplayColumn, KanbanView } from '../../models/kanban';

@Component({
  imports: [RouterLink, FormField, IconComponent, TaskCardComponent, TaskEditorComponent],
  selector: 'app-kanban-board',
  host: {
    '(document:dragover)': 'trackNativeDrag($event)',
    '(document:drop)': 'dropNative($event)',
    '(document:dragleave)': 'nativeDragLeave($event)',
    '(document:keydown.escape)': 'endDrag()',
    '(window:blur)': 'endDrag()',
    '(document:visibilitychange)': 'visibilityChanged()',
  },
  styleUrl: './kanban-board.component.scss',
  templateUrl: './kanban-board.component.html',
})
export class KanbanBoardComponent {
  protected readonly board = inject(KanbanService);
  protected readonly boardState = this.board.store;
  protected readonly filtersForm = form(this.boardState.query);
  protected readonly priorities = TASK_PRIORITIES;
  protected readonly dragging = signal<string | null>(null);
  protected readonly dragTarget = signal<string | null>(null);
  protected readonly dropBeforeId = signal<string | null>(null);
  protected readonly message = signal('');
  protected readonly failure = signal('');
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('boardViewport');
  private readonly document = inject(DOCUMENT);
  private readonly scroller = new KanbanDragScroller(
    this.document,
    () => this.viewport().nativeElement,
    (point) => this.updateDropPoint(point),
  );
  private dragInput: 'native' | 'touch' | 'mouse' | null = null;
  private readonly editor = viewChild.required(TaskEditorComponent);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly params = toSignal(this.route.queryParamMap);
  private taskTrigger: HTMLElement | null = null;
  private focusPlacement = false;
  private routedTaskId: string | null = null;
  private readonly filters = viewChild.required<ElementRef<HTMLDialogElement>>('filters');
  private readonly filterSearch = viewChild.required<ElementRef<HTMLInputElement>>('filterSearch');
  private readonly columnEditor = viewChild.required<ElementRef<HTMLDialogElement>>('columnEditor');
  private readonly columnNameInput =
    viewChild.required<ElementRef<HTMLInputElement>>('columnNameInput');
  private readonly columnModel = signal({ name: '' });
  protected readonly columnForm = form(this.columnModel, (schema) => {
    required(schema.name);
    maxLength(schema.name, 60);
    validate(schema.name, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Informe o nome da coluna.' } : undefined,
    );
  });
  protected readonly columnAttempted = signal(false);
  protected readonly columnFailure = signal('');
  private filterTrigger: HTMLElement | null = null;
  private columnTrigger: HTMLElement | null = null;
  private dragView: KanbanView | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.endDrag());
    afterNextRender(() => this.focusHeading());
    effect(() => {
      const id = this.params()?.get('tarefa');
      const commentId = this.params()?.get('comentario') ?? null;
      const previousId = this.routedTaskId;
      this.routedTaskId = id ?? null;
      if (!id) {
        if (previousId) afterNextRender(() => this.editor().dismiss(), { injector: this.injector });
        return;
      }
      afterNextRender(
        () => {
          const task = this.boardState.workspace().tasks.find((item) => item.id === id);
          if (!task) {
            this.failure.set('Cartão não encontrado.');
            return;
          }
          const editor = this.editor();
          if (editor.isOpen() && editor.currentTaskId() === id) {
            if (commentId) editor.focusComment(commentId);
            return;
          }
          editor.open(
            this.taskTrigger ?? this.heading().nativeElement,
            task,
            null,
            this.focusPlacement,
            commentId,
          );
          this.taskTrigger = null;
          this.focusPlacement = false;
        },
        { injector: this.injector },
      );
    });
  }
  protected toggleView(): void {
    this.endDrag();
    this.boardState.viewSettings.update(({ mode }) => ({
      mode: mode === 'status' ? 'custom' : 'status',
    }));
    this.message.set(
      this.boardState.viewSettings().mode === 'custom'
        ? 'Visualização por colunas personalizadas.'
        : 'Visualização por status.',
    );
  }
  protected openTask(id: string, trigger: HTMLElement, focusPlacement: boolean): void {
    this.taskTrigger = trigger;
    this.focusPlacement = focusPlacement;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tarefa: id, comentario: null },
      queryParamsHandling: 'merge',
    });
  }
  protected taskClosed(): void {
    if (this.route.snapshot.queryParamMap.has('tarefa'))
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tarefa: null, comentario: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
  }
  protected focusHeading(): void {
    this.heading().nativeElement.focus({ preventScroll: true });
  }
  protected openFilters(trigger: HTMLElement): void {
    this.filterTrigger = trigger;
    this.filters().nativeElement.showModal();
    this.filterSearch().nativeElement.focus();
    this.filterSearch().nativeElement.select();
  }
  protected filtersClosed(): void {
    if (this.filterTrigger?.isConnected) this.filterTrigger.focus({ preventScroll: true });
    this.filterTrigger = null;
  }
  protected openColumnEditor(trigger: HTMLElement): void {
    this.columnTrigger = trigger;
    this.columnModel.set({ name: '' });
    this.columnAttempted.set(false);
    this.columnFailure.set('');
    this.columnEditor().nativeElement.showModal();
    this.columnNameInput().nativeElement.focus();
  }
  protected saveColumn(event: SubmitEvent): void {
    event.preventDefault();
    this.columnAttempted.set(true);
    this.columnFailure.set('');
    void submit(this.columnForm, async () => {
      try {
        await this.board.createColumn(this.columnModel().name);
        this.columnEditor().nativeElement.close();
        this.message.set('Coluna criada.');
      } catch (error: unknown) {
        this.columnFailure.set(
          error instanceof Error ? error.message : 'Não foi possível criar a coluna.',
        );
      }
    });
  }
  protected columnEditorClosed(): void {
    if (this.columnTrigger?.isConnected) this.columnTrigger.focus({ preventScroll: true });
    this.columnTrigger = null;
  }
  protected startDrag(id: string, event: DragEvent): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData('application/x-gabinete-task', id);
    event.dataTransfer.effectAllowed = 'move';
    this.beginDrag(id, 'native');
  }
  private beginDrag(id: string, input: 'native' | 'touch' | 'mouse'): void {
    this.scroller.stop();
    this.dragging.set(id);
    this.dragView = this.boardState.viewSettings().mode;
    this.dragInput = input;
    this.failure.set('');
  }
  protected trackNativeDrag(event: DragEvent): void {
    if (!this.dragging() || this.dragInput !== 'native') return;
    if (this.dragView !== this.boardState.viewSettings().mode) {
      this.endDrag();
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.scroller.move({ x: event.clientX, y: event.clientY });
  }
  protected async dropNative(event: DragEvent): Promise<void> {
    if (!this.dragging() || this.dragInput !== 'native') return;
    event.preventDefault();
    if (event.dataTransfer?.getData('application/x-gabinete-task') !== this.dragging()) {
      this.endDrag();
      return;
    }
    await this.dropAtPoint({ x: event.clientX, y: event.clientY });
  }
  protected nativeDragLeave(event: DragEvent): void {
    if (this.dragInput !== 'native' || event.relatedTarget !== null) return;
    if (
      event.target !== this.document.documentElement &&
      event.target !== this.document.body &&
      event.target !== this.document
    )
      return;
    const window = this.document.defaultView;
    if (
      window &&
      (event.clientX <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY <= 0 ||
        event.clientY >= window.innerHeight)
    ) {
      this.scroller.stop();
      this.dragTarget.set(null);
      this.dropBeforeId.set(null);
    }
  }
  protected startMouseDrag(id: string, point: DragPoint): void {
    this.beginDrag(id, 'mouse');
    this.scroller.move(point);
  }
  protected moveMouseDrag(point: DragPoint): void {
    if (this.dragInput !== 'mouse' || !this.dragging()) return;
    if (this.dragView !== this.boardState.viewSettings().mode) {
      this.endDrag();
      return;
    }
    this.scroller.move(point);
  }
  protected async dropMouseDrag(point: DragPoint): Promise<void> {
    if (this.dragInput === 'mouse' && this.dragging()) await this.dropAtPoint(point);
  }
  protected startTouchDrag(id: string, point: DragPoint): void {
    this.beginDrag(id, 'touch');
    this.scroller.move(point);
  }
  protected moveTouchDrag(point: DragPoint): void {
    if (this.dragInput !== 'touch' || !this.dragging()) return;
    if (this.dragView !== this.boardState.viewSettings().mode) {
      this.endDrag();
      return;
    }
    this.scroller.move(point);
  }
  protected async dropTouchDrag(point: DragPoint): Promise<void> {
    if (this.dragInput === 'touch' && this.dragging()) await this.dropAtPoint(point);
  }
  private dropPosition(
    point: DragPoint,
  ): { column: KanbanDisplayColumn; beforeId: string | null } | null {
    const viewport = this.viewport().nativeElement;
    const bounds = viewport.getBoundingClientRect();
    const window = this.document.defaultView;
    if (!window) return null;
    const visual = window.visualViewport;
    const screenLeft = visual?.offsetLeft ?? 0;
    const screenTop = visual?.offsetTop ?? 0;
    const headerBottom =
      this.document.querySelector('app-header')?.getBoundingClientRect().bottom ?? screenTop;
    const left = Math.max(bounds.left, screenLeft);
    const right = Math.min(
      bounds.right,
      screenLeft + (visual?.width ?? this.document.documentElement.clientWidth),
    );
    const top = Math.max(bounds.top, screenTop, headerBottom);
    const bottom = Math.min(bounds.bottom, screenTop + (visual?.height ?? window.innerHeight));
    if (
      right <= left ||
      bottom <= top ||
      point.x < left - 80 ||
      point.x > right + 80 ||
      point.y < top - 80 ||
      point.y > bottom + 80
    )
      return null;
    const x = Math.max(left + 1, Math.min(right - 1, point.x));
    const y = Math.max(top + 1, Math.min(bottom - 1, point.y));
    const element = this.document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>('[data-kanban-column]');
    if (!element || !viewport.contains(element)) return null;
    const column = this.board
      .columns()
      .find((item) => item.id === element.getAttribute('data-kanban-column'));
    if (!column) return null;
    let beforeId: string | null = null;
    for (const card of element.querySelectorAll<HTMLElement>('li[data-task-id]')) {
      const id = card.getAttribute('data-task-id');
      if (!id || id === this.dragging()) continue;
      const rect = card.getBoundingClientRect();
      if (y < rect.top + rect.height / 2) {
        beforeId = id;
        break;
      }
    }
    return { column, beforeId };
  }
  private updateDropPoint(point: DragPoint): void {
    if (!this.dragging()) return;
    if (this.dragView !== this.boardState.viewSettings().mode) {
      this.endDrag();
      return;
    }
    const position = this.dropPosition(point);
    this.dragTarget.set(position?.column.id ?? null);
    this.dropBeforeId.set(position?.beforeId ?? null);
  }
  private async dropAtPoint(point: DragPoint): Promise<void> {
    const id = this.dragging();
    if (!id) return;
    try {
      if (this.dragView !== this.boardState.viewSettings().mode) return;
      const position = this.dropPosition(point);
      if (!position) return;
      this.endDrag();
      await this.board.positionTask(id, position.column.target, position.beforeId);
      this.message.set(`Posição atualizada em ${position.column.label}.`);
    } catch (error: unknown) {
      this.failure.set(error instanceof Error ? error.message : 'Não foi possível mover a tarefa.');
    } finally {
      this.endDrag();
    }
  }
  protected endDrag(): void {
    this.scroller.stop();
    this.dragging.set(null);
    this.dragTarget.set(null);
    this.dropBeforeId.set(null);
    this.dragView = null;
    this.dragInput = null;
  }
  protected visibilityChanged(): void {
    if (this.document.hidden) this.endDrag();
  }
  protected async reorderTask(
    id: string,
    column: KanbanDisplayColumn,
    direction: 'up' | 'down',
  ): Promise<void> {
    const index = column.tasks.findIndex((task) => task.id === id);
    if (
      index < 0 ||
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === column.tasks.length - 1)
    )
      return;
    const beforeId =
      direction === 'up' ? column.tasks[index - 1].id : (column.tasks[index + 2]?.id ?? null);
    this.failure.set('');
    try {
      await this.board.positionTask(id, column.target, beforeId);
      this.message.set(`Ordem atualizada em ${column.label}.`);
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível reordenar o cartão.',
      );
    }
  }
  protected taskSaved(id: string): void {
    this.failure.set('');
    this.message.set('Tarefa salva.');
    if (this.route.snapshot.queryParamMap.get('tarefa') !== id)
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tarefa: id, comentario: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
  }
}
