import { DestroyRef, Directive, DOCUMENT, ElementRef, inject, output } from '@angular/core';
import type { DragPoint } from '../browser/drag-point';

interface TouchGesture {
  readonly identifier: number;
  readonly origin: DragPoint;
  point: DragPoint;
}

const HOLD_DELAY_MS = 350;
const SCROLL_TOLERANCE_PX = 8;

@Directive({
  selector: '[appTouchCardDrag]',
  host: {
    '(contextmenu)': 'contextMenu($event)',
    '(window:blur)': 'cancel()',
    '(document:keydown.escape)': 'cancel()',
    '(document:visibilitychange)': 'visibilityChanged()',
  },
})
export class TouchCardDragDirective {
  readonly touchDragStarted = output<DragPoint>();
  readonly touchDragMoved = output<DragPoint>();
  readonly touchDragDropped = output<DragPoint>();
  readonly touchDragCancelled = output<void>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private gesture: TouchGesture | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private active = false;
  private preview: HTMLElement | null = null;
  private previewOffset = 0;

  constructor() {
    this.element.addEventListener('touchstart', this.start, { passive: true });
    inject(DestroyRef).onDestroy(() => {
      this.cancel();
      this.element.removeEventListener('touchstart', this.start);
    });
  }

  private readonly start = (event: TouchEvent): void => {
    if (event.touches.length !== 1 || this.gesture) {
      this.cancel();
      return;
    }
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('a, input, textarea, select, details, button:not(.task-title)')
    )
      return;
    const touch = event.touches[0];
    const point = { x: touch.clientX, y: touch.clientY };
    this.gesture = { identifier: touch.identifier, origin: point, point };
    this.document.addEventListener('touchstart', this.additionalTouch, { passive: true });
    this.document.addEventListener('touchmove', this.move, { passive: false });
    this.document.addEventListener('touchend', this.end, { passive: false });
    this.document.addEventListener('touchcancel', this.touchCancelled, { passive: true });
    this.timer = setTimeout(() => {
      const gesture = this.gesture;
      if (!gesture) return;
      this.active = true;
      this.createPreview(gesture.point);
      this.touchDragStarted.emit(gesture.point);
    }, HOLD_DELAY_MS);
  };

  private readonly additionalTouch = (event: TouchEvent): void => {
    if (event.touches.length !== 1) this.cancel();
  };
  private readonly move = (event: TouchEvent): void => {
    const gesture = this.gesture;
    if (!gesture) return;
    if (event.touches.length !== 1) {
      this.cancel();
      return;
    }
    const touch = Array.from(event.touches).find((item) => item.identifier === gesture.identifier);
    if (!touch) {
      this.cancel();
      return;
    }
    gesture.point = { x: touch.clientX, y: touch.clientY };
    if (!this.active) {
      if (
        Math.hypot(gesture.point.x - gesture.origin.x, gesture.point.y - gesture.origin.y) >
        SCROLL_TOLERANCE_PX
      )
        this.cancel();
      return;
    }
    if (!event.cancelable) {
      this.cancel();
      return;
    }
    event.preventDefault();
    this.movePreview(gesture.point);
    this.touchDragMoved.emit(gesture.point);
  };
  private readonly end = (event: TouchEvent): void => {
    const gesture = this.gesture;
    if (!gesture) return;
    const touch = Array.from(event.changedTouches).find(
      (item) => item.identifier === gesture.identifier,
    );
    if (!touch) return;
    const active = this.active;
    const point = { x: touch.clientX, y: touch.clientY };
    if (active && event.cancelable) event.preventDefault();
    this.clear();
    if (active) this.touchDragDropped.emit(point);
  };
  private readonly touchCancelled = (): void => this.cancel();

  protected contextMenu(event: Event): void {
    if (this.gesture) event.preventDefault();
  }
  protected visibilityChanged(): void {
    if (this.document.hidden) this.cancel();
  }
  protected cancel(): void {
    const active = this.active;
    this.clear();
    if (active) this.touchDragCancelled.emit();
  }
  private clear(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.active = false;
    this.gesture = null;
    this.preview?.remove();
    this.preview = null;
    this.document.removeEventListener('touchstart', this.additionalTouch);
    this.document.removeEventListener('touchmove', this.move);
    this.document.removeEventListener('touchend', this.end);
    this.document.removeEventListener('touchcancel', this.touchCancelled);
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
