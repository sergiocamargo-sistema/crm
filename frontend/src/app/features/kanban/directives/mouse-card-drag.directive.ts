import { DestroyRef, Directive, DOCUMENT, ElementRef, inject, output } from '@angular/core';
import type { DragPoint } from '../browser/drag-point';

interface MouseGesture {
  readonly pointerId: number;
  readonly origin: DragPoint;
  readonly previousDraggable: boolean;
}

@Directive({
  selector: '[appMouseCardDrag]',
  host: {
    '(window:blur)': 'cancel()',
    '(document:keydown.escape)': 'cancel()',
    '(document:visibilitychange)': 'visibilityChanged()',
  },
})
export class MouseCardDragDirective {
  readonly mouseDragStarted = output<DragPoint>();
  readonly mouseDragMoved = output<DragPoint>();
  readonly mouseDragDropped = output<DragPoint>();
  readonly mouseDragCancelled = output<void>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private gesture: MouseGesture | null = null;
  private active = false;
  private preview: HTMLElement | null = null;
  private previewOffset = 0;

  constructor() {
    this.element.addEventListener('pointerdown', this.start);
    this.element.addEventListener('dragstart', this.preventNativeDrag, true);
    inject(DestroyRef).onDestroy(() => {
      this.cancel();
      this.element.removeEventListener('pointerdown', this.start);
      this.element.removeEventListener('dragstart', this.preventNativeDrag, true);
    });
  }

  private readonly start = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary || this.gesture)
      return;
    if (
      event.target instanceof Element &&
      event.target.closest('a, input, textarea, select, details, button:not(.task-title)')
    )
      return;
    this.gesture = {
      pointerId: event.pointerId,
      origin: { x: event.clientX, y: event.clientY },
      previousDraggable: this.element.draggable,
    };
    // Impedir a sessão HTML nativa antes que ela suspenda os eventos do ponteiro.
    this.element.draggable = false;
    this.document.addEventListener('pointermove', this.move, true);
    this.document.addEventListener('pointerup', this.end, true);
    this.document.addEventListener('pointercancel', this.pointerCancelled, true);
    this.element.addEventListener('lostpointercapture', this.captureLost);
  };
  private readonly preventNativeDrag = (event: DragEvent): void => {
    if (!this.gesture) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  private readonly move = (event: PointerEvent): void => {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if (!(event.buttons & 1)) {
      this.cancel();
      return;
    }
    const point = { x: event.clientX, y: event.clientY };
    if (!this.active) {
      if (Math.hypot(point.x - gesture.origin.x, point.y - gesture.origin.y) < 6) return;
      this.active = true;
      this.document.getSelection()?.removeAllRanges();
      try {
        this.element.setPointerCapture(event.pointerId);
      } catch {
        /* Os listeners no documento continuam recebendo movimentos dentro da janela. */
      }
      this.createPreview(point);
      this.mouseDragStarted.emit(point);
    }
    event.preventDefault();
    this.movePreview(point);
    this.mouseDragMoved.emit(point);
  };
  private readonly end = (event: PointerEvent): void => {
    if (!this.gesture || event.pointerId !== this.gesture.pointerId) return;
    const active = this.active;
    const point = { x: event.clientX, y: event.clientY };
    if (active) event.preventDefault();
    this.clear();
    if (active) this.mouseDragDropped.emit(point);
  };
  private readonly pointerCancelled = (event: PointerEvent): void => {
    if (event.pointerId === this.gesture?.pointerId) this.cancel();
  };
  private readonly captureLost = (event: PointerEvent): void => {
    if (event.pointerId === this.gesture?.pointerId) this.cancel();
  };
  protected visibilityChanged(): void {
    if (this.document.hidden) this.cancel();
  }
  protected cancel(): void {
    const active = this.active;
    this.clear();
    if (active) this.mouseDragCancelled.emit();
  }
  private clear(): void {
    const gesture = this.gesture;
    this.gesture = null;
    this.active = false;
    this.document.removeEventListener('pointermove', this.move, true);
    this.document.removeEventListener('pointerup', this.end, true);
    this.document.removeEventListener('pointercancel', this.pointerCancelled, true);
    this.element.removeEventListener('lostpointercapture', this.captureLost);
    if (gesture) {
      this.element.draggable = gesture.previousDraggable;
      if (this.element.hasPointerCapture(gesture.pointerId))
        this.element.releasePointerCapture(gesture.pointerId);
    }
    this.preview?.remove();
    this.preview = null;
  }
  private createPreview(point: DragPoint): void {
    const bounds = this.element.getBoundingClientRect();
    const preview = this.element.cloneNode(true) as HTMLElement;
    preview.removeAttribute('id');
    preview.setAttribute('aria-hidden', 'true');
    preview.setAttribute('inert', '');
    preview.setAttribute('draggable', 'false');
    preview.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    preview.querySelectorAll('details').forEach((node) => (node.open = false));
    Object.assign(preview.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${bounds.width}px`,
      maxHeight: 'min(65dvh, 420px)',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: '90',
      opacity: '0.95',
      boxShadow: 'var(--shadow-dialog)',
      transformOrigin: 'top left',
    });
    this.previewOffset = Math.max(16, Math.min(bounds.width - 16, point.x - bounds.left));
    this.preview = preview;
    this.document.body.append(preview);
    this.movePreview(point);
  }
  private movePreview(point: DragPoint): void {
    if (this.preview)
      this.preview.style.transform = `translate3d(${point.x - this.previewOffset}px, ${point.y - 56}px, 0) scale(0.97)`;
  }
}
