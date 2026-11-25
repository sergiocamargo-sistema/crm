import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { DictationButtonComponent } from '../../../../shared/components/dictation-button/dictation-button.component';
import { SpeechToTextDirective } from '../../../../shared/directives/speech-to-text.directive';
import {
  INTERACTION_CHANNELS,
  INTERACTION_TYPES,
  type InteractionChannel,
  type NewCitizenInteraction,
  type NewConversationInteraction,
} from '../../models/citizen-detail';
import { CitizenDetailService } from '../../services/citizen-detail';
import { departmentOptions } from '../../../requests/models/department-options';
import { RequestDetailService } from '../../../requests/services/request-detail.service';

function initialContact(department: string): NewCitizenInteraction {
  const now = new Date();
  const pad = (value: number): string => String(value).padStart(2, '0');
  const occurredAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return {
    type: 'attendance',
    direction: 'active',
    occurredAt,
    title: '',
    description: '',
    department,
  };
}

@Component({
  imports: [IconComponent, FormField, SpeechToTextDirective, DictationButtonComponent, RouterLink],
  selector: 'app-new-interaction',
  styleUrl: './new-interaction.component.scss',
  templateUrl: './new-interaction.component.html',
})
export class NewInteractionComponent {
  readonly citizenId = input.required<string | null>();
  readonly citizenName = input.required<string>();
  readonly requestId = input<string>();
  readonly showFloatingButton = input(true);
  readonly saved = output<void>();
  private readonly service = inject(CitizenDetailService);
  private readonly requestService = inject(RequestDetailService);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('contactDialog');
  private readonly dictation = viewChild(SpeechToTextDirective);
  private trigger: HTMLElement | null = null;
  private readonly model = signal(initialContact(''));
  private readonly conversation = signal<NewConversationInteraction>({
    channel: 'in-person',
    description: '',
  });
  protected readonly mode = signal<'interaction' | 'contact'>('interaction');
  protected readonly channels = INTERACTION_CHANNELS;
  protected readonly selectedChannel = computed(() => this.conversation().channel);
  protected readonly selectedChannelLabel = computed(
    () => INTERACTION_CHANNELS.find((channel) => channel.value === this.selectedChannel())!.label,
  );
  protected readonly interactionTypes = INTERACTION_TYPES.filter(
    ({ value }) => value !== 'conversation' && value !== 'request',
  );
  protected readonly departments = computed(() =>
    departmentOptions(this.requestService.catalog.departments()),
  );
  protected readonly attempted = signal(false);
  protected readonly failure = signal('');
  protected readonly conversationForm = form(this.conversation, (schema) => {
    required(schema.channel);
    required(schema.description);
    maxLength(schema.description, 1500);
    validate(schema.description, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Registre o que foi conversado.' } : undefined,
    );
  });
  protected readonly contactForm = form(this.model, (schema) => {
    required(schema.type);
    required(schema.direction);
    required(schema.department);
    required(schema.occurredAt);
    validate(schema.occurredAt, ({ value }) =>
      !Number.isFinite(Date.parse(value()))
        ? { kind: 'date', message: 'Informe uma data válida.' }
        : undefined,
    );
    required(schema.title);
    maxLength(schema.title, 100);
    validate(schema.title, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Informe o título.' } : undefined,
    );
    required(schema.description);
    maxLength(schema.description, 1500);
    validate(schema.description, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Descreva o contato.' } : undefined,
    );
  });

  constructor() {
    effect(() => {
      this.citizenId();
      this.requestId();
      afterNextRender(
        () => {
          this.dictation()?.stop();
          this.trigger = null;
          if (this.dialog().nativeElement.open) this.dialog().nativeElement.close();
        },
        { injector: this.injector },
      );
    });
  }

  protected open(event: MouseEvent): void {
    this.showEditor(event.currentTarget as HTMLElement, 'interaction');
  }

  openOtherContact(trigger: HTMLElement): void {
    this.showEditor(trigger, 'contact');
  }

  private showEditor(trigger: HTMLElement, mode: 'interaction' | 'contact'): void {
    this.dictation()?.reset();
    this.trigger = trigger;
    this.mode.set(mode);
    this.model.set({
      ...initialContact(
        this.departments().find(({ id }) => id === 'dept-gabinete')?.id ??
          this.departments()[0]?.id ??
          '',
      ),
      requestId: this.requestId(),
    });
    this.conversation.set({ channel: 'in-person', description: '' });
    this.attempted.set(false);
    this.failure.set('');
    afterNextRender(() => this.dialog().nativeElement.showModal(), { injector: this.injector });
  }

  protected selectChannel(channel: InteractionChannel): void {
    this.conversation.update((current) => ({ ...current, channel }));
  }

  protected saveConversation(event: SubmitEvent): void {
    event.preventDefault();
    this.dictation()?.stop();
    this.attempted.set(true);
    this.failure.set('');
    void submit(this.conversationForm, async () => {
      try {
        const requestId = this.requestId();
        const citizenId = this.citizenId();
        if (requestId)
          await this.requestService.registerInteraction(requestId, this.conversation());
        else if (citizenId) await this.service.registerInteraction(citizenId, this.conversation());
        else throw new Error('Informe o contexto da interação.');
        this.dialog().nativeElement.close();
        this.saved.emit();
      } catch (error: unknown) {
        this.failure.set(
          error instanceof Error ? error.message : 'Não foi possível registrar a interação.',
        );
      }
    });
  }

  protected save(event: SubmitEvent): void {
    event.preventDefault();
    this.attempted.set(true);
    this.failure.set('');
    void submit(this.contactForm, async () => {
      try {
        const requestId = this.requestId();
        const citizenId = this.citizenId();
        const formValue = this.model();
        const department = this.departments().find(({ id }) => id === formValue.department);
        if (!department) throw new Error('Selecione um departamento.');
        const contact = { ...formValue, departmentId: department.id, department: department.name };
        if (requestId) await this.requestService.registerContact(requestId, contact);
        else if (citizenId) await this.service.registerContact(citizenId, contact);
        else throw new Error('Informe o contexto do contato.');
        this.dialog().nativeElement.close();
        this.saved.emit();
      } catch (error: unknown) {
        this.failure.set(
          error instanceof Error ? error.message : 'Não foi possível registrar o contato.',
        );
      }
    });
  }

  protected onClose(): void {
    this.dictation()?.stop();
    if (this.trigger?.isConnected) this.trigger.focus({ preventScroll: true });
    this.trigger = null;
  }

  protected onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialog().nativeElement;
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
}
