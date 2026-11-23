import {
  departmentOptions,
  type DepartmentOption,
  departmentScopeIds,
} from '../../features/requests/models/department-options';
import { MOCK_DEPARTMENTS } from '../data/sjc-departments.mock';
import { inject, Service, signal } from '@angular/core';
import { TeamCollaborationService } from '../../core/services/team-collaboration.service';
import type { TextReference } from '../../core/models/collaboration';
import { MOCK_CITIZEN_DETAILS } from '../data/citizen-details.mock';
import type {
  CitizenDetail,
  CitizenRequest,
  NewCitizenRequest,
  CitizenInteraction,
  NewCitizenInteraction,
} from '../../features/citizens/models/citizen-detail';
import type { CitizenDetailRepository } from '../../features/citizens/repositories/citizen-detail-repository';
import type {
  CitizenListQuery,
  CitizenListResult,
} from '../../features/citizens/models/citizen-list';
import { currentCitizenCalendarDate } from '../../features/citizens/models/citizen-birth-filters';
import { queryMockCitizens, type MockCitizenListRecord } from './mock-citizen-list-query';
import type { LabelRecipient } from '../../features/labels/models/label-print';
import { TASK_STATUSES, taskStatusLabel, type Task, type TaskStatus } from '../../core/models/task';
import type {
  CustomKanbanColumn,
  KanbanWorkspace,
  TaskDraft,
  TaskRequestChoice,
  TaskCollaboration,
  KanbanMoveTarget,
  KanbanView,
} from '../../features/kanban/models/kanban';
import { matchesKanbanColumn, orderKanbanTasks } from '../../features/kanban/models/kanban-order';
import { MOCK_KANBAN_COLUMNS } from '../data/custom-columns.mock';
import { MOCK_INDEPENDENT_TASKS } from '../data/independent-tasks.mock';
import { initialTaskHistory } from '../data/task-history.mock';
import { taskHistoryEvent, type TaskHistoryEvent } from '../../core/models/task-history';
import type {
  ActivityKind,
  ActivityRecord,
} from '../../features/activities/models/activity-detail';
import type { TimelineEntry } from '../../features/activities/models/timeline-entry';
import type {
  Department,
  DepartmentDraft,
  RequestPattern,
  RequestPatternDraft,
  RequestExtras,
  RequestWorkspace,
  RequestEditorDraft,
  NewRequestComment,
  NewRequestTask,
  RequestAttachment,
  RequestComment,
} from '../../features/requests/models/request-detail';
import { MOCK_TASK_COMMENTS, MOCK_TASK_ATTACHMENTS } from '../data/task-collaboration.mock';
import { MOCK_REQUEST_PATTERNS, initialRequestExtras } from '../data/request-extras.mock';
import { REQUEST_PRIORITIES } from '../../features/requests/models/request-detail';
import { requestTimeline } from '../../features/requests/models/request-timeline';
import { MOCK_CITIZENS } from '../data/citizens.mock';
import { MOCK_GENERAL_REQUEST, MOCK_GENERAL_REQUEST_EXTRAS } from '../data/general-requests.mock';

import type {
  RequestListQuery,
  RequestListResult,
} from '../../features/requests/models/request-list';
import type { RequestPatternManagementResult } from '../../features/requests/models/request-pattern-management';
import type {
  TaskLabel,
  TaskLabelDraft,
  TaskLabelManagementResult,
} from '../../core/models/task-label';
import { MOCK_TASK_LABELS, MOCK_TASK_LABEL_DEFAULT_COLOR } from '../data/task-labels.mock';

@Service()
export class MockCitizenDetailRepository implements CitizenDetailRepository {
  private readonly taskLabels = signal<readonly TaskLabel[]>(MOCK_TASK_LABELS);
  private readonly requestPatterns = signal<readonly RequestPattern[]>(MOCK_REQUEST_PATTERNS);
  private readonly taskHistory = signal<readonly TaskHistoryEvent[]>([]);
  private readonly kanbanOrder = signal<Readonly<Record<KanbanView, readonly string[]>>>({
    status: [],
    custom: [],
  });
  private readonly team = inject(TeamCollaborationService);
  private readonly taskComments =
    signal<Readonly<Record<string, readonly RequestComment[]>>>(MOCK_TASK_COMMENTS);
  private readonly taskAttachments =
    signal<Readonly<Record<string, readonly RequestAttachment[]>>>(MOCK_TASK_ATTACHMENTS);
  private readonly kanbanColumns = signal<readonly CustomKanbanColumn[]>(MOCK_KANBAN_COLUMNS);
  private readonly independentTasks = signal<readonly Task[]>(MOCK_INDEPENDENT_TASKS);
  private readonly departments = signal<readonly Department[]>(MOCK_DEPARTMENTS);
  private readonly requests = signal<
    readonly {
      readonly citizenId: string | null;
      readonly record: CitizenRequest;
    }[]
  >([
    ...MOCK_CITIZEN_DETAILS.flatMap(({ id, requests }) =>
      requests.map((record) => ({ citizenId: id, record })),
    ),
    { citizenId: null, record: MOCK_GENERAL_REQUEST },
  ]);
  private readonly requestExtras = signal<Readonly<Record<string, RequestExtras>>>({
    ...Object.fromEntries(
      MOCK_CITIZEN_DETAILS.flatMap((citizen) =>
        citizen.requests.map((request) => [
          request.id,
          initialRequestExtras(request.id, request.status === 'completed'),
        ]),
      ),
    ),
    [MOCK_GENERAL_REQUEST.id]: MOCK_GENERAL_REQUEST_EXTRAS,
  });
  private readonly contacts = signal<Readonly<Record<string, readonly CitizenInteraction[]>>>({});
  private readonly requestContacts = signal<
    Readonly<Record<string, readonly CitizenInteraction[]>>
  >({});
  private readonly profileEdits = signal<
    Readonly<Record<string, Partial<Pick<CitizenDetail, 'observations' | 'categories'>>>>
  >({});
  private readonly categoryCatalog = signal<readonly string[]>([
    ...new Set([
      ...MOCK_CITIZEN_DETAILS.flatMap((citizen) => citizen.categories),
      'Associação de moradores',
      'Voluntariado',
      'Extrema Direita',
      'Centro Direita',
      'Vota no Sérgio',
      'Esquerda sem Roubo',
      'Comunidade São José',
    ]),
  ]);

  constructor() {
    this.taskHistory.set(
      initialTaskHistory(this.loadKanbanWorkspace().tasks, this.team.users, this.kanbanColumns()),
    );
  }

  loadRequestList(query: RequestListQuery): RequestListResult {
    const normalize = (value: string): string =>
      value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
    const terms = normalize(query.text).trim().split(/\s+/u).filter(Boolean);
    const requests = this.requests();
    const citizens = new Map(MOCK_CITIZEN_DETAILS.map(({ id, name }) => [id, { id, name }]));
    const extras = this.requestExtras();
    const departments = new Map(
      this.departments().map((department) => [department.id, department]),
    );
    const departmentLabels = terms.length
      ? new Map(departmentOptions(this.departments()).map(({ id, label }) => [id, label]))
      : null;
    const departmentScope = query.departmentId
      ? departmentScopeIds(this.departments(), [query.departmentId])
      : null;
    const items = requests.flatMap(({ record, citizenId }) => {
      const { id, title, description, protocol, status, createdAt } = record;
      const departmentId = extras[id]?.departmentId ?? '';
      if (query.status && status !== query.status) return [];
      if (departmentScope && !departmentScope.has(departmentId)) return [];
      const department = departments.get(departmentId)?.name ?? record.department;
      const citizen = citizenId ? (citizens.get(citizenId) ?? null) : null;
      if (terms.length) {
        const comments = extras[id]?.comments ?? [];
        const text = normalize(
          [
            protocol,
            title,
            description,
            departmentLabels?.get(departmentId) ?? department,
            citizen?.name,
            ...comments.map(({ text }) => text),
          ].join(' '),
        );
        if (!terms.every((term) => text.includes(term))) return [];
      }
      return [
        { id, title, description, protocol, status, createdAt, departmentId, department, citizen },
      ];
    });
    items.sort((a, b) => {
      const diff = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return query.order === 'recent' ? diff : -diff;
    });
    return { items, total: requests.length };
  }

  loadKanbanWorkspace(): KanbanWorkspace {
    const extras = this.requestExtras();
    const departments = this.departments();
    const requestChoice = (
      request: CitizenDetail['requests'][number],
      citizen: TaskRequestChoice['citizen'],
    ): TaskRequestChoice => ({
      id: request.id,
      title: request.title,
      protocol: request.protocol,
      departmentId: extras[request.id].departmentId,
      department:
        departments.find((item) => item.id === extras[request.id].departmentId)?.name ??
        request.department,
      citizen,
    });
    const requests = this.requests().map(({ record, citizenId }) => {
      const citizen = MOCK_CITIZEN_DETAILS.find(({ id }) => id === citizenId);
      return requestChoice(record, citizen ? { id: citizen.id, name: citizen.name } : null);
    });
    return {
      history: this.taskHistory(),
      labels: this.listTaskLabels(),
      requests,
      customColumns: this.kanbanColumns(),
      order: this.kanbanOrder(),
      tasks: [
        ...this.independentTasks().map((task) => ({
          ...task,
          request: null,
          commentCount: this.taskComments()[task.id]?.length ?? 0,
          attachmentCount: this.taskAttachments()[task.id]?.length ?? 0,
          cover: this.taskAttachments()[task.id]?.find((item) => item.kind === 'photo') ?? null,
        })),
        ...requests.flatMap((request) =>
          extras[request.id].tasks.map((task) => ({
            ...task,
            request,
            commentCount: extras[request.id].comments.filter((item) => item.taskId === task.id)
              .length,
            attachmentCount: extras[request.id].attachments.filter(
              (item) => item.taskId === task.id,
            ).length,
            cover:
              extras[request.id].attachments.find(
                (item) => item.taskId === task.id && item.kind === 'photo',
              ) ?? null,
          })),
        ),
      ],
    };
  }

  saveKanbanTask(id: string | null, draft: TaskDraft): string {
    const workspace = this.loadKanbanWorkspace();
    const existing = id ? workspace.tasks.find((task) => task.id === id) : undefined;
    if (id && !existing) throw new Error('Tarefa não encontrada.');
    if (draft.requestId && !workspace.requests.some((request) => request.id === draft.requestId))
      throw new Error('Solicitação não encontrada.');
    if (existing && (existing.request?.id ?? '') !== draft.requestId)
      throw new Error('O vínculo da tarefa não pode ser alterado nesta tela.');
    if (
      draft.customColumnId &&
      !this.kanbanColumns().some((column) => column.id === draft.customColumnId)
    )
      throw new Error('Coluna não encontrada.');
    const now = new Date().toISOString();
    const { requestId, customColumnId, ...values } = draft;
    const task: Task = {
      ...values,
      assigneeIds: this.team.validateAssignees(values.assigneeIds),
      labelIds: this.validateTaskLabelIds(values.labelIds),
      createdBy: existing?.createdBy ?? this.team.actor.name,
      customColumnId: customColumnId || null,
      id: existing?.id ?? `task-${crypto.randomUUID()}`,
      createdAt: existing?.createdAt ?? now,
      completedAt: draft.status === 'completed' ? (existing?.completedAt ?? now) : null,
    };
    if (requestId && !existing) {
      return this.addRequestTask(requestId, { ...values, customColumnId: customColumnId || null });
    }
    const event = taskHistoryEvent(
      existing ?? null,
      task,
      this.team.actor,
      this.team.users,
      this.kanbanColumns(),
      now,
      this.taskLabels(),
    );
    if (!event) return task.id;
    if (!requestId) {
      this.independentTasks.update((tasks) =>
        id ? tasks.map((item) => (item.id === id ? task : item)) : [...tasks, task],
      );
      this.taskHistory.update((events) => [...events, event]);
      this.team.notifyMentions(
        `${existing?.title ?? ''}\n${existing?.description ?? ''}`,
        `${task.title}\n${task.description}`,
        { taskId: task.id, taskTitle: task.title },
      );
      return task.id;
    }
    if (!existing) throw new Error('Tarefa não encontrada.');
    const statusChanged = existing.status !== task.status;
    const columnChanged = existing.customColumnId !== task.customColumnId;
    const columnName = (columnId: string | null): string =>
      this.kanbanColumns().find((column) => column.id === columnId)?.name ?? 'Sem coluna';
    this.updateRequest(requestId, (extras) => ({
      ...extras,
      tasks: extras.tasks.map((item) => (item.id === id ? task : item)),
      changes: [
        ...extras.changes,
        {
          author: this.team.actor.name,
          id: crypto.randomUUID(),
          type: 'task',
          taskId: task.id,
          title: statusChanged
            ? `Tarefa: ${taskStatusLabel(existing.status)} → ${taskStatusLabel(task.status)}`
            : columnChanged
              ? 'Coluna da tarefa alterada'
              : 'Tarefa atualizada',
          description: columnChanged
            ? `${task.title} · ${columnName(existing.customColumnId)} → ${columnName(task.customColumnId)}`
            : task.title,
          occurredAt: now,
        },
      ],
    }));
    this.taskHistory.update((events) => [...events, event]);
    this.team.notifyMentions(
      `${existing.title}\n${existing.description}`,
      `${task.title}\n${task.description}`,
      { taskId: task.id, taskTitle: task.title },
    );
    return task.id;
  }

  loadTaskCollaboration(id: string): TaskCollaboration | null {
    const task = this.loadKanbanWorkspace().tasks.find((item) => item.id === id);
    if (!task) return null;
    const extras = task.request ? this.requestExtras()[task.request.id] : null;
    return {
      task,
      history: this.taskHistory().filter((event) => event.taskId === id),
      comments: extras
        ? extras.comments.filter((item) => item.taskId === id)
        : (this.taskComments()[id] ?? []),
      attachments: extras
        ? extras.attachments.filter((item) => item.taskId === id)
        : (this.taskAttachments()[id] ?? []),
    };
  }

  addTaskComment(id: string, text: string, parentId: string | null): void {
    const activity = this.loadTaskCollaboration(id);
    if (!activity) throw new Error('Tarefa não encontrada.');
    if (parentId && !activity.comments.some((item) => item.id === parentId))
      throw new Error('O comentário original não pertence a esta tarefa.');
    if (activity.task.request) {
      this.addRequestComment(activity.task.request.id, { text, taskId: id, parentId });
      return;
    }
    const comment: RequestComment = {
      id: `comment-${crypto.randomUUID()}`,
      text,
      taskId: id,
      parentId,
      author: this.team.actor.name,
      createdAt: new Date().toISOString(),
    };
    this.taskComments.update((items) => ({ ...items, [id]: [...(items[id] ?? []), comment] }));
    this.team.notifyMentions('', text, {
      taskId: id,
      taskTitle: activity.task.title,
      commentId: comment.id,
    });
  }

  addTaskAttachments(id: string, attachments: readonly RequestAttachment[]): void {
    const activity = this.loadTaskCollaboration(id);
    if (!activity) throw new Error('Tarefa não encontrada.');
    const values = attachments.map((attachment) => ({ ...attachment, taskId: id }));
    if (activity.task.request) {
      this.addRequestAttachments(activity.task.request.id, values);
      return;
    }
    this.taskAttachments.update((items) => ({ ...items, [id]: [...(items[id] ?? []), ...values] }));
  }

  listTextReferences(): readonly TextReference[] {
    const workspace = this.loadKanbanWorkspace();
    return [
      ...workspace.tasks.map((task): TextReference => ({
        id: task.id,
        kind: 'task',
        title: task.title,
        href: `/kanban?tarefa=${encodeURIComponent(task.id)}`,
      })),
      ...workspace.requests.map((request): TextReference => ({
        id: request.id,
        kind: 'request',
        title: request.title,
        href: `/solicitacoes/${encodeURIComponent(request.id)}`,
      })),
      ...MOCK_CITIZEN_DETAILS.flatMap((citizen): TextReference[] => [
        { id: citizen.id, kind: 'citizen', title: citizen.name, href: `/municipes/${citizen.id}` },
        ...(this.contacts()[citizen.id] ?? citizen.interactions).map(
          (interaction): TextReference => ({
            id: interaction.id,
            kind: interaction.conversation ? 'conversation' : 'interaction',
            title: interaction.title,
            href: `/${interaction.conversation ? 'conversas' : 'interacoes'}/${encodeURIComponent(interaction.id)}`,
          }),
        ),
        ...citizen.appointments.map((appointment): TextReference => ({
          id: appointment.id,
          kind: 'appointment',
          title: appointment.title,
          href: `/agendamentos/${encodeURIComponent(appointment.id)}`,
        })),
      ]),
      ...Object.values(this.requestContacts()).flatMap((contacts) =>
        contacts.map((contact): TextReference => ({
          id: contact.id,
          kind: contact.conversation ? 'conversation' : 'interaction',
          title: contact.title,
          href: `/${contact.conversation ? 'conversas' : 'interacoes'}/${encodeURIComponent(contact.id)}`,
        })),
      ),
    ];
  }

  moveKanbanTask(id: string, status: TaskStatus): void {
    const task = this.loadKanbanWorkspace().tasks.find((item) => item.id === id);
    if (!task) throw new Error('Tarefa não encontrada.');
    if (task.status === status) return;
    this.saveKanbanTask(id, {
      title: task.title,
      description: task.description,
      assigneeIds: task.assigneeIds,
      labelIds: task.labelIds,
      dueAt: task.dueAt,
      priority: task.priority,
      status,
      requestId: task.request?.id ?? '',
      customColumnId: task.customColumnId ?? '',
    });
  }

  assignKanbanTaskColumn(id: string, columnId: string | null): void {
    const task = this.loadKanbanWorkspace().tasks.find((item) => item.id === id);
    if (!task) throw new Error('Tarefa não encontrada.');
    if (task.customColumnId === columnId) return;
    this.saveKanbanTask(id, {
      title: task.title,
      description: task.description,
      assigneeIds: task.assigneeIds,
      labelIds: task.labelIds,
      dueAt: task.dueAt,
      priority: task.priority,
      status: task.status,
      requestId: task.request?.id ?? '',
      customColumnId: columnId ?? '',
    });
  }

  positionKanbanTask(id: string, target: KanbanMoveTarget, beforeId: string | null): void {
    const workspace = this.loadKanbanWorkspace();
    const task = workspace.tasks.find((item) => item.id === id);
    if (!task) throw new Error('Tarefa não encontrada.');
    if (target.kind === 'status' && !TASK_STATUSES.some((item) => item.value === target.status))
      throw new Error('Status inválido.');
    if (
      target.kind === 'custom' &&
      target.columnId !== null &&
      !workspace.customColumns.some((column) => column.id === target.columnId)
    )
      throw new Error('Coluna não encontrada.');
    if (beforeId === id) return;
    const anchor = beforeId === null ? null : workspace.tasks.find((item) => item.id === beforeId);
    if (beforeId !== null && (!anchor || !matchesKanbanColumn(anchor, target)))
      throw new Error('A posição escolhida não pertence à coluna de destino.');
    const view = target.kind;
    const ordered = orderKanbanTasks(workspace.tasks, workspace.order[view]).filter(
      (item) => item.id !== id,
    );
    const ids = ordered.map((item) => item.id);
    const destination = ordered.filter((item) => matchesKanbanColumn(item, target));
    const lastId = destination.at(-1)?.id;
    const index =
      beforeId !== null ? ids.indexOf(beforeId) : lastId ? ids.indexOf(lastId) + 1 : ids.length;
    ids.splice(index, 0, id);
    // Validar todo o comando antes de alterar dados ou a ordem do quadro.
    if (target.kind === 'status') this.moveKanbanTask(id, target.status);
    else this.assignKanbanTaskColumn(id, target.columnId);
    this.kanbanOrder.update((order) => ({ ...order, [view]: ids }));
  }

  createKanbanColumn(name: string): void {
    const normalized = (value: string): string =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim()
        .replace(/\s+/g, ' ');
    const value = name.trim().replace(/\s+/g, ' ');
    if (!value || value.length > 60) throw new Error('Informe um nome de até 60 caracteres.');
    if (
      normalized(value) === 'sem coluna' ||
      this.kanbanColumns().some((column) => normalized(column.name) === normalized(value))
    )
      throw new Error('Já existe uma coluna com esse nome.');
    this.kanbanColumns.update((columns) => [
      ...columns,
      { id: `column-${crypto.randomUUID()}`, name: value },
    ]);
  }

  prepareLabelRecipients(citizenIds: readonly string[]): readonly LabelRecipient[] {
    const ids = [...new Set(citizenIds)];
    if (ids.length > 5000) throw new Error('Selecione até 5.000 munícipes por geração.');
    const people = new Map(MOCK_CITIZEN_DETAILS.map((person) => [person.id, person]));
    return ids.map((id) => {
      const person = people.get(id);
      if (!person) throw new Error('Um dos munícipes selecionados não foi encontrado.');
      return {
        id,
        name: person.name,
        street: person.address.street,
        complement: person.address.complement,
        neighborhood: person.neighborhood,
        city: person.address.city,
        state: person.address.state,
        postalCode: person.address.postalCode,
        phone: person.phone,
        cra: person.cra ?? '',
        categories: this.profileEdits()[id]?.categories ?? person.categories,
        birthDate: person.birthDate,
      };
    });
  }

  async loadCitizenList(query: CitizenListQuery): Promise<CitizenListResult> {
    // Capturar o estado antes da fronteira assíncrona preserva a reatividade do mock.
    const citizens = this.projectCitizenList();
    const departments = this.departments();
    const matches = queryMockCitizens(citizens, departments, query, currentCitizenCalendarDate());
    return {
      items: matches.map(({ birthDate, observations, phoneNumbers, requests, ...item }) => item),
      total: citizens.length,
      neighborhoods: [...new Set(citizens.map((person) => person.neighborhood))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
      ),
      categories: [...this.listCategories()].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      departments: departmentOptions(departments),
    };
  }

  private projectCitizenList(): readonly MockCitizenListRecord[] {
    const edits = this.profileEdits();
    const contacts = this.contacts();
    const requestExtras = this.requestExtras();
    return MOCK_CITIZEN_DETAILS.map((citizen) => {
      const requests = this.requestsForCitizen(citizen.id);
      const interactions = contacts[citizen.id] ?? citizen.interactions;
      const lastInteractionAt = interactions
        .filter((item) => item.type !== 'request')
        .reduce<string | null>(
          (latest, item) =>
            !latest || Date.parse(item.occurredAt) > Date.parse(latest) ? item.occurredAt : latest,
          null,
        );
      const original = citizen.photos[0];
      const thumbnail = original ? new URL(original.src) : null;
      if (thumbnail) {
        thumbnail.searchParams.set('w', '120');
        thumbnail.searchParams.set('h', '120');
        thumbnail.searchParams.set('q', '70');
      }
      return {
        id: citizen.id,
        name: citizen.name,
        initials: citizen.initials,
        neighborhood: citizen.neighborhood,
        phone: citizen.phone,
        cra: citizen.cra,
        birthDate: citizen.birthDate,
        observations: edits[citizen.id]?.observations ?? citizen.observations,
        photo: original && thumbnail ? { src: thumbnail.toString(), label: original.label } : null,
        phoneNumbers: citizen.phones.map((phone) => phone.number),
        whatsappUrl: citizen.phones.find((phone) => phone.whatsappUrl)?.whatsappUrl ?? '',
        socialLinks: citizen.socialLinks,
        categories: edits[citizen.id]?.categories ?? citizen.categories,
        pendingRequests: requests.filter((request) => request.status === 'pending').length,
        completedRequests: requests.filter((request) => request.status === 'completed').length,
        requests: requests.map((request) => ({
          departmentId: requestExtras[request.id]?.departmentId ?? '',
          status: request.status,
        })),
        lastInteractionAt,
      };
    });
  }

  loadDetail(citizenId: string): CitizenDetail | null {
    const citizen = MOCK_CITIZEN_DETAILS.find((citizen) => citizen.id === citizenId);
    if (!citizen) return null;
    const contacts = this.contacts()[citizenId];
    return {
      ...citizen,
      ...this.profileEdits()[citizenId],
      interactions: contacts ?? citizen.interactions,
      requests: this.requestsForCitizen(citizenId),
    };
  }

  private requestsForCitizen(citizenId: string): readonly CitizenRequest[] {
    return this.requests()
      .filter((entry) => entry.citizenId === citizenId)
      .map(({ record }) => this.requestWithDepartment(record));
  }

  private requestWithDepartment(request: CitizenRequest): CitizenRequest {
    const departmentId = this.requestExtras()[request.id]?.departmentId;
    const department = this.departments().find((item) => item.id === departmentId);
    return department ? { ...request, department: department.name } : request;
  }

  saveRequest(id: string | null, draft: RequestEditorDraft): string {
    const title = draft.title.trim();
    const description = draft.description.trim();
    if (!title || title.length > 120 || !description || description.length > 5000)
      throw new Error('Informe título de até 120 caracteres e descrição de até 5.000 caracteres.');
    const department = this.departments().find((item) => item.id === draft.departmentId);
    if (!department) throw new Error('Selecione um departamento válido.');
    if (draft.patternId && !this.listRequestPatterns().some((item) => item.id === draft.patternId))
      throw new Error('Selecione um padrão de solicitação válido.');
    if (
      !REQUEST_PRIORITIES.some((priority) => priority === draft.priority) ||
      !['pending', 'completed'].includes(draft.status)
    )
      throw new Error('Informe uma prioridade e situação válidas.');
    if (draft.dueAt && !Number.isFinite(Date.parse(draft.dueAt)))
      throw new Error('Informe um prazo válido.');
    const dueAt = draft.dueAt ? new Date(draft.dueAt).toISOString() : '';
    const fields = { title, description, dueAt, priority: draft.priority, status: draft.status };
    if (!id) {
      return this.createRequest(draft.citizenId, {
        ...fields,
        department: department.name,
        departmentId: department.id,
        patternId: draft.patternId,
        occurredAt: new Date().toISOString(),
        direction: draft.citizenId ? 'passive' : 'active',
      });
    }
    const entry = this.requests().find(({ record }) => record.id === id);
    const extras = this.requestExtras()[id];
    if (!entry || !extras) throw new Error('Solicitação não encontrada.');
    if (entry.citizenId !== draft.citizenId)
      throw new Error('O munícipe da solicitação existente deve ser mantido.');
    const previous = entry.record;
    const updated: CitizenRequest = { ...previous, ...fields, department: department.name };
    const changed = [
      previous.title !== title && 'Título',
      previous.description !== description && 'Descrição',
      (previous.dueAt || dueAt) && Date.parse(previous.dueAt) !== Date.parse(dueAt) && 'Prazo',
      previous.priority !== draft.priority && 'Prioridade',
      previous.status !== draft.status && 'Situação',
      extras.departmentId !== department.id && 'Departamento',
      extras.patternId !== draft.patternId && 'Padrão',
    ].filter(Boolean);
    if (!changed.length) return id;
    this.requests.update((entries) =>
      entries.map((item) => (item.record.id === id ? { ...item, record: updated } : item)),
    );
    this.updateRequest(id, (value) => ({
      ...value,
      departmentId: department.id,
      patternId: draft.patternId,
      changes: [
        ...value.changes,
        {
          id: crypto.randomUUID(),
          author: this.team.actor.name,
          title: 'Solicitação atualizada',
          description: changed.join(', '),
          occurredAt: new Date().toISOString(),
        },
      ],
    }));
    return id;
  }

  createRequest(citizenId: string | null, request: NewCitizenRequest): string {
    if (citizenId && !MOCK_CITIZEN_DETAILS.some(({ id }) => id === citizenId))
      throw new Error('Munícipe não encontrado.');
    if (request.patternId && !this.requestPatterns().some(({ id }) => id === request.patternId))
      throw new Error('Padrão não encontrado.');
    const department = this.departments().find(({ id, name }) =>
      request.departmentId ? id === request.departmentId : name === request.department,
    );
    if (!department) throw new Error('Departamento não encontrado.');
    const year = request.occurredAt.slice(0, 4);
    const latest = this.requests().reduce((max, { record }) => {
      const [protocolYear, serial] = record.protocol.split('-');
      return protocolYear === year ? Math.max(max, Number(serial) || 0) : max;
    }, 0);
    const id = `request-${crypto.randomUUID()}`;
    const record: CitizenRequest = {
      id,
      title: request.title,
      description: request.description,
      department: department.name,
      protocol: `${year}-${String(latest + 1).padStart(4, '0')}`,
      createdAt: request.occurredAt,
      createdBy: this.team.actor.name,
      direction: request.direction,
      status: request.status ?? 'pending',
      priority: request.priority ?? 'Normal',
      dueAt: request.dueAt ?? '',
      history: [],
    };
    this.requestExtras.update((extras) => ({
      ...extras,
      [id]: {
        departmentId: department.id,
        patternId: request.patternId ?? null,
        awareness: [],
        attachments: [],
        tasks: [],
        comments: [],
        changes: [],
      },
    }));
    this.requests.update((entries) => [{ citizenId, record }, ...entries]);
    return id;
  }

  loadActivityDetail(kind: ActivityKind, id: string): ActivityRecord | null {
    if (kind === 'request') {
      const entry = this.requests().find(({ record }) => record.id === id);
      if (!entry) return null;
      const citizen = entry.citizenId ? this.loadDetail(entry.citizenId) : null;
      return {
        kind,
        citizen,
        record: this.requestWithDepartment(entry.record),
        interactions:
          citizen?.interactions.filter((item) => item.requestId === id) ??
          this.requestContacts()[id] ??
          [],
      };
    }
    for (const summary of MOCK_CITIZEN_DETAILS) {
      const citizen = this.loadDetail(summary.id)!;
      if (kind === 'appointment') {
        const record = citizen.appointments.find((item) => item.id === id);
        if (record) return { kind, citizen, record };
      } else {
        const record = citizen.interactions.find((item) => item.id === id);
        if (!record) continue;
        const request = citizen.requests.find((item) => item.id === record.requestId) ?? null;
        if (kind === 'interaction') return { kind, citizen, record, request };
        if (record.conversation)
          return {
            kind,
            citizen,
            record,
            request,
            messages: record.conversation.messages,
            status: record.conversation.status,
          };
      }
    }
    if (kind !== 'appointment') {
      for (const [requestId, contacts] of Object.entries(this.requestContacts())) {
        const record = contacts.find((item) => item.id === id);
        if (!record) continue;
        const detail = this.loadActivityDetail('request', requestId);
        if (detail?.kind !== 'request') continue;
        if (kind === 'interaction')
          return { kind, citizen: detail.citizen, record, request: detail.record };
        if (record.conversation) {
          return {
            kind,
            citizen: detail.citizen,
            record,
            request: detail.record,
            messages: record.conversation.messages,
            status: record.conversation.status,
          };
        }
      }
    }
    return null;
  }

  loadRequestWorkspace(id: string): RequestWorkspace | null {
    const detail = this.loadActivityDetail('request', id);
    if (!detail || detail.kind !== 'request') return null;
    const citizen = detail.citizen ? this.loadDetail(detail.citizen.id) : null;
    const extras = this.requestExtras()[id];
    return {
      citizen,
      request: detail.record,
      extras,
      awareness: extras.awareness.flatMap((link) => {
        const person = MOCK_CITIZENS.find((item) => item.id === link.citizenId);
        return person ? [{ ...link, citizen: person }] : [];
      }),
      timeline: requestTimeline(detail.record, extras, detail.interactions),
    };
  }

  loadCitizenTimeline(citizenId: string): readonly TimelineEntry[] {
    const citizen = this.loadDetail(citizenId);
    if (!citizen) return [];
    const requestIds = new Set(citizen.requests.map((request) => request.id));
    return [
      ...citizen.interactions.filter((item) => !item.requestId || !requestIds.has(item.requestId)),
      ...citizen.requests.flatMap((request) =>
        requestTimeline(request, this.requestExtras()[request.id], citizen.interactions),
      ),
      ...Object.entries(this.requestExtras()).flatMap(([requestId, extras]): TimelineEntry[] => {
        const link = extras.awareness.find((item) => item.citizenId === citizenId);
        if (!link) return [];
        const detail = this.loadRequestWorkspace(requestId);
        if (!detail) return [];
        return [
          {
            id: link.id,
            type: 'request-update',
            title: `Vinculado para ciência: ${detail.request.title}`,
            description: 'Munícipe vinculado para receber ciência desta propositura.',
            department: detail.request.department,
            author: link.author,
            occurredAt: link.createdAt,
            protocol: detail.request.protocol,
            requestId,
            route: ['/solicitacoes', requestId],
            fragment: 'request-awareness',
            contextLabel: 'Vínculo de ciência',
          },
        ];
      }),
    ].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  }

  listTaskLabels(): readonly TaskLabel[] {
    return [...this.taskLabels()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  async loadTaskLabelManagement(query: string): Promise<TaskLabelManagementResult> {
    const labels = this.listTaskLabels();
    const counts = new Map<string, number>();
    for (const task of this.loadKanbanWorkspace().tasks) {
      for (const id of task.labelIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const terms = this.normalizeDepartmentName(query).split(/\s+/u).filter(Boolean);
    const items = labels
      .filter((label) => {
        const text = this.normalizeDepartmentName(label.name);
        return terms.every((term) => text.includes(term));
      })
      .map((label) => ({ ...label, taskCount: counts.get(label.id) ?? 0 }));
    return { items, total: labels.length, defaultColor: MOCK_TASK_LABEL_DEFAULT_COLOR };
  }

  async saveTaskLabel(id: string | null, draft: TaskLabelDraft): Promise<TaskLabel> {
    const labels = this.taskLabels();
    const name = draft.name.trim().replace(/\s+/gu, ' ');
    if (!name || name.length > 60) throw new Error('Informe um nome com até 60 caracteres.');
    const existing = id === null ? null : labels.find((label) => label.id === id);
    if (id !== null && !existing) throw new Error('Etiqueta não encontrada.');
    if (!/^#[0-9a-f]{6}$/i.test(draft.color)) throw new Error('Escolha uma cor válida.');
    if (
      labels.some(
        (label) =>
          label.id !== id &&
          this.normalizeDepartmentName(label.name) === this.normalizeDepartmentName(name),
      )
    ) {
      throw new Error('Já existe uma etiqueta com esse nome.');
    }
    const color = draft.color.toLowerCase();
    if (existing?.name === name && existing.color === color) return existing;
    const label: TaskLabel = { id: id ?? `task-label-${crypto.randomUUID()}`, name, color };
    this.taskLabels.set(
      id === null ? [...labels, label] : labels.map((item) => (item.id === id ? label : item)),
    );
    return label;
  }

  async deleteTaskLabel(id: string): Promise<void> {
    const labels = this.taskLabels();
    if (!labels.some((label) => label.id === id)) throw new Error('Etiqueta não encontrada.');
    if (this.loadKanbanWorkspace().tasks.some((task) => task.labelIds.includes(id))) {
      throw new Error(
        'Esta etiqueta está vinculada a tarefas. Remova os vínculos antes de excluir.',
      );
    }
    this.taskLabels.set(labels.filter((label) => label.id !== id));
  }

  private validateTaskLabelIds(ids: readonly string[]): readonly string[] {
    if (!Array.isArray(ids)) throw new Error('Confira as etiquetas da tarefa.');
    const unique = [...new Set(ids)];
    if (unique.some((id) => !this.taskLabels().some((label) => label.id === id))) {
      throw new Error('Uma etiqueta selecionada não existe mais. Revise as etiquetas da tarefa.');
    }
    return unique;
  }

  listDepartments(): readonly Department[] {
    return this.departments();
  }
  searchDepartments(query: string): readonly DepartmentOption[] {
    const terms = this.normalizeDepartmentName(query).split(/\s+/u).filter(Boolean);
    return departmentOptions(this.departments()).filter(({ label }) => {
      const text = this.normalizeDepartmentName(label);
      return terms.every((term) => text.includes(term));
    });
  }

  listRequestPatterns(): readonly RequestPattern[] {
    return this.requestPatterns();
  }

  async loadRequestPatternManagement(query: string): Promise<RequestPatternManagementResult> {
    const patterns = this.requestPatterns();
    const departments = departmentOptions(this.departments());
    const departmentLabels = new Map(departments.map(({ id, label }) => [id, label]));
    const counts = new Map<string, number>();
    for (const { patternId } of Object.values(this.requestExtras())) {
      if (patternId) counts.set(patternId, (counts.get(patternId) ?? 0) + 1);
    }
    const terms = this.normalizeDepartmentName(query).split(/\s+/u).filter(Boolean);
    const items = patterns
      .map((pattern) => ({
        ...pattern,
        departmentLabel:
          departmentLabels.get(pattern.departmentId) ?? 'Departamento não encontrado',
        requestCount: counts.get(pattern.id) ?? 0,
      }))
      .filter((pattern) => {
        const text = this.normalizeDepartmentName(`${pattern.name} ${pattern.departmentLabel}`);
        return terms.every((term) => text.includes(term));
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return { items, total: patterns.length, departments };
  }

  async saveRequestPattern(id: string | null, draft: RequestPatternDraft): Promise<RequestPattern> {
    const patterns = this.requestPatterns();
    const name = draft.name.trim().replace(/\s+/gu, ' ');
    if (!name || name.length > 120) throw new Error('Informe um nome com até 120 caracteres.');
    const existing = id === null ? null : patterns.find((pattern) => pattern.id === id);
    if (id !== null && !existing) throw new Error('Padrão não encontrado.');
    if (!this.departments().some((department) => department.id === draft.departmentId)) {
      throw new Error('Selecione um departamento existente.');
    }
    if (
      patterns.some(
        (pattern) =>
          pattern.id !== id &&
          this.normalizeDepartmentName(pattern.name) === this.normalizeDepartmentName(name),
      )
    ) {
      throw new Error('Já existe um padrão com esse nome.');
    }
    if (existing?.name === name && existing.departmentId === draft.departmentId) return existing;
    const pattern: RequestPattern = {
      id: id ?? `pattern-${crypto.randomUUID()}`,
      name,
      departmentId: draft.departmentId,
    };
    this.requestPatterns.set(
      id === null
        ? [...patterns, pattern]
        : patterns.map((item) => (item.id === id ? pattern : item)),
    );
    return pattern;
  }

  async deleteRequestPattern(id: string): Promise<void> {
    const patterns = this.requestPatterns();
    if (!patterns.some((pattern) => pattern.id === id)) throw new Error('Padrão não encontrado.');
    if (Object.values(this.requestExtras()).some((extras) => extras.patternId === id)) {
      throw new Error(
        'Este padrão está vinculado a solicitações. Remova os vínculos antes de excluir.',
      );
    }
    this.requestPatterns.set(patterns.filter((pattern) => pattern.id !== id));
  }

  assignRequestDepartment(requestId: string, departmentId: string): void {
    const department = this.departments().find((item) => item.id === departmentId);
    if (!department) throw new Error('Departamento não encontrado.');
    if (this.requestExtras()[requestId]?.departmentId === departmentId) return;
    this.updateRequest(requestId, (extras) => ({
      ...extras,
      departmentId,
      changes: [
        ...extras.changes,
        {
          author: this.team.actor.name,
          id: crypto.randomUUID(),
          title: 'Departamento relacionado alterado',
          description: department.name,
          occurredAt: new Date().toISOString(),
        },
      ],
    }));
  }

  saveDepartment(id: string | null, draft: DepartmentDraft): Department {
    const name = draft.name.trim().replace(/\s+/gu, ' ');
    const departments = this.departments();
    if (!name || name.length > 120) {
      throw new Error('Informe um nome com até 120 caracteres.');
    }
    if (id && !departments.some((item) => item.id === id)) {
      throw new Error('Departamento não encontrado.');
    }
    if (id === 'dept-gabinete') {
      throw new Error('O Gabinete é a unidade interna padrão do sistema.');
    }
    if (draft.parentId && !departments.some((item) => item.id === draft.parentId)) {
      throw new Error('A unidade superior selecionada não existe.');
    }
    if (id && draft.parentId && departmentScopeIds(departments, [id]).has(draft.parentId)) {
      throw new Error('A unidade superior não pode ser a própria unidade nem uma subordinada.');
    }
    if (
      departments.some(
        (item) =>
          item.id !== id &&
          item.parentId === draft.parentId &&
          this.normalizeDepartmentName(item.name) === this.normalizeDepartmentName(name),
      )
    ) {
      throw new Error('Já existe uma unidade com esse nome sob a mesma unidade superior.');
    }
    const department = { id: id ?? `dept-${crypto.randomUUID()}`, name, parentId: draft.parentId };
    this.departments.set(
      id
        ? departments.map((item) => (item.id === id ? department : item))
        : [...departments, department],
    );
    return department;
  }

  deleteDepartment(id: string): void {
    const departments = this.departments();
    if (!departments.some((item) => item.id === id)) {
      throw new Error('Departamento não encontrado.');
    }
    if (id === 'dept-gabinete') {
      throw new Error('O Gabinete é a unidade interna padrão do sistema.');
    }
    if (departments.some((item) => item.parentId === id)) {
      throw new Error('Mova ou remova as unidades subordinadas antes de excluir.');
    }
    if (
      Object.values(this.requestExtras()).some((item) => item.departmentId === id) ||
      this.listRequestPatterns().some((item) => item.departmentId === id)
    ) {
      throw new Error('Este departamento está vinculado a solicitações ou padrões.');
    }
    if (
      [...Object.values(this.contacts()), ...Object.values(this.requestContacts())].some(
        (contacts) => contacts.some((contact) => contact.departmentId === id),
      )
    ) {
      throw new Error('Este departamento está vinculado a contatos.');
    }
    this.departments.set(departments.filter((item) => item.id !== id));
  }

  createAndAssignDepartment(requestId: string, name: string): void {
    if (!this.requestExtras()[requestId]) throw new Error('Solicitação não encontrada.');
    const normalized = this.normalizeDepartmentName(name);
    const existing = this.departments().find(
      (item) => item.parentId === null && this.normalizeDepartmentName(item.name) === normalized,
    );
    this.assignRequestDepartment(
      requestId,
      (existing ?? this.saveDepartment(null, { name, parentId: null })).id,
    );
  }

  private normalizeDepartmentName(value: string): string {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();
  }

  assignRequestPattern(requestId: string, patternId: string | null): void {
    const pattern = this.requestPatterns().find((item) => item.id === patternId);
    if (patternId && !pattern) throw new Error('Padrão não encontrado.');
    if (this.requestExtras()[requestId]?.patternId === patternId) return;
    this.updateRequest(requestId, (extras) => ({
      ...extras,
      patternId,
      changes: [
        ...extras.changes,
        {
          author: this.team.actor.name,
          id: crypto.randomUUID(),
          title: 'Padrão da solicitação alterado',
          description: pattern?.name ?? 'Solicitação livre',
          occurredAt: new Date().toISOString(),
        },
      ],
    }));
  }

  addRequestComment(requestId: string, comment: NewRequestComment): void {
    const commentId = `comment-${crypto.randomUUID()}`;
    this.updateRequest(requestId, (extras) => {
      if (comment.taskId && !extras.tasks.some((task) => task.id === comment.taskId))
        throw new Error('Tarefa não encontrada.');
      if (
        comment.parentId &&
        !extras.comments.some(
          (parent) => parent.id === comment.parentId && parent.taskId === comment.taskId,
        )
      )
        throw new Error('O comentário original não pertence a este contexto.');
      return {
        ...extras,
        comments: [
          ...extras.comments,
          {
            ...comment,
            id: commentId,
            author: 'Ana Martins',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
    if (comment.taskId) {
      const task = this.requestExtras()[requestId].tasks.find(
        (item) => item.id === comment.taskId,
      )!;
      this.team.notifyMentions('', comment.text, {
        taskId: task.id,
        taskTitle: task.title,
        commentId,
      });
    }
  }

  addRequestAttachments(requestId: string, attachments: readonly RequestAttachment[]): void {
    this.updateRequest(requestId, (extras) => ({
      ...extras,
      attachments: [...extras.attachments, ...attachments],
    }));
  }

  addRequestAwareness(requestId: string, citizenId: string): void {
    const detail = this.loadRequestWorkspace(requestId);
    if (!detail) throw new Error('Solicitação não encontrada.');
    const citizen = MOCK_CITIZENS.find((item) => item.id === citizenId);
    if (!citizen) throw new Error('Munícipe não encontrado.');
    if (detail.citizen?.id === citizenId)
      throw new Error('O solicitante já está vinculado à solicitação.');
    this.updateRequest(requestId, (extras) => {
      if (extras.awareness.some((item) => item.citizenId === citizenId))
        throw new Error('Este munícipe já está vinculado para ciência.');
      const now = new Date().toISOString();
      const id = `awareness-${crypto.randomUUID()}`;
      return {
        ...extras,
        awareness: [...extras.awareness, { id, citizenId, createdAt: now, author: 'Ana Martins' }],
        changes: [
          ...extras.changes,
          {
            author: this.team.actor.name,
            id: `${id}-created`,
            title: 'Munícipe vinculado para ciência',
            description: citizen.name,
            occurredAt: now,
          },
        ],
      };
    });
  }

  removeRequestAwareness(requestId: string, awarenessId: string): void {
    this.updateRequest(requestId, (extras) => {
      const link = extras.awareness.find((item) => item.id === awarenessId);
      if (!link) throw new Error('Vínculo de ciência não encontrado.');
      const citizen = MOCK_CITIZENS.find((item) => item.id === link.citizenId);
      return {
        ...extras,
        awareness: extras.awareness.filter((item) => item.id !== awarenessId),
        changes: [
          ...extras.changes,
          {
            author: this.team.actor.name,
            id: crypto.randomUUID(),
            title: 'Vínculo de ciência removido',
            description: citizen?.name ?? 'Munícipe',
            occurredAt: new Date().toISOString(),
          },
        ],
      };
    });
  }

  registerRequestContact(requestId: string, contact: NewCitizenInteraction): void {
    if (contact.type === 'request') throw new Error('Use a criação de solicitação.');
    const detail = this.loadRequestWorkspace(requestId);
    if (!detail) throw new Error('Solicitação não encontrada.');
    const value = {
      ...contact,
      requestId,
      protocol: detail.request.protocol,
      department: detail.request.department,
      departmentId: detail.extras.departmentId,
    };
    if (detail.citizen) {
      this.registerContact(detail.citizen.id, value);
      return;
    }
    const interaction = this.createInteractionRecord(value);
    this.requestContacts.update((items) => ({
      ...items,
      [requestId]: [interaction, ...(items[requestId] ?? [])],
    }));
  }

  addRequestTask(requestId: string, task: NewRequestTask): string {
    const labelIds = this.validateTaskLabelIds(task.labelIds);
    const now = new Date().toISOString();
    const taskId = `task-${crypto.randomUUID()}`;
    const status = task.status ?? 'todo';
    this.updateRequest(requestId, (extras) => ({
      ...extras,
      tasks: [
        ...extras.tasks,
        {
          ...task,
          assigneeIds: this.team.validateAssignees(task.assigneeIds),
          labelIds,
          createdBy: this.team.actor.name,
          id: taskId,
          createdAt: now,
          completedAt: status === 'completed' ? now : null,
          status,
          priority: task.priority ?? 'normal',
          customColumnId: task.customColumnId ?? null,
        },
      ],
    }));
    const createdTask = this.requestExtras()[requestId].tasks.find((item) => item.id === taskId)!;
    const event = taskHistoryEvent(
      null,
      createdTask,
      this.team.actor,
      this.team.users,
      this.kanbanColumns(),
      now,
      this.taskLabels(),
    );
    if (event) this.taskHistory.update((events) => [...events, event]);
    this.team.notifyMentions('', `${task.title}\n${task.description}`, {
      taskId,
      taskTitle: task.title,
    });
    return taskId;
  }

  setRequestTaskCompleted(requestId: string, taskId: string, completed: boolean): void {
    const task = this.requestExtras()[requestId]?.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error('Tarefa não encontrada.');
    if (!!task.completedAt === completed) return;
    this.moveKanbanTask(taskId, completed ? 'completed' : 'todo');
  }

  private updateRequest(id: string, update: (extras: RequestExtras) => RequestExtras): void {
    this.requestExtras.update((items) => {
      if (!items[id]) throw new Error('Solicitação não encontrada.');
      return { ...items, [id]: update(items[id]) };
    });
  }

  saveObservations(citizenId: string, text: string): void {
    if (!this.loadDetail(citizenId)) throw new Error('Munícipe não encontrado.');
    this.profileEdits.update((edits) => ({
      ...edits,
      [citizenId]: { ...edits[citizenId], observations: text },
    }));
  }

  listCategories(): readonly string[] {
    return this.categoryCatalog();
  }

  addCategory(citizenId: string, name: string): void {
    const citizen = this.loadDetail(citizenId);
    if (!citizen) throw new Error('Munícipe não encontrado.');
    const normalize = (value: string): string =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();
    const category =
      this.categoryCatalog().find((item) => normalize(item) === normalize(name)) ?? name;
    if (!this.categoryCatalog().includes(category))
      this.categoryCatalog.update((items) => [...items, category]);
    if (citizen.categories.includes(category)) return;
    this.profileEdits.update((edits) => ({
      ...edits,
      [citizenId]: { ...edits[citizenId], categories: [...citizen.categories, category] },
    }));
  }

  removeCategory(citizenId: string, name: string): void {
    const citizen = this.loadDetail(citizenId);
    if (!citizen) throw new Error('Munícipe não encontrado.');
    this.profileEdits.update((edits) => ({
      ...edits,
      [citizenId]: {
        ...edits[citizenId],
        categories: citizen.categories.filter((category) => category !== name),
      },
    }));
  }

  registerContact(citizenId: string, contact: NewCitizenInteraction): void {
    if (contact.type === 'request') throw new Error('Use a criação de solicitação.');
    const citizen = MOCK_CITIZEN_DETAILS.find((citizen) => citizen.id === citizenId);
    if (!citizen) {
      throw new Error('Munícipe não encontrado.');
    }
    const interaction = this.createInteractionRecord(contact);
    this.contacts.update((contacts) => ({
      ...contacts,
      [citizenId]: [interaction, ...(contacts[citizenId] ?? citizen.interactions)],
    }));
  }
  private createInteractionRecord(contact: NewCitizenInteraction): CitizenInteraction {
    return {
      ...contact,
      id: `contact-${crypto.randomUUID()}`,
      author: this.team.actor.name,
      conversation: contact.type === 'conversation' ? { status: 'open', messages: [] } : undefined,
    };
  }
}
