import { NgOptimizedImage } from '@angular/common';
import { Component, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CitizenDetail } from '../../../citizens/models/citizen-detail';

@Component({
  imports: [NgOptimizedImage, RouterLink],
  selector: 'app-citizen-brief',
  styleUrl: './citizen-brief.component.scss',
  templateUrl: './citizen-brief.component.html',
})
export class CitizenBriefComponent {
  readonly citizen = input.required<CitizenDetail>();
  protected readonly expanded = linkedSignal({
    source: () => this.citizen().id,
    computation: () => false,
  });
}
