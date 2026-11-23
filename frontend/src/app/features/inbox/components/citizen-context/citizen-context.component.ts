import { Component, input, output } from '@angular/core';
import type { Conversation } from '../../../../core/models/inbox';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-citizen-context',
  imports: [IconComponent],
  templateUrl: './citizen-context.component.html',
  styleUrl: './citizen-context.component.scss',
})
export class CitizenContextComponent {
  readonly conversation = input.required<Conversation>();
  readonly showAddress = input(false);
  readonly showRecordAction = input(true);
  readonly citizenRequested = output<void>();
  readonly requestRequested = output<void>();
}
