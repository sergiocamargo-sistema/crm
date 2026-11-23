import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { KanbanService } from '../../services/kanban.service';

@Component({
  imports: [DatePipe, IconComponent],
  selector: 'app-task-history',
  styleUrl: './task-history.component.scss',
  templateUrl: './task-history.component.html',
})
export class TaskHistoryComponent {
  readonly taskId = input.required<string>();
  private readonly board = inject(KanbanService);
  private readonly task = this.board.observeTask(this.taskId).state;
  protected readonly history = computed(() =>
    [...(this.task()?.history ?? [])].sort(
      (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
    ),
  );
}
