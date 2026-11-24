import { ReadStore } from '../../../core/stores/read-store';
import { computed, type Signal, inject, Service } from '@angular/core';
import type { VoteEstimate } from '../../../core/models/vote-estimate';
import { CITIZEN_DETAIL_REPOSITORY } from '../repositories/citizen-detail-repository';
import type {
  CitizenDetail,
  NewCitizenInteraction,
  NewConversationInteraction,
  TimelineFilters,
} from '../models/citizen-detail';
import { INTERACTION_CHANNELS } from '../models/citizen-detail';
import type { TimelineEntry } from '../../activities/models/timeline-entry';

const calendarDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const interactionCalendarDate = (occurredAt: string): string =>
  calendarDateFormatter.format(new Date(occurredAt));

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

@Service()
export class CitizenDetailService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);

  observeCitizen(id: Signal<string>) {
    return new ReadStore(computed(() => this.loadDetail(id())));
  }
  observeTimeline(id: Signal<string>) {
    return new ReadStore(computed(() => this.loadTimeline(id())));
  }

  loadDetail(citizenId: string): CitizenDetail | null {
    return this.repository.loadDetail(citizenId);
  }
  loadTimeline(citizenId: string): readonly TimelineEntry[] {
    return this.repository.loadCitizenTimeline(citizenId);
  }

  saveObservations(citizenId: string, text: string): void {
    if (text.length > 5000) throw new Error('A observação deve ter até 5.000 caracteres.');
    this.repository.saveObservations(citizenId, text.trim());
  }

  saveVoteEstimate(citizenId: string, estimate: VoteEstimate | null): void {
    this.repository.saveVoteEstimate(citizenId, estimate);
  }

  registerInteraction(citizenId: string, interaction: NewConversationInteraction): void {
    const channel = INTERACTION_CHANNELS.find((item) => item.value === interaction.channel);
    if (!channel) throw new Error('Selecione o tipo de interação.');
    const description = interaction.description.trim();
    if (!description || description.length > 1500)
      throw new Error('Descreva o que foi conversado em até 1.500 caracteres.');
    this.registerContact(citizenId, {
      type: 'conversation',
      channel: channel.value,
      description,
      title: channel.label,
      occurredAt: new Date().toISOString(),
      direction: 'active',
      department: 'Gabinete',
    });
  }

  registerContact(citizenId: string, contact: NewCitizenInteraction): void {
    const request = contact.requestId
      ? this.repository
          .loadDetail(citizenId)
          ?.requests.find((item) => item.id === contact.requestId)
      : null;
    if (contact.requestId && !request)
      throw new Error('A solicitação não pertence a este munícipe.');
    const title = contact.title.trim();
    const description = contact.description.trim();
    if (!title || !description || !Number.isFinite(Date.parse(contact.occurredAt))) {
      throw new Error('Preencha título, descrição e data do contato.');
    }
    const occurredAt = new Date(contact.occurredAt).toISOString();
    if (contact.type === 'request') {
      this.repository.createRequest(citizenId, {
        title,
        description,
        occurredAt,
        department: contact.department,
        departmentId: contact.departmentId,
        direction: contact.direction,
      });
      return;
    }
    this.repository.registerContact(citizenId, {
      ...contact,
      ...(request
        ? { protocol: request.protocol, department: request.department || contact.department }
        : {}),
      title,
      description,
      occurredAt,
    });
  }

  filterTimeline(
    interactions: readonly TimelineEntry[],
    filters: TimelineFilters,
  ): readonly TimelineEntry[] {
    const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
    return interactions
      .filter((interaction) => {
        const date = interactionCalendarDate(interaction.occurredAt);
        const text = normalize(
          `${interaction.title} ${interaction.description} ${interaction.department} ${interaction.author} ${interaction.protocol ?? ''} ${interaction.contextLabel ?? ''}`,
        );
        return (
          (!filters.from || date >= filters.from) &&
          (!filters.to || date <= filters.to) &&
          (!filters.department || interaction.department === filters.department) &&
          (!filters.type || interaction.type === filters.type) &&
          terms.every((term) => text.includes(term))
        );
      })
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  }
}
