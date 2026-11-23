import { Component, input } from '@angular/core';
import { SpeechToTextDirective } from '../../directives/speech-to-text.directive';
import { IconComponent } from '../icon/icon.component';

@Component({
  imports: [IconComponent],
  selector: 'app-dictation-button',
  styleUrl: './dictation-button.component.scss',
  templateUrl: './dictation-button.component.html',
})
export class DictationButtonComponent {
  readonly target = input.required<SpeechToTextDirective>();
  readonly controlId = input.required<string>();
}
