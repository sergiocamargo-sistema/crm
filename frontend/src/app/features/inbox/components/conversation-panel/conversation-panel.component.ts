import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  EMPTY_DRAFT,
  type ComposeMessage,
  type ComposerDraft,
  type Conversation,
  type MessageAttachment,
} from '../../../../core/models/inbox';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';

@Component({
  selector: 'app-conversation-panel',
  imports: [IconComponent, MessageComposerComponent],
  templateUrl: './conversation-panel.component.html',
  styleUrl: './conversation-panel.component.scss',
})
export class ConversationPanelComponent {
  readonly conversation = input.required<Conversation>();
  readonly currentUserId = input.required<string>();
  readonly connected = input(true);
  readonly initialDraft = input<ComposerDraft>(EMPTY_DRAFT);
  readonly revision = input(0);
  readonly messageSubmitted = output<ComposeMessage>();
  readonly assumeRequested = output<void>();
  readonly transferRequested = output<void>();
  readonly closeRequested = output<void>();
  readonly citizenRequested = output<void>();
  readonly requestRequested = output<void>();
  readonly backRequested = output<void>();
  readonly attachmentRequested = output<MessageAttachment>();
  protected readonly canManage = computed(
    () =>
      this.conversation().owner?.id === this.currentUserId() &&
      this.conversation().status === 'active',
  );
  private readonly composer = viewChild(MessageComposerComponent);
  private readonly history = viewChild.required<ElementRef<HTMLElement>>('history');

  constructor() {
    afterRenderEffect(() => {
      this.conversation().messages.length;
      const element = this.history().nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }
  captureDraft(): ComposerDraft {
    return this.composer()?.captureDraft() ?? EMPTY_DRAFT;
  }
}
