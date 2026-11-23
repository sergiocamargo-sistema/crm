import { DatePipe, NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { form, FormField } from '@angular/forms/signals';
import { CitizenActionsComponent } from '../../components/citizen-actions/citizen-actions.component';
import { CitizenFiltersComponent } from '../../components/citizen-filters/citizen-filters.component';
import { CitizenListService } from '../../services/citizen-list.service';

@Component({
  imports: [
    DatePipe,
    NgOptimizedImage,
    RouterLink,
    IconComponent,
    CitizenFiltersComponent,
    CitizenActionsComponent,
    FormField,
  ],
  selector: 'app-citizen-list',
  styleUrl: './citizen-list.component.scss',
  templateUrl: './citizen-list.component.html',
})
export class CitizenListComponent {
  protected readonly list = inject(CitizenListService);
  protected readonly listState = this.list.store;
  protected readonly selectionForm = form(this.listState.selection);
  private readonly router = inject(Router);
  private readonly printDialog = viewChild.required<ElementRef<HTMLDialogElement>>('printDialog');
  private printTrigger: HTMLElement | null = null;
  protected openPrintOptions(trigger: HTMLElement): void {
    this.printTrigger = trigger;
    this.printDialog().nativeElement.showModal();
  }
  protected onPrintOptionsClose(): void {
    if (this.printTrigger?.isConnected) this.printTrigger.focus({ preventScroll: true });
    this.printTrigger = null;
  }
  protected printLabels(scope: 'selected' | 'results'): void {
    const ids = this.list.labelRecipientIds(scope);
    if (!ids.length) return;
    this.printDialog().nativeElement.close();
    void this.router.navigate(['/etiquetas'], {
      queryParams: { municipes: ids.join(',') },
    });
  }
  protected readonly failedPhotos = signal<ReadonlySet<string>>(new Set());
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');
  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }
  protected reset(): void {
    this.list.reset();
  }
  protected clearSelection(trigger: HTMLButtonElement): void {
    this.list.clearSelection();
    const target = this.listState.resultIds().length ? trigger : this.heading().nativeElement;
    target.focus({ preventScroll: true });
  }
  protected imageFailed(id: string): void {
    this.failedPhotos.update((ids) => new Set([...ids, id]));
  }
}
