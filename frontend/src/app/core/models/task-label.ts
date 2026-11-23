export interface TaskLabel {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export type TaskLabelDraft = Omit<TaskLabel, 'id'>;

export interface TaskLabelListItem extends TaskLabel {
  readonly taskCount: number;
}

export interface TaskLabelManagementResult {
  readonly items: readonly TaskLabelListItem[];
  readonly total: number;
  readonly defaultColor: string;
}
