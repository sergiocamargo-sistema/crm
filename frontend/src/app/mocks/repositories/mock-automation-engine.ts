import { signal } from '@angular/core';
import { TASK_PRIORITIES, type Task } from '../../core/models/task';
import {
  automationTriggerLabel,
  taskSetGraphError,
  type AutomationCatalog,
  type AutomationEvent,
  type AutomationRule,
  type AutomationRuleDraft,
  type AutomationRun,
  type AutomationTrigger,
  type AutomationWorkspace,
  type TaskSet,
  type TaskSetDraft,
  type TaskTemplate,
  type TaskTemplateDraft,
} from '../../features/automations/models/automation';
import type { RequestAutomationPlan } from '../../features/requests/models/request-detail';
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

const eventKey = (kind: AutomationEvent['kind'], id: string): string => `${kind}:${id}`;

function matchesRequest(trigger: AutomationTrigger, patternId: string | null): boolean {
  return (
    trigger.kind === 'request-created' ||
    (trigger.kind === 'request-with-pattern' && trigger.patternId === patternId)
  );
}

function matchesEvent(trigger: AutomationTrigger, event: AutomationEvent): boolean {
  if (event.kind === 'request-created') return matchesRequest(trigger, event.patternId);
  return (
    trigger.kind === 'interaction-created' ||
    (trigger.kind === 'interaction-with-type' &&
      trigger.interactionType === event.interactionType &&
      (trigger.channel === null || trigger.channel === event.channel))
  );
}

function validateTrigger(trigger: AutomationTrigger, catalog: AutomationCatalog): void {
  switch (trigger.kind) {
    case 'request-created':
    case 'interaction-created':
      return;
    case 'request-with-pattern':
      if (!catalog.patterns.some(({ id }) => id === trigger.patternId))
        throw new Error('Selecione um padrão de solicitação válido.');
      return;
    case 'interaction-with-type':
      if (!catalog.interactionTypes.some(({ value }) => value === trigger.interactionType))
        throw new Error('Selecione um tipo de interação válido.');
      if (
        trigger.channel !== null &&
        (trigger.interactionType !== 'conversation' ||
          !catalog.interactionChannels.some(({ value }) => value === trigger.channel))
      )
        throw new Error('Selecione um canal válido para conversas.');
      return;
    default:
      throw new Error('Selecione um gatilho válido.');
  }
}

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
        .filter(({ name, trigger }) =>
          matches(`${name} ${automationTriggerLabel(trigger, catalog)}`),
        )
        .map(({ id }) => id),
      runResultIds: runs
        .filter(({ ruleName, source }) => matches(`${ruleName} ${source.title}`))
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
    validateTrigger(draft.trigger, catalog);
    const set = this.sets().find((item) => item.id === draft.setId);
    if (!set) throw new Error('Selecione um conjunto de tarefas válido.');
    const error = taskSetGraphError(set.steps);
    if (error) throw new Error(error);
    const rule: AutomationRule = {
      ...draft,
      trigger: structuredClone(draft.trigger),
      name,
      id: id ?? `automation-${crypto.randomUUID()}`,
      version: (existing?.version ?? 0) + 1,
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
    return this.rules().some(
      ({ trigger }) => trigger.kind === 'request-with-pattern' && trigger.patternId === id,
    );
  }
  usesLabel(id: string): boolean {
    return (
      this.templates().some((item) => item.labelIds.includes(id)) ||
      this.runs().some((run) =>
        run.steps.some((step) => !step.taskId && step.template.labelIds.includes(id)),
      )
    );
  }
  private hasRun(ruleId: string, eventId: string): boolean {
    return this.runs().some((run) => run.ruleId === ruleId && run.eventId === eventId);
  }

  requestPlans(patternId: string | null, requestId?: string): readonly RequestAutomationPlan[] {
    const eventId = requestId === undefined ? null : eventKey('request-created', requestId);
    return this.rules().flatMap((rule) => {
      if (!matchesRequest(rule.trigger, patternId)) return [];
      if (eventId && this.hasRun(rule.id, eventId)) return [];
      const set = this.sets().find((item) => item.id === rule.setId);
      if (!set) return [];
      const initialTaskCount = set.steps.filter((step) => !step.dependsOn.length).length;
      return [
        {
          id: rule.id,
          name: rule.name,
          enabled: rule.enabled,
          initialTaskCount,
          dependentTaskCount: set.steps.length - initialTaskCount,
        },
      ];
    });
  }

  start(event: AutomationEvent, actor: string, ruleId?: string): readonly AutomationRun[] {
    const rules = this.rules().filter(
      (rule) =>
        rule.enabled &&
        (ruleId === undefined || rule.id === ruleId) &&
        matchesEvent(rule.trigger, event),
    );
    if (ruleId !== undefined && !rules.length) {
      throw new Error('Esta automação não está ativa para este registro.');
    }

    // A execução escolhida manualmente usa a mesma chave do disparo no cadastro.
    const eventId = eventKey(event.kind, event.id);
    const requestId = event.kind === 'request-created' ? event.id : event.requestId;
    const started = rules.flatMap((rule): AutomationRun[] => {
      if (this.hasRun(rule.id, eventId)) return [];
      const set = this.sets().find((item) => item.id === rule.setId);
      if (!set) return [];
      const steps = set.steps.map((step) => {
        const template = this.templates().find((item) => item.id === step.templateId);
        if (!template) throw new Error('Tarefa modelo não encontrada.');
        return { ...structuredClone(step), template: structuredClone(template), taskId: null };
      });
      return [
        {
          id: `run-${crypto.randomUUID()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          ruleVersion: rule.version,
          setName: set.name,
          setVersion: set.version,
          requestId,
          source: structuredClone(event),
          eventId,
          startedAt: new Date().toISOString(),
          actor,
          steps,
          error: '',
        },
      ];
    });
    if (started.length) this.runs.update((runs) => [...runs, ...started]);
    return started;
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
