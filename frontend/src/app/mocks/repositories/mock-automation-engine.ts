import { signal } from '@angular/core';
import { TASK_PRIORITIES, type Task } from '../../core/models/task';
import {
  taskSetGraphError,
  type AutomationCatalog,
  type AutomationRule,
  type AutomationRuleDraft,
  type AutomationRun,
  type AutomationWorkspace,
  type TaskSet,
  type TaskSetDraft,
  type TaskTemplate,
  type TaskTemplateDraft,
} from '../../features/automations/models/automation';
import {
  MOCK_AUTOMATION_RULES,
  MOCK_TASK_SETS,
  MOCK_TASK_TEMPLATES,
} from '../data/automations.mock';

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/gu, ' ');

/** Dados e regras do backend simulado; não cria uma segunda coleção de tarefas. */
export class MockAutomationEngine {
  private readonly templates = signal<readonly TaskTemplate[]>(
    structuredClone(MOCK_TASK_TEMPLATES),
  );
  private readonly sets = signal<readonly TaskSet[]>(structuredClone(MOCK_TASK_SETS));
  private readonly rules = signal<readonly AutomationRule[]>(
    structuredClone(MOCK_AUTOMATION_RULES),
  );
  private readonly runs = signal<readonly AutomationRun[]>([]);

  workspace(
    query: string,
    catalog: AutomationCatalog,
    tasks: readonly Task[],
  ): AutomationWorkspace {
    const terms = normalize(query).split(' ').filter(Boolean);
    const matches = (text: string): boolean =>
      terms.every((term) => normalize(text).includes(term));
    const templates = [...this.templates()].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    const sets = [...this.sets()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const rules = [...this.rules()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const runs = [...this.runs()].reverse();
    const runTaskIds = new Set(
      runs.flatMap((run) => run.steps.flatMap((step) => (step.taskId ? [step.taskId] : []))),
    );
    return {
      templates,
      sets,
      rules,
      runs,
      tasks: tasks.filter((task) => runTaskIds.has(task.id)),
      catalog,
      templateResultIds: templates
        .filter((item) => matches(item.title + ' ' + item.description))
        .map(({ id }) => id),
      setResultIds: sets.filter((item) => matches(item.name)).map(({ id }) => id),
      ruleResultIds: rules
        .filter((item) =>
          matches(item.name + ' ' + catalog.patterns.find(({ id }) => id === item.patternId)?.name),
        )
        .map(({ id }) => id),
      runResultIds: runs
        .filter((item) => matches(item.ruleName + ' ' + item.requestTitle))
        .map(({ id }) => id),
    };
  }

  private checkVersion<T extends { id: string; version: number }>(
    items: readonly T[],
    id: string | null,
    version: number | null,
  ): T | undefined {
    const existing = items.find((item) => item.id === id);
    if (id && (!existing || existing.version !== version))
      throw new Error(
        'Este registro mudou. Feche o editor e abra novamente para revisar a versão atual.',
      );
    return existing;
  }
  private name(
    value: string,
    names: readonly { id: string; name: string }[],
    id: string | null,
  ): string {
    const name = value.trim().replace(/\s+/gu, ' ');
    if (!name || name.length > 120) throw new Error('Informe um nome com até 120 caracteres.');
    if (names.some((item) => item.id !== id && normalize(item.name) === normalize(name)))
      throw new Error('Já existe um registro com esse nome.');
    return name;
  }
  saveTemplate(
    id: string | null,
    version: number | null,
    draft: TaskTemplateDraft,
    catalog: AutomationCatalog,
  ): TaskTemplate {
    const existing = this.checkVersion(this.templates(), id, version);
    const title = this.name(
      draft.title,
      this.templates().map((item) => ({ id: item.id, name: item.title })),
      id,
    );
    if (draft.description.length > 1500) throw new Error('Use até 1.500 caracteres na descrição.');
    if (
      !draft.assigneeIds.length ||
      new Set(draft.assigneeIds).size !== draft.assigneeIds.length ||
      draft.assigneeIds.some((id) => !catalog.users.some((item) => item.id === id))
    )
      throw new Error('Selecione ao menos um responsável válido, sem repetições.');
    if (
      new Set(draft.labelIds).size !== draft.labelIds.length ||
      draft.labelIds.some((id) => !catalog.labels.some((item) => item.id === id))
    )
      throw new Error('Revise as etiquetas selecionadas.');
    if (!TASK_PRIORITIES.some((item) => item.value === draft.priority))
      throw new Error('Prioridade inválida.');
    if (
      draft.dueInDays !== null &&
      (!Number.isInteger(draft.dueInDays) || draft.dueInDays < 0 || draft.dueInDays > 3650)
    )
      throw new Error('O prazo deve ser um número inteiro entre 0 e 3.650 dias.');
    const template: TaskTemplate = structuredClone({
      ...draft,
      title,
      description: draft.description.trim(),
      id: id ?? `template-${crypto.randomUUID()}`,
      version: (existing?.version ?? 0) + 1,
    });
    this.templates.update((items) =>
      existing ? items.map((item) => (item.id === id ? template : item)) : [...items, template],
    );
    return template;
  }
  deleteTemplate(id: string, version: number): void {
    this.checkVersion(this.templates(), id, version);
    if (this.sets().some((set) => set.steps.some((step) => step.templateId === id)))
      throw new Error('Esta tarefa modelo está em um conjunto. Remova o vínculo antes de excluir.');
    this.templates.update((items) => items.filter((item) => item.id !== id));
  }
  saveSet(id: string | null, version: number | null, draft: TaskSetDraft): TaskSet {
    const existing = this.checkVersion(this.sets(), id, version);
    const name = this.name(draft.name, this.sets(), id);
    const error = taskSetGraphError(draft.steps);
    if (error) throw new Error(error);
    if (draft.steps.some((step) => !this.templates().some((item) => item.id === step.templateId)))
      throw new Error('Uma tarefa modelo não existe mais. Revise o conjunto.');
    const set: TaskSet = structuredClone({
      ...draft,
      name,
      id: id ?? `set-${crypto.randomUUID()}`,
      version: (existing?.version ?? 0) + 1,
    });
    this.sets.update((items) =>
      existing ? items.map((item) => (item.id === id ? set : item)) : [...items, set],
    );
    return set;
  }
  deleteSet(id: string, version: number): void {
    this.checkVersion(this.sets(), id, version);
    if (this.rules().some((rule) => rule.setId === id))
      throw new Error('Este conjunto está em uma automação. Remova o vínculo antes de excluir.');
    this.sets.update((items) => items.filter((item) => item.id !== id));
  }
  saveRule(
    id: string | null,
    version: number | null,
    draft: AutomationRuleDraft,
    catalog: AutomationCatalog,
  ): AutomationRule {
    const existing = this.checkVersion(this.rules(), id, version);
    const name = this.name(draft.name, this.rules(), id);
    if (!catalog.patterns.some((item) => item.id === draft.patternId))
      throw new Error('Selecione um padrão de solicitação válido.');
    const set = this.sets().find((item) => item.id === draft.setId);
    if (!set) throw new Error('Selecione um conjunto de tarefas válido.');
    const error = taskSetGraphError(set.steps);
    if (error) throw new Error(error);
    const rule: AutomationRule = {
      ...draft,
      name,
      id: id ?? `automation-${crypto.randomUUID()}`,
      version: (existing?.version ?? 0) + 1,
      trigger: 'request-created',
    };
    this.rules.update((items) =>
      existing ? items.map((item) => (item.id === id ? rule : item)) : [...items, rule],
    );
    return rule;
  }
  deleteRule(id: string, version: number): void {
    const rule = this.checkVersion(this.rules(), id, version);
    if (rule?.enabled)
      throw new Error(
        'Desative a automação antes de excluir. As execuções iniciadas continuarão disponíveis.',
      );
    this.rules.update((items) => items.filter((item) => item.id !== id));
  }
  usesPattern(id: string): boolean {
    return this.rules().some((rule) => rule.patternId === id);
  }
  usesLabel(id: string): boolean {
    return (
      this.templates().some((item) => item.labelIds.includes(id)) ||
      this.runs().some((run) =>
        run.steps.some((step) => !step.taskId && step.template.labelIds.includes(id)),
      )
    );
  }
  start(requestId: string, requestTitle: string, patternId: string | null, actor: string): void {
    for (const rule of this.rules().filter(
      (rule) => rule.enabled && rule.patternId === patternId,
    )) {
      const eventId = `request-created:${requestId}`;
      if (this.runs().some((run) => run.ruleId === rule.id && run.eventId === eventId)) continue;
      const set = this.sets().find((item) => item.id === rule.setId);
      if (!set) continue;
      const steps = set.steps.map((step) => {
        const template = this.templates().find((item) => item.id === step.templateId);
        if (!template) throw new Error('Tarefa modelo não encontrada.');
        return { ...structuredClone(step), template: structuredClone(template), taskId: null };
      });
      this.runs.update((runs) => [
        ...runs,
        {
          id: `run-${crypto.randomUUID()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          ruleVersion: rule.version,
          setName: set.name,
          setVersion: set.version,
          requestId,
          requestTitle,
          eventId,
          startedAt: new Date().toISOString(),
          actor,
          steps,
          error: '',
        },
      ]);
    }
  }
  requestRuns(requestId: string): readonly AutomationRun[] {
    return this.runs().filter((run) => run.requestId === requestId);
  }
  run(id: string): AutomationRun {
    const run = this.runs().find((item) => item.id === id);
    if (!run) throw new Error('Execução não encontrada.');
    return run;
  }
  ready(run: AutomationRun, tasks: readonly Task[]) {
    const completed = new Set(
      tasks.filter((task) => task.status === 'completed').map((task) => task.id),
    );
    return run.steps.filter(
      (step) =>
        !step.taskId &&
        step.dependsOn.every((id) => {
          const predecessor = run.steps.find((item) => item.id === id);
          return !!predecessor?.taskId && completed.has(predecessor.taskId);
        }),
    );
  }
  record(id: string, created: ReadonlyMap<string, string>, error = ''): void {
    this.runs.update((runs) =>
      runs.map((run) =>
        run.id === id
          ? {
              ...run,
              error,
              steps: run.steps.map((step) => ({
                ...step,
                taskId: created.get(step.id) ?? step.taskId,
              })),
            }
          : run,
      ),
    );
  }
}
