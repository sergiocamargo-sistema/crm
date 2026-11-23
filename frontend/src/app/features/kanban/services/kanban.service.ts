import { computed, DestroyRef, inject, Service, type Signal } from '@angular/core';
import { TeamCollaborationService } from '../../../core/services/team-collaboration.service';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../core/models/task';
import { attachmentType, MAX_ATTACHMENT_SIZE } from '../../requests/models/attachment-files';
import type { RequestAttachment } from '../../requests/models/request-detail';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import type { KanbanMoveTarget, KanbanTask, TaskDraft } from '../models/kanban';

import { ReadStore } from '../../../core/stores/read-store';
import { KanbanStore, initialQuery } from '../stores/kanban.store';

@Service()
export class KanbanService {
  private readonly fileUrls = new Set<string>();
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly team = inject(TeamCollaborationService);
  readonly currentUserId = this.team.actor.id;
  readonly store = new KanbanStore(
    computed(() => this.repository.loadKanbanWorkspace()),
    computed(() => this.repository.listDepartments()),
    this.team.users,
  );
  readonly query = this.store.query;
  readonly viewSettings = this.store.viewSettings;
  readonly workspace = this.store.workspace;
  readonly departments = this.store.departments;
  readonly assignees = this.store.assignees;
  readonly activeFilterCount = this.store.activeFilterCount;
  readonly results = this.store.results;
  readonly columns = this.store.columns;
  readonly overdueCount = this.store.overdueCount;
  readonly firstCoverTaskId = this.store.firstCoverTaskId;

  constructor() {
    const timer = setInterval(() => this.store.now.set(Date.now()), 60_000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.fileUrls.forEach((url) => URL.revokeObjectURL(url));
    });
  }
  isOverdue(task: KanbanTask): boolean {
    return this.store.isOverdue(task);
  }
  clearFilters(): void {
    this.query.set(initialQuery());
  }
  saveTask(id: string | null, draft: TaskDraft): string {
    const title = draft.title.trim();
    const assigneeIds = this.team.validateAssignees(draft.assigneeIds);
    if (!title || title.length > 120) throw new Error('Informe um título de até 120 caracteres.');
    if (draft.description.length > 1500)
      throw new Error('Descreva a tarefa em até 1.500 caracteres.');
    if (draft.dueAt && !Number.isFinite(Date.parse(draft.dueAt)))
      throw new Error('Informe um prazo válido.');
    if (
      !TASK_STATUSES.some((item) => item.value === draft.status) ||
      !TASK_PRIORITIES.some((item) => item.value === draft.priority)
    )
      throw new Error('Confira a etapa e a prioridade.');
    return this.repository.saveKanbanTask(id, {
      ...draft,
      title,
      assigneeIds,
      description: draft.description.trim(),
      dueAt: draft.dueAt ? new Date(draft.dueAt).toISOString() : '',
    });
  }
  observeTask(id: Signal<string>) {
    return new ReadStore(computed(() => this.loadTask(id())));
  }
  private loadTask(id: string) {
    return this.repository.loadTaskCollaboration(id);
  }
  addComment(id: string, text: string, parentId: string | null): void {
    const value = text.trim();
    if (!value || value.length > 5000)
      throw new Error('Escreva um comentário de até 5.000 caracteres.');
    this.repository.addTaskComment(id, value, parentId);
  }
  addAttachments(id: string, files: readonly File[]): void {
    if (!files.length) return;
    if (!this.repository.loadTaskCollaboration(id)) throw new Error('Tarefa não encontrada.');
    for (const file of files) {
      if (!attachmentType(file.name, file.type))
        throw new Error(`O formato de “${file.name}” não é aceito.`);
      if (!file.size || file.size > MAX_ATTACHMENT_SIZE)
        throw new Error('Escolha arquivos não vazios de até 20 MB cada.');
    }
    const attachments: RequestAttachment[] = [];
    try {
      for (const file of files) {
        const type = attachmentType(file.name, file.type)!;
        const url = URL.createObjectURL(file.slice(0, file.size, type.mime));
        this.fileUrls.add(url);
        attachments.push({
          id: `attachment-${crypto.randomUUID()}`,
          name: file.name,
          kind: type.kind,
          mimeType: type.mime,
          size: file.size,
          url,
          taskId: id,
          author: this.team.actor.name,
          createdAt: new Date().toISOString(),
        });
      }
      this.repository.addTaskAttachments(id, attachments);
    } catch (error: unknown) {
      for (const attachment of attachments) {
        URL.revokeObjectURL(attachment.url);
        this.fileUrls.delete(attachment.url);
      }
      throw error;
    }
  }
  positionTask(id: string, target: KanbanMoveTarget, beforeId: string | null): void {
    this.repository.positionKanbanTask(id, target, beforeId);
  }
  createColumn(name: string): void {
    this.repository.createKanbanColumn(name);
    this.viewSettings.set({ mode: 'custom' });
  }
}
