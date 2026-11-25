import { FILES_REPOSITORY } from '../../../core/repositories/files.repository';
import { RemoteReadStore } from '../../../core/stores/read-store';
import { computed, type Signal, DestroyRef, inject, Service } from '@angular/core';
import { TeamCollaborationService } from '../../../core/services/team-collaboration.service';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import type {
  NewRequestComment,
  NewRequestTask,
  RequestAttachment,
} from '../models/request-detail';
import { attachmentType, MAX_ATTACHMENT_SIZE } from '../models/attachment-files';
import {
  INTERACTION_CHANNELS,
  INTERACTION_TYPES,
  type NewCitizenInteraction,
  type NewConversationInteraction,
} from '../../citizens/models/citizen-detail';

@Service()
export class RequestDetailService {
  private readonly team = inject(TeamCollaborationService);
  get currentUserId(): string {
    return this.team.actor.id;
  }
  private readonly files = inject(FILES_REPOSITORY);
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly fileUrls = new Set<string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.fileUrls.forEach((url) => URL.revokeObjectURL(url)));
  }

  async addAttachments(id: string, files: readonly File[]): Promise<void> {
    if (!files.length) return;
    if (!(await this.repository.loadRequestWorkspace(id)))
      throw new Error('Solicitação não encontrada.');
    for (const file of files) {
      if (!attachmentType(file.name, file.type))
        throw new Error(
          `O formato de “${file.name}” não é aceito. Escolha uma foto, áudio, PDF ou documento de texto, planilha ou apresentação.`,
        );
      if (file.size > MAX_ATTACHMENT_SIZE)
        throw new Error(`“${file.name}” excede o limite de 20 MB por arquivo.`);
      if (!file.size) throw new Error(`“${file.name}” está vazio.`);
    }
    const attachments: RequestAttachment[] = [];
    try {
      for (const file of files) {
        const type = attachmentType(file.name, file.type)!;
        const attachmentId = `attachment-${crypto.randomUUID()}`;
        const url = await this.files.upload(file);

        attachments.push({
          id: attachmentId,
          name: file.name,
          kind: type.kind,
          mimeType: type.mime,
          size: file.size,
          url,
          author: this.team.actor.name,
          createdAt: new Date().toISOString(),
        });
      }
      await this.repository.addRequestAttachments(id, attachments);
    } catch (error: unknown) {
      for (const attachment of attachments) {
        URL.revokeObjectURL(attachment.url);
        this.fileUrls.delete(attachment.url);
      }
      throw error;
    }
  }
  observeRequest(id: Signal<string>) {
    return new RemoteReadStore(() => this.loadDetail(id()), null, id);
  }

  observeAutomationPlans(patternId: Signal<string | null | undefined>, requestId?: Signal<string>) {
    return new RemoteReadStore(
      () => {
        const pattern = patternId();
        return pattern === undefined
          ? []
          : this.repository.listRequestAutomationPlans(pattern, requestId?.());
      },
      [],
      () => [patternId(), requestId?.()],
    );
  }

  async startAutomation(id: string, ruleId: string): Promise<void> {
    await this.repository.startRequestAutomation(id, ruleId);
  }

  async loadDetail(id: string) {
    return await this.repository.loadRequestWorkspace(id);
  }
  async addAwareness(id: string, citizenId: string): Promise<void> {
    await this.repository.addRequestAwareness(id, citizenId);
  }
  async removeAwareness(id: string, awarenessId: string): Promise<void> {
    await this.repository.removeRequestAwareness(id, awarenessId);
  }
  async registerContact(id: string, contact: NewCitizenInteraction): Promise<void> {
    const title = contact.title.trim();
    const description = contact.description.trim();
    if (
      !INTERACTION_TYPES.some((type) => type.value === contact.type) ||
      !['active', 'passive'].includes(contact.direction) ||
      !title ||
      title.length > 100 ||
      !description ||
      description.length > 1500 ||
      !Number.isFinite(Date.parse(contact.occurredAt))
    )
      throw new Error('Preencha tipo, título, descrição e data do contato.');
    await this.repository.registerRequestContact(id, {
      ...contact,
      title,
      description,
      occurredAt: new Date(contact.occurredAt).toISOString(),
    });
  }
  async registerInteraction(id: string, interaction: NewConversationInteraction): Promise<void> {
    const channel = INTERACTION_CHANNELS.find((item) => item.value === interaction.channel);
    if (!channel) throw new Error('Selecione o tipo de interação.');
    await this.registerContact(id, {
      type: 'conversation',
      channel: channel.value,
      title: channel.label,
      description: interaction.description,
      direction: 'active',
      department: 'Gabinete',
      occurredAt: new Date().toISOString(),
    });
  }
  readonly catalog = {
    taskLabels: new RemoteReadStore(async () => await this.repository.listTaskLabels(), []).state,
    departments: new RemoteReadStore(async () => await this.departments(), []).state,
    patterns: new RemoteReadStore(async () => await this.repository.listRequestPatterns(), [])
      .state,
  };

  private async departments() {
    return [...(await this.repository.listDepartments())].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    );
  }
  async assignDepartment(id: string, departmentId: string): Promise<void> {
    await this.repository.assignRequestDepartment(id, departmentId);
  }
  async createDepartment(id: string, name: string): Promise<void> {
    const value = name.trim().replace(/\s+/g, ' ');
    if (!value || value.length > 80)
      throw new Error('Informe um departamento de até 80 caracteres.');
    await this.repository.createAndAssignDepartment(id, value);
  }
  async assignPattern(id: string, patternId: string): Promise<void> {
    await this.repository.assignRequestPattern(id, patternId || null);
  }
  async addComment(id: string, comment: NewRequestComment): Promise<void> {
    const text = comment.text.trim();
    if (!text || text.length > 5000)
      throw new Error('Escreva um comentário de até 5.000 caracteres.');
    await this.repository.addRequestComment(id, { ...comment, text });
  }
  async addTask(id: string, task: NewRequestTask): Promise<void> {
    const title = task.title.trim();
    const assigneeIds = this.team.validateAssignees(task.assigneeIds);
    if (!title || title.length > 120) throw new Error('Informe um título de até 120 caracteres.');
    if (!Number.isFinite(Date.parse(task.dueAt))) throw new Error('Informe um prazo válido.');
    if (task.description.length > 1500)
      throw new Error('Descreva a tarefa em até 1.500 caracteres.');
    await this.repository.addRequestTask(id, {
      ...task,
      title,
      assigneeIds,
      description: task.description.trim(),
      dueAt: new Date(task.dueAt).toISOString(),
    });
  }
  async completeTask(id: string, taskId: string, completed: boolean): Promise<void> {
    await this.repository.setRequestTaskCompleted(id, taskId, completed);
  }
}
