import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, submit } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CitizenCategoriesComponent } from '../../../../shared/components/citizen-categories/citizen-categories.component';
import type { CitizenDetail } from '../../models/citizen-detail';
import { CitizenDetailService } from '../../services/citizen-detail';

@Component({
  imports: [IconComponent, FormField, CitizenCategoriesComponent],
  selector: 'app-citizen-notes',
  styleUrl: './citizen-notes.component.scss',
  templateUrl: './citizen-notes.component.html',
})
export class CitizenNotesComponent {
  readonly citizen = input.required<CitizenDetail>();
  private readonly citizenId = computed(() => this.citizen().id);
  private readonly service = inject(CitizenDetailService);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private trigger: HTMLElement | null = null;
  private readonly model = signal({ text: '' });
  protected readonly attempted = signal(false);
  protected readonly failure = signal('');
  protected readonly status = signal('');
  protected readonly observationForm = form(this.model, (schema) => maxLength(schema.text, 5000));

  constructor() {
    effect(() => {
      this.citizenId();
      afterNextRender(
        () => {
          this.trigger = null;
          this.status.set('');
          if (this.dialog().nativeElement.open) this.dialog().nativeElement.close();
        },
        { injector: this.injector },
      );
    });
  }

  protected open(event: MouseEvent): void {
    this.trigger = event.currentTarget as HTMLElement;
    this.observationForm().reset({ text: this.citizen().observations });
    this.attempted.set(false);
    this.failure.set('');
    this.status.set('');
    this.dialog().nativeElement.showModal();
    afterNextRender(() => this.dialog().nativeElement.querySelector('textarea')?.focus(), {
      injector: this.injector,
    });
  }

  protected save(event: SubmitEvent): void {
    event.preventDefault();
    this.attempted.set(true);
    this.failure.set('');
    void submit(this.observationForm, async () => {
      try {
        this.service.saveObservations(this.citizenId(), this.model().text);
        this.status.set('Observação salva.');
        this.dialog().nativeElement.close();
      } catch (error: unknown) {
        this.failure.set(
          error instanceof Error ? error.message : 'Não foi possível salvar a observação.',
        );
      }
    });
  }

  protected onClose(): void {
    const trigger = this.trigger;
    this.trigger = null;
    if (trigger)
      afterNextRender(
        () => {
          if (trigger.isConnected) trigger.focus({ preventScroll: true });
        },
        { injector: this.injector },
      );
  }

  protected onBackdropClick(event: MouseEvent): void {
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
