import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TextReferencesService } from '../../services/text-references.service';
import type { RichTextPart } from '../../../core/models/collaboration';

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrl: './rich-text.component.scss',
})
export class RichTextComponent {
  readonly text = input.required<string>();
  private readonly references = inject(TextReferencesService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  protected readonly parts = computed(() => this.references.parts(this.text()));
  protected linkHref(part: RichTextPart): string {
    if (part.kind !== 'link') return '';
    return part.internal ? this.location.prepareExternalUrl(part.href) : part.href;
  }
  protected navigate(event: MouseEvent, part: RichTextPart): void {
    if (
      part.kind !== 'link' ||
      !part.internal ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    void this.router.navigateByUrl(part.href);
  }
}
