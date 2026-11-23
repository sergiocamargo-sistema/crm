import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import {
  EMPTY_DRAFT,
  type ComposeMessage,
  type ComposerDraft,
  type MessageAttachment,
} from '../../../../core/models/inbox';
import { AppHeaderComponent } from '../../../../layout/app-header/app-header.component';
import { InboxSummaryComponent } from '../../components/inbox-summary/inbox-summary.component';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CitizenContextComponent } from '../../components/citizen-context/citizen-context.component';
import { ConversationListComponent } from '../../components/conversation-list/conversation-list.component';
import { ConversationPanelComponent } from '../../components/conversation-panel/conversation-panel.component';
import { InboxService } from '../../services/inbox';

type DialogType =
  'citizen' | 'request' | 'transfer' | 'close' | 'whatsapp' | 'help' | 'new' | 'attachment';
const TITLES: Record<DialogType, string> = {
  citizen: 'Contexto do munícipe',
  request: 'Resumo do atendimento',
  transfer: 'Transferir conversa',
  close: 'Encerrar conversa',
  whatsapp: 'Conexão do WhatsApp',
  help: 'Conheça sua caixa de atendimento',
  new: 'Novo atendimento',
  attachment: 'Anexo da conversa',
};

@Component({
  selector: 'app-inbox-page',
  imports: [
    AppHeaderComponent,
    InboxSummaryComponent,
    SidebarComponent,
    IconComponent,
    CitizenContextComponent,
    ConversationListComponent,
    ConversationPanelComponent,
    FormField,
  ],
  templateUrl: './inbox-page.component.html',
  styleUrl: './inbox-page.component.scss',
  host: { '(window:keydown)': 'onShortcut($event)' },
})
export class InboxPageComponent {
  protected readonly inbox = inject(InboxService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly mobileConversationOpen = signal(false);
  protected readonly dialogType = signal<DialogType | null>(null);
  protected readonly dialogTitle = computed(() => {
    const type = this.dialogType();
    return type ? TITLES[type] : 'Atendimento';
  });
  protected readonly toast = signal('');
  protected readonly toastTone = signal<'info' | 'error'>('info');
  protected readonly composerRevision = signal(0);
  protected readonly selectedAttachment = signal<MessageAttachment | null>(null);
  private readonly transferModel = signal({ staffId: this.inbox.store.team[0]?.id ?? '' });
  protected readonly transferForm = form(this.transferModel);
  private readonly drafts = new Map<string, ComposerDraft>();
  private readonly conversationPanel = viewChild(ConversationPanelComponent);
  private readonly conversationList = viewChild(ConversationListComponent);
  private readonly detailDialog = viewChild.required<ElementRef<HTMLDialogElement>>('detailDialog');
  private readonly navigationDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('navigationDialog');
  private readonly staffSelect = viewChild<ElementRef<HTMLSelectElement>>('staffSelect');
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.toastTimer));
  }

  protected draftFor(id: string): ComposerDraft {
    return this.drafts.get(id) ?? EMPTY_DRAFT;
  }

  protected selectConversation(id: string): void {
    this.drafts.set(
      this.inbox.selectedId(),
      this.conversationPanel()?.captureDraft() ?? EMPTY_DRAFT,
    );
    this.inbox.select(id);
    this.mobileConversationOpen.set(true);
  }

  protected clearFilters(): void {
    this.inbox.query.set('');
    this.inbox.filter.set('all');
    this.inbox.onlyUnread.set(false);
  }
  protected openNavigation(): void {
    this.navigationDialog().nativeElement.showModal();
  }

  protected openDialog(type: DialogType): void {
    this.dialogType.set(type);
    const dialog = this.detailDialog().nativeElement;
    if (!dialog.open) dialog.showModal();
    afterNextRender(
      () => {
        if (this.dialogType() === 'transfer') this.staffSelect()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  protected closeOnBackdrop(event: MouseEvent): void {
    const dialog = this.detailDialog().nativeElement;
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  }

  protected assumeConversation(): void {
    this.perform(() => {
      this.inbox.assume();
      this.notify('Conversa assumida. Você já pode responder.');
    });
  }

  protected sendMessage(command: ComposeMessage): void {
    this.perform(() => {
      if (!this.inbox.send(command)) return;
      this.drafts.set(this.inbox.selectedId(), { text: '', mode: command.mode, attachments: [] });
      this.composerRevision.update((value) => value + 1);
      this.notify(
        command.mode === 'note'
          ? 'Nota interna adicionada. Visível apenas para a equipe.'
          : 'Resposta registrada na demonstração.',
      );
    });
  }

  protected transferConversation(): void {
    this.perform(() => {
      this.drafts.set(
        this.inbox.selectedId(),
        this.conversationPanel()?.captureDraft() ?? EMPTY_DRAFT,
      );
      this.inbox.transfer(this.transferModel().staffId);
      const name = this.inbox.team.find(
        (member) => member.id === this.transferModel().staffId,
      )?.name;
      this.detailDialog().nativeElement.close();
      this.notify(`Conversa transferida para ${name}.`);
    });
  }

  protected closeConversation(): void {
    this.perform(() => {
      this.inbox.close();
      this.detailDialog().nativeElement.close();
      this.notify('Conversa encerrada. O histórico foi preservado.');
    });
  }
  protected simulateDisconnection(): void {
    this.inbox.connected.set(false);
    this.detailDialog().nativeElement.close();
    this.notify('Desconexão simulada. As conversas continuam disponíveis.');
  }
  protected reconnect(): void {
    this.inbox.connected.set(true);
    this.detailDialog().nativeElement.close();
    this.notify('Conexão restaurada na demonstração.');
  }
  protected showAttachment(attachment: MessageAttachment): void {
    this.selectedAttachment.set(attachment);
    this.openDialog('attachment');
  }

  protected resetDemo(): void {
    this.drafts.clear();
    this.inbox.reset();
    this.composerRevision.update((value) => value + 1);
    this.mobileConversationOpen.set(false);
    this.detailDialog().nativeElement.close();
    this.notify('Demonstração reiniciada com os dados iniciais.');
  }

  protected onShortcut(event: KeyboardEvent): void {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'k' &&
      !this.detailDialog().nativeElement.open
    ) {
      event.preventDefault();
      this.mobileConversationOpen.set(false);
      this.conversationList()?.focusSearch();
    }
  }

  private perform(action: () => void): void {
    try {
      action();
    } catch (error: unknown) {
      this.notify(
        error instanceof Error ? error.message : 'Não foi possível concluir a ação.',
        'error',
      );
    }
  }
  private notify(message: string, tone: 'info' | 'error' = 'info'): void {
    clearTimeout(this.toastTimer);
    this.toastTone.set(tone);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(''), 5000);
  }
}
