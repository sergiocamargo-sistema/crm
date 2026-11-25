import { Component, computed, input } from '@angular/core';

import { ICON_PATHS, type IconName } from '../../../core/models/icon-paths';
export type { IconName } from '../../../core/models/icon-paths';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  host: { 'aria-hidden': 'true' },
})
export class IconComponent {
  readonly name = input.required<IconName>();
  protected readonly path = computed(() => ICON_PATHS[this.name()]);
}
