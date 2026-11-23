import {
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import {
  EMPTY_DRAFT,
  type ComposeMessage,
  type ComposerDraft,
  type Conversation,
  type MessageAttachment,
} from '../../../../core/models/inbox';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-message-composer',
  imports: [IconComponent, FormField],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss',
})
export class MessageComposerComponent {
  readonly conversation = input.required<Conversation>();
  readonly connected = input(true);
  readonly initialDraft = input<ComposerDraft>(EMPTY_DRAFT);
  readonly revision = input(0);
  readonly messageSubmitted = output<ComposeMessage>();
  private readonly draftKey = computed(() => `${this.conversation().id}:${this.revision()}`);
  private readonly composerModel = linkedSignal({
    source: this.draftKey,
    computation: () => ({ message: this.initialDraft().text }),
  });
  protected readonly composerForm = form(this.composerModel);
  protected readonly mode = linkedSignal({
    source: this.draftKey,
    computation: () => this.initialDraft().mode,
  });
  protected readonly attachments = linkedSignal({
    source: this.draftKey,
    computation: () => this.initialDraft().attachments,
  });
  protected readonly attachmentError = linkedSignal({
    source: this.draftKey,
    computation: () => '',
  });
  protected readonly firstName = computed(() => this.conversation().citizen.name.split(' ')[0]);
  protected readonly canSend = computed(
    () =>
      (this.mode() === 'note' || this.connected()) &&
      (this.composerModel().message.trim().length > 0 || this.attachments().length > 0),
  );
  private readonly messageInput = viewChild<ElementRef<HTMLTextAreaElement>>('messageInput');

  captureDraft(): ComposerDraft {
    return {
      text: this.composerModel().message,
      mode: this.mode(),
      attachments: this.attachments(),
    };
  }

  protected send(): void {
    if (!this.canSend()) return;
    this.messageSubmitted.emit({
      text: this.composerModel().message,
      mode: this.mode(),
      attachments: this.attachments(),
    });
    this.attachmentError.set('');
    this.messageInput()?.nativeElement.focus();
  }

  protected useSuggestion(): void {
    this.composerModel.set({ message: this.conversation().suggestedReply });
    this.messageInput()?.nativeElement.focus();
  }

  protected addEmoji(): void {
    this.composerModel.update((value) => ({ message: `${value.message} 😊`.trimStart() }));
    this.messageInput()?.nativeElement.focus();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.send();
    }
  }

  protected selectFiles(input: HTMLInputElement): void {
    this.attachmentError.set('');
    const files = Array.from(input.files ?? []);
    if (files.some((file) => file.size > 25 * 1024 * 1024)) {
      this.attachmentError.set('Cada arquivo pode ter no máximo 25 MB nesta prévia.');
      input.value = '';
      return;
    }
    if (files.length + this.attachments().length > 10) {
      this.attachmentError.set('Adicione até 10 arquivos por mensagem.');
      input.value = '';
      return;
    }
    this.attachments.update((existing) => [
      ...existing,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type,
        sizeLabel:
          file.size < 1024 * 1024
            ? `${Math.max(1, Math.ceil(file.size / 1024))} KB`
            : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      })),
    ]);
    input.value = '';
  }

  protected removeAttachment(id: string): void {
    this.attachments.update((items) => items.filter((item) => item.id !== id));
  }
}
