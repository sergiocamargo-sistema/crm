import { Component, computed, inject, input, signal } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';
import { PhotoGalleryComponent } from '../../../../shared/components/photo-gallery/photo-gallery.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AudioAttachmentsComponent } from '../../../../shared/components/audio-attachments/audio-attachments.component';
import { ATTACHMENT_ACCEPT, attachmentSize } from '../../../requests/models/attachment-files';
@Component({
  selector: 'app-task-attachments',
  imports: [PhotoGalleryComponent, AudioAttachmentsComponent, IconComponent],
  templateUrl: './task-attachments.component.html',
  styleUrl: './task-attachments.component.scss',
})
export class TaskAttachmentsComponent {
  readonly taskId = input.required<string>();
  private readonly board = inject(KanbanService);
  private readonly task = this.board.observeTask(this.taskId).state;
  protected readonly accept = ATTACHMENT_ACCEPT;
  protected readonly sizeLabel = attachmentSize;
  protected readonly failure = signal('');
  protected readonly attachments = computed(() => this.task()?.attachments ?? []);
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
  protected async addFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.failure.set('');
    try {
      await this.board.addAttachments(this.taskId(), files);
    } catch (error: unknown) {
      this.failure.set(
        error instanceof Error ? error.message : 'Não foi possível anexar os arquivos.',
      );
    }
  }
}
