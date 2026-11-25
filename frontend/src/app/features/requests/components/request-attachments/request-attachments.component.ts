import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PhotoGalleryComponent } from '../../../../shared/components/photo-gallery/photo-gallery.component';
import { AudioAttachmentsComponent } from '../../../../shared/components/audio-attachments/audio-attachments.component';
import { ATTACHMENT_ACCEPT, attachmentSize } from '../../models/attachment-files';
import type { RequestAttachment } from '../../models/request-detail';
import { RequestDetailService } from '../../services/request-detail.service';

@Component({
  imports: [PhotoGalleryComponent, AudioAttachmentsComponent, IconComponent],
  selector: 'app-request-attachments',
  styleUrl: './request-attachments.component.scss',
  templateUrl: './request-attachments.component.html',
})
export class RequestAttachmentsComponent {
  readonly requestId = input.required<string>();
  readonly attachments = input.required<readonly RequestAttachment[]>();
  readonly added = output<void>();
  private readonly service = inject(RequestDetailService);
  protected readonly accept = ATTACHMENT_ACCEPT;
  protected readonly failure = signal('');
  protected readonly photos = computed(() =>
    this.attachments()
      .filter((item) => item.kind === 'photo')
      .map((item) => ({ src: item.url, label: item.name })),
  );
  protected readonly documents = computed(() =>
    this.attachments().filter((item) => item.kind === 'document'),
  );
  protected readonly audios = computed(() =>
    this.attachments().filter((item) => item.kind === 'audio'),
  );
  protected readonly sizeLabel = attachmentSize;

  constructor() {
    effect(() => {
      this.requestId();
      this.failure.set('');
    });
  }

  protected async addFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    this.failure.set('');
    try {
      await this.service.addAttachments(this.requestId(), files);
      this.added.emit();
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível adicionar os arquivos.',
      );
    }
  }
}
