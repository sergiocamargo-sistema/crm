import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  applyEach,
  disabled,
  email,
  form,
  FormField,
  maxLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CitizenSearchComponent } from '../../../../shared/components/citizen-search/citizen-search.component';
import { CitizenCategoriesComponent } from '../../../../shared/components/citizen-categories/citizen-categories.component';
import { DictationButtonComponent } from '../../../../shared/components/dictation-button/dictation-button.component';
import { SpeechToTextDirective } from '../../../../shared/directives/speech-to-text.directive';
import { PhotoGalleryComponent } from '../../../../shared/components/photo-gallery/photo-gallery.component';
import {
  emptyCitizenDraft,
  validCitizenBirthDate,
  validCitizenPhone,
  type CitizenAddressDraft,
} from '../../models/citizen-registration';
import { currentCitizenCalendarDate } from '../../models/citizen-birth-filters';
import { CitizenRegistrationService } from '../../services/citizen-registration.service';
import type { CitizenSummary } from '../../../../core/models/citizen-summary';

@Component({
  imports: [
    RouterLink,
    FormField,
    IconComponent,
    CitizenSearchComponent,
    CitizenCategoriesComponent,
    DictationButtonComponent,
    SpeechToTextDirective,
    PhotoGalleryComponent,
  ],
  providers: [CitizenRegistrationService],
  selector: 'app-citizen-editor',
  styleUrl: './citizen-editor.component.scss',
  templateUrl: './citizen-editor.component.html',
})
export class CitizenEditorComponent {
  protected readonly service = inject(CitizenRegistrationService);
  protected readonly state = this.service.store;
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('pageTitle');
  private readonly errors = viewChild<ElementRef<HTMLElement>>('errorSummary');
  private readonly reviewPanel = viewChild<ElementRef<HTMLElement>>('reviewPanel');
  private readonly discardDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('discardDialog');
  private readonly referrerPicker = viewChild<CitizenSearchComponent>('referrerPicker');
  private readonly removeReferrerButton =
    viewChild<ElementRef<HTMLButtonElement>>('removeReferrerButton');
  private readonly addPhotosButton = viewChild<ElementRef<HTMLButtonElement>>('addPhotosButton');
  protected readonly categoryControl = viewChild<CitizenCategoriesComponent>('categoryControl');
  private leaveResolver: ((discard: boolean) => void) | null = null;
  private leavePromise: Promise<boolean> | null = null;
  protected readonly model = signal(emptyCitizenDraft());
  protected readonly attempted = signal(false);
  protected readonly referrer = signal<CitizenSummary | null>(null);
  protected readonly reason = signal({ text: '' });
  protected readonly reasonForm = form(this.reason, (schema) => {
    required(schema.text, { message: 'Explique por que este é outro munícipe.' });
    maxLength(schema.text, 500, { message: 'Use até 500 caracteres na justificativa.' });
    validate(schema.text, ({ value }) =>
      value().trim().length < 3
        ? { kind: 'reason', message: 'Use pelo menos três caracteres na justificativa.' }
        : undefined,
    );
    disabled(schema, () => this.state.saving());
  });
  protected readonly fields = form(this.model, (schema) => {
    disabled(schema, () => this.state.saving() || !!this.state.createdId());
    required(schema.name, { message: 'Informe o nome do munícipe.' });
    maxLength(schema.name, 200, { message: 'Nome: use até 200 caracteres.' });
    validate(schema.name, ({ value }) =>
      value().trim() ? undefined : { kind: 'blank', message: 'Informe o nome do munícipe.' },
    );
    validate(schema.birthDate, ({ value }) =>
      validCitizenBirthDate(value(), currentCitizenCalendarDate())
        ? undefined
        : { kind: 'date', message: 'Informe uma data de nascimento válida, até hoje.' },
    );
    maxLength(schema.occupation, 120, { message: 'Profissão: use até 120 caracteres.' });
    maxLength(schema.cra, 60, { message: 'CRA: use até 60 caracteres.' });
    maxLength(schema.observations, 20000, { message: 'Observações: use até 20.000 caracteres.' });
    applyEach(schema.phones, (phone) => {
      validate(phone.number, ({ value }) =>
        validCitizenPhone(value())
          ? undefined
          : { kind: 'phone', message: 'Telefone: informe de 8 a 15 dígitos.' },
      );
      maxLength(phone.label, 120, { message: 'Descrição do telefone: use até 120 caracteres.' });
    });
    applyEach(schema.emails, (item) => {
      email(item.address, { message: 'Informe um e-mail válido.' });
      maxLength(item.address, 254, { message: 'E-mail: use até 254 caracteres.' });
      maxLength(item.label, 120, { message: 'Descrição do e-mail: use até 120 caracteres.' });
    });
    applyEach(schema.documents, (doc) => {
      maxLength(doc.value, 100, { message: 'Documento: use até 100 caracteres.' });
      maxLength(doc.issuer, 100, { message: 'Órgão emissor: use até 100 caracteres.' });
    });
    applyEach(schema.addresses, (address) => {
      maxLength(address.street, 300);
      maxLength(address.number, 300);
      maxLength(address.complement, 300);
      maxLength(address.neighborhood, 300);
      maxLength(address.city, 300);
      maxLength(address.reference, 300);
      validate(address.state, ({ value }) =>
        !value().trim() || /^[a-z]{2}$/iu.test(value().trim())
          ? undefined
          : { kind: 'state', message: 'UF: informe duas letras.' },
      );
      validate(address.postalCode, ({ value }) =>
        !value().trim() || /^\d{5}-?\d{3}$/u.test(value().trim())
          ? undefined
          : { kind: 'postalCode', message: 'CEP: informe oito dígitos.' },
      );
    });
  });
  protected readonly dirty = computed(
    () =>
      JSON.stringify(this.model()) !== JSON.stringify(emptyCitizenDraft()) ||
      !!this.state.photos().length,
  );

  constructor() {
    afterNextRender(() => this.heading()?.nativeElement.focus());
    effect(() => {
      this.model();
      untracked(() => this.service.clearReview());
    });
  }

  protected addPhone(): void {
    this.model.update((draft) => ({
      ...draft,
      phones: [
        ...draft.phones,
        { key: crypto.randomUUID(), number: '', label: '', whatsapp: false },
      ],
    }));
    this.focusLast('phone');
  }
  protected addEmail(): void {
    this.model.update((draft) => ({
      ...draft,
      emails: [...draft.emails, { key: crypto.randomUUID(), address: '', label: '' }],
    }));
    this.focusLast('email');
  }
  protected addAddress(): void {
    const address: CitizenAddressDraft = {
      key: crypto.randomUUID(),
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      reference: '',
    };
    this.model.update((draft) => ({ ...draft, addresses: [...draft.addresses, address] }));
    this.focusLast('address');
  }
  protected addDocument(): void {
    this.model.update((draft) => ({
      ...draft,
      documents: [
        ...draft.documents,
        {
          key: crypto.randomUUID(),
          type: this.state.configuration()?.documentTypes[0]?.value ?? '',
          value: '',
          issuer: '',
        },
      ],
    }));
    this.focusLast('document');
  }
  protected removeItem(
    group: 'phones' | 'emails' | 'addresses' | 'documents',
    key: string,
    trigger: HTMLElement,
  ): void {
    const container = trigger.closest('section');
    this.model.update((draft) => ({
      ...draft,
      [group]: draft[group].filter((item) => item.key !== key),
    }));
    afterNextRender(() => container?.querySelector<HTMLButtonElement>('.add-item')?.focus(), {
      injector: this.injector,
    });
  }
  protected primaryAddress(key: string): void {
    this.model.update((draft) => ({
      ...draft,
      addresses: [
        ...draft.addresses.filter((address) => address.key === key),
        ...draft.addresses.filter((address) => address.key !== key),
      ],
    }));
    afterNextRender(
      () =>
        this.heading()
          ?.nativeElement.closest('.activity-page')
          ?.querySelector<HTMLInputElement>('[data-editor-group="address"] input')
          ?.focus(),
      { injector: this.injector },
    );
  }
  protected setCategories(categories: readonly string[]): void {
    this.model.update((draft) => ({ ...draft, categories: [...categories] }));
  }
  protected selectReferrer(person: CitizenSummary): void {
    this.referrer.set(person);
    this.model.update((draft) => ({ ...draft, referrerId: person.id }));
    afterNextRender(() => this.removeReferrerButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }
  protected removeReferrer(): void {
    this.referrer.set(null);
    this.model.update((draft) => ({ ...draft, referrerId: '' }));
    afterNextRender(() => this.referrerPicker()?.focus(), { injector: this.injector });
  }
  protected addPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.service.addPhotos(Array.from(input.files ?? []));
    input.value = '';
  }
  protected save(event: SubmitEvent): void {
    event.preventDefault();
    this.persist(false);
  }
  protected removePhoto(src: string): void {
    this.service.removePhoto(src);
    afterNextRender(() => this.addPhotosButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }
  protected primaryPhoto(src: string): void {
    this.service.makePhotoPrimary(src);
    afterNextRender(() => this.addPhotosButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }
  protected confirmDistinct(): void {
    void submit(this.reasonForm, async () => {
      this.persist(true);
    });
  }
  private persist(confirm: boolean): void {
    if (this.state.saving() || this.categoryControl()?.busy()) return;
    this.attempted.set(true);
    if (this.fields().invalid()) {
      afterNextRender(() => this.errors()?.nativeElement.focus(), { injector: this.injector });
      return;
    }
    void submit(this.fields, async () => {
      const id = await this.service.save(this.model(), confirm ? this.reason().text : undefined);
      if (id) await this.router.navigate(['/municipes', id]);
      else
        afterNextRender(
          () => (this.state.review() ? this.reviewPanel() : this.errors())?.nativeElement.focus(),
          { injector: this.injector },
        );
    });
  }
  private focusLast(group: string): void {
    afterNextRender(
      () => {
        const items = this.heading()
          ?.nativeElement.closest('.activity-page')
          ?.querySelectorAll<HTMLElement>(`[data-editor-group="${group}"]`);
        items
          ?.item(items.length - 1)
          ?.querySelector<HTMLInputElement>('input')
          ?.focus();
      },
      { injector: this.injector },
    );
  }
  canLeave(): boolean | Promise<boolean> {
    if (this.state.saving() || this.categoryControl()?.busy()) return false;
    if (this.state.createdId() || !this.dirty()) return true;
    if (!this.leavePromise) {
      this.leavePromise = new Promise((resolve) => {
        this.leaveResolver = resolve;
      });
      this.discardDialog().nativeElement.returnValue = 'keep';
      this.discardDialog().nativeElement.showModal();
    }
    return this.leavePromise;
  }
  protected resolveLeave(): void {
    this.leaveResolver?.(this.discardDialog().nativeElement.returnValue === 'discard');
    this.leaveResolver = null;
    this.leavePromise = null;
  }
}
