import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { TeamCollaborationService } from '../../../core/services/team-collaboration.service';
import type { TeamUser } from '../../../core/models/collaboration';
import { SpeechToTextDirective } from '../../directives/speech-to-text.directive';
import { DictationButtonComponent } from '../dictation-button/dictation-button.component';
import { RichTextComponent } from '../rich-text/rich-text.component';
import { TextReferencesService } from '../../services/text-references.service';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
@Component({
  selector: 'app-mention-editor',
  imports: [SpeechToTextDirective, DictationButtonComponent, RichTextComponent],
  templateUrl: './mention-editor.component.html',
  styleUrl: './mention-editor.component.scss',
})
export class MentionEditorComponent implements FormValueControl<string> {
  readonly value = model('');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly required = input(false);
  readonly maxLength = input<number>();
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly rows = input(4);
  readonly placeholder = input('Escreva, use @ para mencionar ou cole o link de um registro...');
  readonly touch = output<void>();
  private readonly team = inject(TeamCollaborationService);
  private readonly references = inject(TextReferencesService);
  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  private readonly dictation = viewChild(SpeechToTextDirective);
  private readonly mention = signal<{ query: string; start: number; end: number } | null>(null);
  protected readonly activeIndex = signal(0);
  protected readonly suggestions = computed(() => {
    const mention = this.mention();
    return mention
      ? this.team.users
          .filter((user) =>
            normalize(`${user.name} ${user.handle}`).includes(normalize(mention.query)),
          )
          .slice(0, 6)
      : [];
  });
  protected readonly previewLinks = computed(() =>
    this.references
      .parts(this.value())
      .flatMap((part) => (part.kind === 'link' && part.internal ? [part] : [])),
  );
  focus(options?: FocusOptions): void {
    this.textarea().nativeElement.focus(options);
  }
  stop(): void {
    this.dictation()?.stop();
    this.mention.set(null);
  }
  protected changed(): void {
    this.value.set(this.textarea().nativeElement.value);
    this.updateSuggestions();
  }
  protected updateSuggestions(): void {
    const textarea = this.textarea().nativeElement;
    if (textarea.selectionStart !== textarea.selectionEnd) {
      this.mention.set(null);
      return;
    }
    const before = textarea.value.slice(0, textarea.selectionStart);
    const match = before.match(/(?:^|[\s([{])@([\p{L}\p{N}._-]*)$/u);
    this.mention.set(
      match
        ? { query: match[1], start: before.length - match[1].length - 1, end: before.length }
        : null,
    );
    this.activeIndex.set(0);
  }
  protected cursorMoved(event: KeyboardEvent): void {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) this.updateSuggestions();
  }
  protected choose(user: TeamUser): void {
    const mention = this.mention();
    if (!mention || this.disabled()) return;
    this.dictation()?.stop();
    const textarea = this.textarea().nativeElement;
    textarea.setRangeText(`@${user.handle} `, mention.start, mention.end, 'end');
    this.value.set(textarea.value);
    this.mention.set(null);
    textarea.focus();
  }
  protected keydown(event: KeyboardEvent): void {
    const suggestions = this.suggestions();
    if (!suggestions.length || event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update(
        (index) =>
          (index + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length,
      );
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.choose(suggestions[this.activeIndex()] ?? suggestions[0]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.mention.set(null);
    } else if (event.key === 'Tab') this.mention.set(null);
  }
  protected blurred(): void {
    this.touch.emit();
    this.mention.set(null);
  }
}
