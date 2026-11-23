import { Component, input, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

interface AudioAttachment {
  readonly id: string;
  readonly name: string;
  readonly url: string;
}

@Component({
  imports: [IconComponent],
  selector: 'app-audio-attachments',
  styleUrl: './audio-attachments.component.scss',
  templateUrl: './audio-attachments.component.html',
})
export class AudioAttachmentsComponent {
  readonly attachments = input.required<readonly AudioAttachment[]>();
  readonly label = input('Arquivos de áudio');
  protected readonly failedIds = signal<readonly string[]>([]);

  protected playbackFailed(id: string): void {
    this.failedIds.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }
}
