import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required, submit, validate } from '@angular/forms/signals';
import { KanbanService } from '../../services/kanban.service';
import { MentionEditorComponent } from '../../../../shared/components/mention-editor/mention-editor.component';
import { RichTextComponent } from '../../../../shared/components/rich-text/rich-text.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { RequestComment } from '../../../requests/models/request-detail';
@Component({
  selector: 'app-task-comments',
  imports: [DatePipe, FormField, MentionEditorComponent, RichTextComponent, IconComponent],
  templateUrl: './task-comments.component.html',
  styleUrl: './task-comments.component.scss',
})
export class TaskCommentsComponent {
  readonly taskId = input.required<string>();
  private readonly board = inject(KanbanService);
  private readonly task = this.board.observeTask(this.taskId).state;
  private readonly document = inject(DOCUMENT);
  private readonly composer = viewChild(MentionEditorComponent);
  private readonly model = signal({ text: '' });
  protected readonly parentId = signal<string | null>(null);
  protected readonly attempted = signal(false);
  protected readonly failure = signal('');
  protected readonly comments = computed(() => this.task()?.comments ?? []);
  protected readonly parent = computed(() =>
    this.comments().find((item) => item.id === this.parentId()),
  );
  protected readonly commentForm = form(this.model, (schema) => {
    required(schema.text);
    maxLength(schema.text, 5000);
    validate(schema.text, ({ value }) =>
      !value().trim() ? { kind: 'required', message: 'Escreva o comentário.' } : undefined,
    );
  });
  protected readonly rows = computed(() => {
    const children = new Map<string | null, RequestComment[]>();
    for (const comment of this.comments()) {
      const group = children.get(comment.parentId) ?? [];
      group.push(comment);
      children.set(comment.parentId, group);
    }
    const rows: { comment: RequestComment; depth: number; parent: RequestComment | undefined }[] =
      [];
    const stack = [...(children.get(null) ?? [])]
      .reverse()
      .map((comment) => ({ comment, depth: 0 }));
    const seen = new Set<string>();
    const byId = new Map(this.comments().map((comment) => [comment.id, comment]));
    while (stack.length) {
      const row = stack.pop()!;
      if (seen.has(row.comment.id)) continue;
      seen.add(row.comment.id);
      rows.push({
        ...row,
        depth: Math.min(row.depth, 3),
        parent: row.comment.parentId ? byId.get(row.comment.parentId) : undefined,
      });
      for (const comment of [...(children.get(row.comment.id) ?? [])].reverse())
        stack.push({ comment, depth: row.depth + 1 });
    }
    return rows;
  });
  constructor() {
    effect(() => {
      this.taskId();
      untracked(() => {
        this.composer()?.stop();
        this.model.set({ text: '' });
        this.parentId.set(null);
        this.attempted.set(false);
        this.failure.set('');
      });
    });
  }
  protected reply(comment: RequestComment): void {
    this.composer()?.stop();
    this.parentId.set(comment.id);
    this.composer()?.focus();
  }
  protected cancelReply(): void {
    this.parentId.set(null);
    this.composer()?.focus();
  }
  protected publish(event: SubmitEvent): void {
    event.preventDefault();
    this.composer()?.stop();
    this.attempted.set(true);
    this.failure.set('');
    void submit(this.commentForm, async () => {
      try {
        await this.board.addComment(this.taskId(), this.model().text, this.parentId());
        this.model.set({ text: '' });
        this.parentId.set(null);
        this.attempted.set(false);
        this.composer()?.focus();
      } catch (error: unknown) {
        this.failure.set(error instanceof Error ? error.message : 'Não foi possível comentar.');
      }
    });
  }
  focusComment(id: string): void {
    const element = this.document.getElementById(`task-comment-${this.taskId()}-${id}`);
    if (element) {
      element.focus({ preventScroll: true });
      element.scrollIntoView({ block: 'center' });
    }
  }
  stop(): void {
    this.composer()?.stop();
  }
  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
  }
}
