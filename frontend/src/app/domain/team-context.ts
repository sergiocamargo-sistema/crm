import type { TeamUser } from '../core/models/collaboration';

export interface TeamContext {
  readonly actor: TeamUser;
  readonly users: readonly TeamUser[];
  validateAssignees(ids: readonly string[]): readonly string[];
  notifyMentions(
    previousText: string,
    text: string,
    context: {
      readonly taskId: string;
      readonly taskTitle: string;
      readonly commentId?: string;
    },
  ): void;
}
