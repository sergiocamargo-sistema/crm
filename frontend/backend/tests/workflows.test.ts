import test from 'node:test';
import assert from 'node:assert/strict';
import { actor, harness, result } from './fixtures';
import type { RequestWorkspace } from '../../src/app/features/requests/models/request-detail';
import type { KanbanWorkspace } from '../../src/app/features/kanban/models/kanban';
import type {
  TaskSet,
  TaskTemplate,
  AutomationRule,
} from '../../src/app/features/automations/models/automation';

test('solicitação sem munícipe persiste com filhos vazios, tarefa e histórico na mesma fonte', async () => {
  const api = await harness();
  const requestId = result<string>(
    await api.action('saveRequest', [
      null,
      {
        citizenId: null,
        title: 'Solicitação de teste',
        description: 'Descrição',
        departmentId: '',
        patternId: null,
        dueAt: '',
        priority: 'Normal',
        status: 'pending',
      },
    ]),
  );
  const other = await harness(api.database);
  const workspace = result<RequestWorkspace>(
    await other.action('loadRequestWorkspace', [requestId]),
  );
  assert.equal(workspace.citizen, null);
  assert.deepEqual(workspace.extras.tasks, []);
  const taskId = result<string>(
    await other.action('addRequestTask', [
      requestId,
      {
        title: 'Tarefa',
        description: '',
        assigneeIds: [actor.id],
        labelIds: [],
        dueAt: '',
        status: 'todo',
        priority: 'normal',
      },
    ]),
  );
  result(await api.action('setRequestTaskCompleted', [requestId, taskId, true]));
  const board = result<KanbanWorkspace>(await other.action('loadKanbanWorkspace'));
  assert.equal(board.tasks.find(({ id }) => id === taskId)?.status, 'completed');
  assert.ok(board.history.some((event) => event.taskId === taskId));
});

test('automações iniciam só a primeira etapa, não duplicam por repetição e liberam dependência ao concluir', async () => {
  const api = await harness();
  const template = result<TaskTemplate>(
    await api.action('saveAutomationTemplate', [
      null,
      null,
      {
        title: 'Etapa de teste',
        description: '',
        assigneeIds: [actor.id],
        labelIds: [],
        priority: 'normal',
        dueInDays: null,
      },
    ]),
  );
  const secondTemplate = result<TaskTemplate>(
    await api.action('saveAutomationTemplate', [
      null,
      null,
      {
        title: 'Segunda etapa',
        description: '',
        assigneeIds: [actor.id],
        labelIds: [],
        priority: 'normal',
        dueInDays: null,
      },
    ]),
  );
  const set = result<TaskSet>(
    await api.action('saveAutomationSet', [
      null,
      null,
      {
        name: 'Conjunto de teste',
        steps: [
          { id: 'first', templateId: template.id, dependsOn: [] },
          { id: 'second', templateId: secondTemplate.id, dependsOn: ['first'] },
        ],
      },
    ]),
  );
  const rule = result<AutomationRule>(
    await api.action('saveAutomationRule', [
      null,
      null,
      {
        name: 'Regra de teste',
        trigger: { kind: 'request-created' },
        setId: set.id,
        enabled: true,
      },
    ]),
  );
  const requestId = result<string>(
    await api.action('saveRequest', [
      null,
      {
        citizenId: null,
        title: 'Origem da automação',
        description: 'Descrição',
        departmentId: '',
        patternId: null,
        dueAt: '',
        priority: 'Normal',
        status: 'pending',
      },
    ]),
  );
  result(await api.action('startRequestAutomation', [requestId, rule.id]));
  let workspace = result<RequestWorkspace>(await api.action('loadRequestWorkspace', [requestId]));
  assert.equal(workspace.extras.tasks.length, 1);
  result(
    await api.action('setRequestTaskCompleted', [requestId, workspace.extras.tasks[0].id, true]),
  );
  workspace = result<RequestWorkspace>(await api.action('loadRequestWorkspace', [requestId]));
  assert.equal(workspace.extras.tasks.length, 2);
  assert.equal(workspace.extras.tasks[1].status, 'todo');
});
