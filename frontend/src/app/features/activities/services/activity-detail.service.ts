import { RemoteReadStore } from '../../../core/stores/read-store';
import { computed, type Signal, inject, Service } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import {
  INTERACTION_CHANNELS,
  INTERACTION_TYPES,
  type CitizenConversationMessage,
} from '../../citizens/models/citizen-detail';
import { interactionDetailRoute, type ActivityKind } from '../models/activity-detail';
import type { CitizenSummary } from '../../../core/models/citizen-summary';
import type { IconName } from '../../../shared/components/icon/icon.component';

export const ACTIVITY_LABELS = {
  interaction: {
    label: 'Interação',
    icon: 'history',
    contentLabel: 'Relato da interação',
    notFound: 'Interação não encontrada',
  },
  request: {
    label: 'Solicitação',
    icon: 'clipboard',
    contentLabel: 'Descrição da solicitação',
    notFound: 'Solicitação não encontrada',
  },
  conversation: {
    label: 'Conversa',
    icon: 'message',
    contentLabel: 'Resumo da conversa',
    notFound: 'Conversa não encontrada',
  },
  appointment: {
    label: 'Agendamento',
    icon: 'calendar',
    contentLabel: 'Sobre o agendamento',
    notFound: 'Agendamento não encontrado',
  },
} as const satisfies Record<
  ActivityKind,
  { label: string; icon: IconName; contentLabel: string; notFound: string }
>;

interface ActivityDetailView {
  readonly id: string;
  readonly kind: ActivityKind;
  readonly title: string;
  readonly description: string;
  readonly citizen: CitizenSummary | null;
  readonly label: string;
  readonly icon: IconName;
  readonly contentLabel: string;
  readonly date: string;
  readonly dateLabel: string;
  readonly status: {
    readonly label: string;
    readonly tone: 'danger' | 'success' | 'warning' | 'neutral';
  } | null;
  readonly fields: readonly { readonly label: string; readonly value: string }[];
  readonly history: readonly {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly occurredAt: string;
  }[];
  readonly messages: readonly CitizenConversationMessage[];
  readonly related: readonly {
    readonly id: string;
    readonly title: string;
    readonly route: readonly [string, string];
  }[];
  readonly participants: readonly string[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});
const formatDate = (date: string): string => dateFormatter.format(new Date(date));

@Service()
export class ActivityDetailService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);

  observeActivity(kind: Signal<ActivityKind>, id: Signal<string>) {
    return new RemoteReadStore(
      () => this.loadDetail(kind(), id()),
      null,
      () => [kind(), id()],
    );
  }

  async loadDetail(kind: ActivityKind, id: string): Promise<ActivityDetailView | null> {
    const detail = await this.repository.loadActivityDetail(kind, id);
    if (!detail) return null;
    const common = {
      ...ACTIVITY_LABELS[kind],
      kind,
      id: detail.record.id,
      title: detail.record.title,
      description: detail.record.description,
      citizen: detail.citizen,
      history: [],
      messages: [],
      related: [],
      participants: [],
    };
    switch (detail.kind) {
      case 'interaction':
      case 'conversation': {
        const record = detail.record;
        const channel = INTERACTION_CHANNELS.find((item) => item.value === record.channel);
        const type = INTERACTION_TYPES.find((item) => item.value === record.type)!;
        return {
          ...common,
          date: record.occurredAt,
          dateLabel: formatDate(record.occurredAt),
          status:
            detail.kind === 'conversation'
              ? {
                  label: detail.status === 'open' ? 'Em andamento' : 'Encerrada',
                  tone: detail.status === 'open' ? 'warning' : 'success',
                }
              : null,
          messages: detail.kind === 'conversation' ? detail.messages : [],
          fields: [
            { label: 'Tipo', value: type.label },
            {
              label: 'Canal',
              value:
                channel?.label ??
                (record.type === 'call'
                  ? 'Telefone'
                  : record.type === 'announcement'
                    ? 'Não informado'
                    : 'Presencial'),
            },
            { label: 'Responsável', value: record.author },
            { label: 'Secretaria / setor', value: record.department },
            {
              label: 'Iniciativa',
              value:
                record.direction === 'active'
                  ? 'Gabinete iniciou o contato'
                  : detail.citizen
                    ? 'Munícipe iniciou o contato'
                    : 'Contato recebido',
            },
          ],
          related: detail.request
            ? [
                {
                  id: detail.request.id,
                  title: `#${detail.request.protocol} · ${detail.request.title}`,
                  route: ['/solicitacoes', detail.request.id],
                },
              ]
            : [],
        };
      }
      case 'request': {
        const record = detail.record;
        return {
          ...common,
          date: record.createdAt,
          dateLabel: `Aberta em ${formatDate(record.createdAt)}`,
          status: {
            label: record.status === 'pending' ? 'Pendente' : 'Finalizada',
            tone: record.status === 'pending' ? 'danger' : 'success',
          },
          fields: [
            { label: 'Protocolo', value: `#${record.protocol}` },
            { label: 'Secretaria / setor', value: record.department },
            { label: 'Prioridade', value: record.priority },
            { label: 'Prazo', value: record.dueAt ? formatDate(record.dueAt) : 'Sem prazo' },
          ],
          history: record.history,
          related: detail.interactions
            .map((item) => ({
              id: item.id,
              title: item.title,
              route: interactionDetailRoute(item),
            }))
            .filter((item) => item.route[0] !== '/solicitacoes'),
        };
      }
      case 'appointment': {
        const record = detail.record;
        const statuses = {
          scheduled: 'Agendado',
          confirmed: 'Confirmado',
          completed: 'Realizado',
          cancelled: 'Cancelado',
        } as const;
        return {
          ...common,
          date: record.startsAt,
          dateLabel: formatDate(record.startsAt),
          status: {
            label: statuses[record.status],
            tone:
              record.status === 'cancelled'
                ? 'danger'
                : record.status === 'scheduled'
                  ? 'warning'
                  : 'success',
          },
          fields: [
            { label: 'Início', value: formatDate(record.startsAt) },
            { label: 'Término', value: formatDate(record.endsAt) },
            { label: 'Local', value: record.location },
            { label: 'Responsável', value: record.responsible },
          ],
          participants: record.participants,
        };
      }
    }
  }
}
