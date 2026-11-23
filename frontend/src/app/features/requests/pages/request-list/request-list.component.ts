import { DatePipe } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RequestListService } from '../../services/request-list.service';

@Component({
  imports: [DatePipe, FormField, IconComponent, RouterLink],
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss',
})
export class RequestListComponent {
  private readonly service = inject(RequestListService);
  protected readonly state = this.service.store;
  protected readonly filters = form(this.state.query);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly filterButton = viewChild.required<ElementRef<HTMLButtonElement>>('filterButton');

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }

  protected restoreFilterFocus(): void {
    this.filterButton().nativeElement.focus({ preventScroll: true });
  }

  protected resetFilters(): void {
    this.service.reset();
  }
}
