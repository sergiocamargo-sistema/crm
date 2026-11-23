import { Component, input } from '@angular/core';
import { PhotoGalleryComponent } from '../../../../shared/components/photo-gallery/photo-gallery.component';
import type { CitizenPhoto } from '../../models/citizen-detail';

@Component({
  imports: [PhotoGalleryComponent],
  selector: 'app-citizen-photo-gallery',
  styleUrl: './citizen-photo-gallery.component.scss',
  templateUrl: './citizen-photo-gallery.component.html',
})
export class CitizenPhotoGalleryComponent {
  readonly photos = input.required<readonly CitizenPhoto[]>();
  readonly citizenName = input.required<string>();
}
