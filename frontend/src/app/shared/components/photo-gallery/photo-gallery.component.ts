import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface GalleryPhoto {
  readonly src: string;
  readonly label: string;
}

@Component({
  imports: [NgOptimizedImage, IconComponent],
  selector: 'app-photo-gallery',
  styleUrl: './photo-gallery.component.scss',
  templateUrl: './photo-gallery.component.html',
})
export class PhotoGalleryComponent {
  readonly photos = input.required<readonly GalleryPhoto[]>();
  readonly galleryId = input.required<string>();
  readonly title = input('Fotos');
  readonly contextName = input('');
  readonly priority = input(false);
  readonly showLabels = input(true);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('photoDialog');
  private readonly mobile = signal(false);
  private readonly isOpen = signal(false);
  private trigger: HTMLElement | null = null;
  protected readonly brokenPhotos = signal<ReadonlySet<string>>(new Set());
  protected readonly photoPosition = signal(0);
  protected readonly previews = computed(() => this.photos().slice(0, this.mobile() ? 3 : 4));
  protected readonly selectedPhoto = computed(() =>
    this.isOpen() ? (this.photos()[this.photoPosition()] ?? null) : null,
  );

  constructor() {
    afterNextRender(() => {
      const query = window.matchMedia('(max-width: 600px)');
      const update = () => this.mobile.set(query.matches);
      update();
      query.addEventListener('change', update);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', update));
    });
    effect(() => {
      this.photos();
      this.isOpen.set(false);
      this.photoPosition.set(0);
      afterNextRender(
        () => {
          if (this.dialog().nativeElement.open) this.dialog().nativeElement.close();
        },
        { injector: this.injector },
      );
    });
  }

  protected openPhoto(index: number, event: MouseEvent): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.photoPosition.set(index);
    this.isOpen.set(true);
    this.dialog().nativeElement.showModal();
  }

  protected changePhoto(direction: number): void {
    this.photoPosition.update((index) =>
      Math.max(0, Math.min(this.photos().length - 1, index + direction)),
    );
  }

  protected onPhotoKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.changePhoto(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  protected imageFailed(src: string): void {
    this.brokenPhotos.update((photos) => new Set([...photos, src]));
  }

  protected closePhoto(): void {
    this.isOpen.set(false);
    if (this.trigger?.isConnected) this.trigger.focus({ preventScroll: true });
    this.trigger = null;
  }

  protected onPhotoBackdropClick(event: MouseEvent): void {
    const dialog = this.dialog().nativeElement;
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }
}
