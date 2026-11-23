import type { CitizenSummary } from '../../../core/models/citizen-summary';
import type {
  CitizenAppointment,
  CitizenConversationMessage,
  CitizenInteraction,
  CitizenRequest,
} from '../../citizens/models/citizen-detail';
import type { TimelineEntry } from './timeline-entry';

export type ActivityKind = 'interaction' | 'request' | 'conversation' | 'appointment';

export type ActivityRecord =
  | {
      readonly kind: 'interaction';
      readonly citizen: CitizenSummary | null;
      readonly record: CitizenInteraction;
      readonly request: CitizenRequest | null;
    }
  | {
      readonly kind: 'conversation';
      readonly citizen: CitizenSummary | null;
      readonly record: CitizenInteraction;
      readonly messages: readonly CitizenConversationMessage[];
      readonly status: 'open' | 'closed';
      readonly request: CitizenRequest | null;
    }
  | {
      readonly kind: 'request';
      readonly citizen: CitizenSummary | null;
      readonly record: CitizenRequest;
      readonly interactions: readonly CitizenInteraction[];
    }
  | {
      readonly kind: 'appointment';
      readonly citizen: CitizenSummary;
      readonly record: CitizenAppointment;
    };

export function interactionDetailRoute(interaction: TimelineEntry): readonly [string, string] {
  if (interaction.route) return interaction.route;
  if (interaction.type === 'request' && interaction.requestId)
    return ['/solicitacoes', interaction.requestId];
  if (interaction.conversation) return ['/conversas', interaction.id];
  return ['/interacoes', interaction.id];
}
