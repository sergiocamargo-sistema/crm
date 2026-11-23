import { Component, input } from '@angular/core';
import type { InboxCounts } from '../../../../core/models/inbox';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-inbox-summary',
  imports: [IconComponent],
  templateUrl: './inbox-summary.component.html',
  styleUrl: './inbox-summary.component.scss',
})
export class InboxSummaryComponent {
  readonly counts = input.required<InboxCounts>();
}
