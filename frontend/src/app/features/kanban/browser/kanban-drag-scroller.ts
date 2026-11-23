import type { DragPoint } from './drag-point';

const edgeSpeed = (position: number, start: number, end: number): number => {
  const zone = Math.min(72, (end - start) / 3);
  if (zone <= 0) return 0;
  if (position < start + zone)
    return -Math.max(90, 720 * Math.min(1, (start + zone - position) / zone) ** 2);
  if (position > end - zone)
    return Math.max(90, 720 * Math.min(1, (position - end + zone) / zone) ** 2);
  return 0;
};

/** Rolagem do quadro em X e da página em Y, usando a última posição do gesto. */
export class KanbanDragScroller {
  private frame: number | null = null;
  private point: DragPoint | null = null;
  private lastTime = 0;

  constructor(
    private readonly document: Document,
    private readonly viewport: () => HTMLElement,
    private readonly onPosition: (point: DragPoint) => void,
  ) {}

  move(point: DragPoint): void {
    this.point = point;
    this.onPosition(point);
    const window = this.document.defaultView;
    if (window && this.point && this.frame === null)
      this.frame = window.requestAnimationFrame((time) => this.step(time));
  }

  stop(): void {
    const window = this.document.defaultView;
    if (window && this.frame !== null) window.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.point = null;
    this.lastTime = 0;
  }

  private step(time: number): void {
    this.frame = null;
    const window = this.document.defaultView;
    const point = this.point;
    const page = this.document.scrollingElement;
    if (!window || !point || !page) {
      this.stop();
      return;
    }
    const viewport = this.viewport();
    const bounds = viewport.getBoundingClientRect();
    const visual = window.visualViewport;
    const screenLeft = visual?.offsetLeft ?? 0;
    const screenTop = visual?.offsetTop ?? 0;
    const screenRight = screenLeft + (visual?.width ?? this.document.documentElement.clientWidth);
    const screenBottom = screenTop + (visual?.height ?? window.innerHeight);
    const headerBottom =
      this.document.querySelector('app-header')?.getBoundingClientRect().bottom ?? screenTop;
    const left = Math.max(bounds.left, screenLeft);
    const right = Math.min(bounds.right, screenRight);
    const top = Math.max(screenTop, headerBottom);
    const isNearBoard =
      point.x >= left - 80 &&
      point.x <= right + 80 &&
      point.y >= Math.max(bounds.top, top) - 80 &&
      point.y <= Math.min(bounds.bottom, screenBottom) + 80;
    if (!isNearBoard || right <= left || screenBottom <= top) {
      this.stop();
      return;
    }
    const seconds = (this.lastTime ? Math.min(32, time - this.lastTime) : 16) / 1000;
    this.lastTime = time;
    const speedX = edgeSpeed(point.x, left, right);
    const speedY = edgeSpeed(point.y, top, screenBottom);
    const previousX = viewport.scrollLeft;
    const previousY = page.scrollTop;
    viewport.scrollLeft = Math.max(
      0,
      Math.min(viewport.scrollWidth - viewport.clientWidth, previousX + speedX * seconds),
    );
    page.scrollTop = Math.max(
      0,
      Math.min(page.scrollHeight - page.clientHeight, previousY + speedY * seconds),
    );
    if (viewport.scrollLeft === previousX && page.scrollTop === previousY) {
      this.stop();
      return;
    }
    // Recalcular a inserção enquanto o ponteiro permanece parado perto da borda.
    this.onPosition(point);
    if (this.point) this.frame = window.requestAnimationFrame((next) => this.step(next));
  }
}
