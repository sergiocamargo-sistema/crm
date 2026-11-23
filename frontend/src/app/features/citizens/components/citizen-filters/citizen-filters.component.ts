import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { form, FormField, validate } from '@angular/forms/signals';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FilterSelectionComponent } from '../../../../shared/components/filter-selection/filter-selection.component';
import { AGE_RANGES, BIRTHDAY_MONTHS } from '../../models/citizen-list';
import { birthdayCombinationIsValid } from '../../models/citizen-birth-filters';
import { CitizenListService } from '../../services/citizen-list.service';

@Component({
  imports: [FormField, IconComponent, FilterSelectionComponent],
  selector: 'app-citizen-filters',
  styleUrl: './citizen-filters.component.scss',
  templateUrl: './citizen-filters.component.html',
})
export class CitizenFiltersComponent {
  protected readonly list = inject(CitizenListService);
  protected readonly filtersForm = form(this.list.model, (schema) => {
    validate(schema.birthdayDay, ({ value, valueOf }) =>
      birthdayCombinationIsValid(value(), valueOf(schema.birthdayMonth))
        ? undefined
        : { kind: 'birthday', message: 'O mês selecionado não possui esse dia.' },
    );
  });
  protected readonly ageRanges = AGE_RANGES;
  protected readonly birthdayMonths = BIRTHDAY_MONTHS;
  protected readonly birthdayDays = Array.from({ length: 31 }, (_, index) => String(index + 1));
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('sidebar');
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private trigger: HTMLElement | null = null;
  open(trigger: HTMLElement): void {
    this.trigger = trigger;
    this.dialog().nativeElement.showModal();
    this.searchInput().nativeElement.focus();
    this.searchInput().nativeElement.select();
  }
  protected clearSearch(): void {
    this.list.clearSearch();
    this.searchInput().nativeElement.focus();
  }
  protected onClose(): void {
    if (this.trigger?.isConnected) this.trigger.focus({ preventScroll: true });
    this.trigger = null;
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
