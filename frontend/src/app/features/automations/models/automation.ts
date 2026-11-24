import type { Task, TaskPriority } from '../../../core/models/task';
import type { TaskLabel } from '../../../core/models/task-label';
import type { TeamUser } from '../../../core/models/collaboration';

export interface TaskTemplateDraft {
  readonly title: string;
  readonly description: string;
  readonly assigneeIds: readonly string[];
  readonly labelIds: readonly string[];
  readonly priority: TaskPriority;
  readonly dueInDays: number | null;
}
export interface TaskTemplate extends TaskTemplateDraft {
  readonly id: string;
  readonly version: number;
}
export interface TaskSetStep {
  readonly id: string;
  readonly templateId: string;
  readonly dependsOn: readonly string[];
}
export interface TaskSetDraft {
  readonly name: string;
  readonly steps: readonly TaskSetStep[];
}
export interface TaskSet extends TaskSetDraft {
  readonly id: string;
  readonly version: number;
}
export interface AutomationRuleDraft {
  readonly name: string;
  readonly patternId: string;
  readonly setId: string;
  readonly enabled: boolean;
}
export interface AutomationRule extends AutomationRuleDraft {
  readonly id: string;
  readonly version: number;
  readonly trigger: 'request-created';
}
export interface AutomationRunStep {
  readonly id: string;
  readonly dependsOn: readonly string[];
  readonly template: TaskTemplate;
  readonly taskId: string | null;
}
export interface AutomationRun {
  readonly id: string;
  readonly ruleId: string;
  readonly ruleName: string;
  readonly ruleVersion: number;
  readonly setName: string;
  readonly setVersion: number;
  readonly requestId: string;
  readonly requestTitle: string;
  readonly eventId: string;
  readonly startedAt: string;
  readonly actor: string;
  readonly steps: readonly AutomationRunStep[];
  readonly error: string;
}
export interface AutomationCatalog {
  readonly patterns: readonly { readonly id: string; readonly name: string }[];
  readonly users: readonly TeamUser[];
  readonly labels: readonly TaskLabel[];
  readonly defaultAssigneeIds: readonly string[];
}
export interface AutomationWorkspace {
  readonly templates: readonly TaskTemplate[];
  readonly sets: readonly TaskSet[];
  readonly rules: readonly AutomationRule[];
  readonly runs: readonly AutomationRun[];
  readonly tasks: readonly Task[];
  readonly catalog: AutomationCatalog;
  readonly templateResultIds: readonly string[];
  readonly setResultIds: readonly string[];
  readonly ruleResultIds: readonly string[];
  readonly runResultIds: readonly string[];
}
export interface FlowStep {
  readonly id: string;
  readonly title: string;
  readonly dependsOn: readonly string[];
  readonly assigneeNames: readonly string[];
  readonly dueInDays: number | null;
}

export function taskSetGraphError(steps: readonly TaskSetStep[]): string {
  if (!steps.length || steps.length > 50) return 'Adicione de 1 a 50 tarefas ao conjunto.';
  const byId = new Map(steps.map((step) => [step.id, step]));
  if (byId.size !== steps.length || steps.some((step) => !step.id))
    return 'Cada etapa precisa de uma identificação única.';
  if (new Set(steps.map((step) => step.templateId)).size !== steps.length)
    return 'Use cada tarefa modelo apenas uma vez no conjunto.';
  const complete = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string): boolean => {
    if (complete.has(id)) return true;
    if (visiting.has(id)) return false;
    const step = byId.get(id);
    if (!step || new Set(step.dependsOn).size !== step.dependsOn.length) return false;
    visiting.add(id);
    if (!step.dependsOn.every(visit)) return false;
    visiting.delete(id);
    complete.add(id);
    return true;
  };
  return steps.every((step) => visit(step.id))
    ? ''
    : 'Revise as dependências: uma tarefa não pode depender de si mesma, de uma etapa removida ou formar um ciclo.';
}

export function flowSteps(
  set: TaskSetDraft | null,
  templates: readonly TaskTemplate[],
  users: readonly TeamUser[],
): readonly FlowStep[] {
  if (!set) return [];
  return set.steps.map((step) => {
    const template = templates.find(({ id }) => id === step.templateId);
    return {
      id: step.id,
      title: template?.title ?? 'Tarefa modelo indisponível',
      dependsOn: step.dependsOn,
      assigneeNames:
        template?.assigneeIds.map(
          (id) => users.find((user) => user.id === id)?.name ?? 'Responsável indisponível',
        ) ?? [],
      dueInDays: template?.dueInDays ?? null,
    };
  });
}
