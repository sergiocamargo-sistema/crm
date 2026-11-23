import { computed, signal, type Signal } from '@angular/core';
import { TASK_STATUSES } from '../../../core/models/task';
import type { TeamUser } from '../../../core/models/collaboration';
import { departmentOptions, departmentScopeIds } from '../../requests/models/department-options';
import type { Department } from '../../requests/models/request-detail';
import { orderKanbanTasks } from '../models/kanban-order';
import type {
  KanbanWorkspace,
  KanbanDisplayColumn,
  KanbanQuery,
  KanbanTask,
  KanbanView,
} from '../models/kanban';

export const initialQuery = (): KanbanQuery => ({
  search: '',
  assigneeId: '',
  departmentId: '',
  priority: '',
  overdueOnly: false,
});
const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

export class KanbanStore {
  readonly now = signal(Date.now());
  readonly query = signal<KanbanQuery>(initialQuery());
  readonly viewSettings = signal<{ mode: KanbanView }>({ mode: 'status' });
  constructor(
    readonly workspace: Signal<KanbanWorkspace>,
    readonly departments: Signal<readonly Department[]>,
    readonly assignees: readonly TeamUser[],
  ) {}

  readonly activeFilterCount = computed(() => {
    const query = this.query();
    return [
      query.search.trim(),
      query.assigneeId,
      query.departmentId,
      query.priority,
      query.overdueOnly,
    ].filter(Boolean).length;
  });
  readonly departmentChoices = computed(() => departmentOptions(this.departments()));
  readonly results = computed(() => {
    const query = this.query();
    const terms = normalize(query.search.trim()).split(/\s+/).filter(Boolean);
    const workspace = this.workspace();
    const departments = query.departmentId
      ? departmentScopeIds(this.departments(), [query.departmentId])
      : null;
    return orderKanbanTasks(workspace.tasks, workspace.order[this.viewSettings().mode]).filter(
      (task) => {
        const text = normalize(
          [
            task.title,
            task.description,
            ...this.assignees
              .filter((user) => task.assigneeIds.includes(user.id))
              .map((user) => user.name),
            task.request?.title ?? '',
            task.request?.protocol ?? '',
            task.request?.citizen?.name ?? '',
            task.request?.department ?? '',
          ].join(' '),
        );
        return (
          terms.every((term) => text.includes(term)) &&
          (!query.assigneeId || task.assigneeIds.includes(query.assigneeId)) &&
          (!departments || departments.has(task.request?.departmentId ?? '')) &&
          (!query.priority || task.priority === query.priority) &&
          (!query.overdueOnly || this.isOverdue(task))
        );
      },
    );
  });
  readonly columns = computed<readonly KanbanDisplayColumn[]>(() => {
    const tasks = this.results();
    if (this.viewSettings().mode === 'status') {
      return TASK_STATUSES.map((column): KanbanDisplayColumn => ({
        id: `status-${column.value}`,
        label: column.label,
        status: column.value,
        target: { kind: 'status', status: column.value },
        tasks: tasks.filter((task) => task.status === column.value),
      }));
    }
    return [
      ...this.workspace().customColumns.map((column): KanbanDisplayColumn => ({
        id: column.id,
        label: column.name,
        status: null,
        target: { kind: 'custom', columnId: column.id },
        tasks: tasks.filter((task) => task.customColumnId === column.id),
      })),
      {
        id: 'unassigned',
        label: 'Sem coluna',
        status: null,
        target: { kind: 'custom', columnId: null },
        tasks: tasks.filter((task) => task.customColumnId === null),
      },
    ];
  });
  readonly overdueCount = computed(
    () => this.results().filter((task) => this.isOverdue(task)).length,
  );
  readonly firstCoverTaskId = computed(
    () =>
      this.columns()
        .flatMap((column) => column.tasks)
        .find((task) => task.cover)?.id ?? null,
  );

  isOverdue(task: KanbanTask): boolean {
    return task.status !== 'completed' && !!task.dueAt && Date.parse(task.dueAt) < this.now();
  }
}
