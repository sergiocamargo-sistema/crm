import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { CABINET_RATING_LABEL } from '../../../../core/models/cabinet-rating';
import { IconComponent, type IconName } from '../../../../shared/components/icon/icon.component';
import { FilterSelectionComponent } from '../../../../shared/components/filter-selection/filter-selection.component';
import { birthdayFiltersAreCompatible } from '../../models/citizen-birth-filters';
import type { CitizenListFacet } from '../../models/citizen-list';
import { CitizenListService } from '../../services/citizen-list.service';

const PROFILE_FILTERS = [
  {
    key: 'neighborhoods',
    label: 'Bairro',
    hint: 'Mostra munícipes de qualquer bairro escolhido.',
    placeholder: 'Buscar bairro...',
    itemLabel: 'bairro',
    icon: 'location',
  },
  {
    key: 'cabinetRatings',
    label: CABINET_RATING_LABEL,
    hint: 'Inclui qualquer nota escolhida, inclusive Sem avaliação.',
    placeholder: 'Buscar avaliação...',
    itemLabel: 'avaliação',
    icon: 'star',
  },
  {
    key: 'ageRanges',
    label: 'Faixa etária',
    hint: 'Mostra munícipes em qualquer faixa escolhida.',
    placeholder: 'Buscar faixa etária...',
    itemLabel: 'faixa etária',
    icon: 'user',
  },
  {
    key: 'birthdayDays',
    label: 'Dia do aniversário',
    hint: 'Filtra por qualquer dia escolhido.',
    placeholder: 'Buscar dia...',
    itemLabel: 'dia',
    icon: 'calendar',
  },
  {
    key: 'birthdayMonths',
    label: 'Mês do aniversário',
    hint: 'Filtra por qualquer mês escolhido.',
    placeholder: 'Buscar mês...',
    itemLabel: 'mês',
    icon: 'calendar',
  },
] satisfies readonly {
  key: CitizenListFacet;
  label: string;
  hint: string;
  placeholder: string;
  itemLabel: string;
  icon: IconName;
}[];

@Component({
  imports: [FormField, IconComponent, FilterSelectionComponent],
  selector: 'app-citizen-filters',
  styleUrl: './citizen-filters.component.scss',
  templateUrl: './citizen-filters.component.html',
})
export class CitizenFiltersComponent {
  protected readonly list = inject(CitizenListService);
  protected readonly filtersForm = form(this.list.model);
  protected readonly profileFilters = PROFILE_FILTERS;
  protected readonly hasInvalidBirthdayFilters = computed(() => {
    const { birthdayDays, birthdayMonths } = this.list.model();
    return !birthdayFiltersAreCompatible(birthdayDays, birthdayMonths);
  });
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
