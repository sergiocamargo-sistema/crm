import type { CitizenSummary } from '../../../core/models/citizen-summary';
import type { VoteEstimate } from '../../../core/models/vote-estimate';
import type { IconName } from '../../../core/models/icon-paths';

export const INTERACTION_TYPES = [
  { value: 'request', label: 'Solicitação', icon: 'clipboard' },
  { value: 'conversation', label: 'Conversa', icon: 'message' },
  { value: 'attendance', label: 'Atendimento', icon: 'user' },
  { value: 'office-visit', label: 'Visita ao gabinete', icon: 'building' },
  { value: 'meeting', label: 'Encontro pessoalmente', icon: 'users' },
  { value: 'announcement', label: 'Comunicado', icon: 'bell' },
  { value: 'call', label: 'Ligação', icon: 'phone' },
] as const satisfies readonly { value: string; label: string; icon: IconName }[];

export type InteractionType = (typeof INTERACTION_TYPES)[number]['value'];

export const INTERACTION_CHANNELS = [
  { value: 'in-person', label: 'Conversa pessoalmente', icon: 'users' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'phone', label: 'Telefone', icon: 'phone' },
  { value: 'email', label: 'E-mail', icon: 'mail' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'other', label: 'Outros', icon: 'more' },
] as const satisfies readonly { value: string; label: string; icon: IconName }[];

export type InteractionChannel = (typeof INTERACTION_CHANNELS)[number]['value'];

export interface NewConversationInteraction {
  readonly channel: InteractionChannel;
  readonly description: string;
}

export interface CitizenInteraction {
  readonly departmentId?: string;
  readonly id: string;
  readonly type: InteractionType;
  readonly direction: 'active' | 'passive';
  readonly occurredAt: string;
  readonly title: string;
  readonly description: string;
  readonly department: string;
  readonly author: string;
  readonly protocol?: string;
  readonly channel?: InteractionChannel;
  readonly requestId?: string;
  readonly conversation?: {
    readonly status: 'open' | 'closed';
    readonly messages: readonly CitizenConversationMessage[];
  };
}

export interface CitizenConversationMessage {
  readonly id: string;
  readonly text: string;
  readonly sentAt: string;
  readonly direction: 'incoming' | 'outgoing';
  readonly author: string;
}

export interface CitizenPhoto {
  readonly fileReference?: string;
  readonly src: string;
  readonly label: string;
}

export interface CitizenPhone {
  readonly number: string;
  readonly label: string;
  readonly callUrl: string;
  readonly whatsappUrl?: string;
}

export interface CitizenRequestSummary {
  readonly id: string;
  readonly title: string;
  readonly status: 'pending' | 'completed';
}

export interface CitizenAppointmentSummary {
  readonly id: string;
  readonly title: string;
  readonly startsAt: string;
}

export interface NewCitizenRequest {
  readonly patternId?: string | null;
  readonly dueAt?: string;
  readonly priority?: string;
  readonly status?: CitizenRequestSummary['status'];
  readonly departmentId?: string;
  readonly title: string;
  readonly description: string;
  readonly department: string;
  readonly occurredAt: string;
  readonly direction: CitizenInteraction['direction'];
}

export interface CitizenRequest extends CitizenRequestSummary {
  readonly createdBy: string;
  readonly direction?: CitizenInteraction['direction'];
  readonly protocol: string;
  readonly description: string;
  readonly department: string;
  readonly createdAt: string;
  readonly dueAt: string;
  readonly priority: string;
  readonly history: readonly {
    readonly author: string;
    readonly sourceInteractionId?: string;
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly occurredAt: string;
  }[];
}

export interface CitizenAppointment extends CitizenAppointmentSummary {
  readonly endsAt: string;
  readonly description: string;
  readonly location: string;
  readonly responsible: string;
  readonly status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  readonly participants: readonly string[];
}

export interface NewCitizenInteraction {
  readonly departmentId?: string;
  readonly requestId?: string;
  readonly type: InteractionType;
  readonly direction: CitizenInteraction['direction'];
  readonly occurredAt: string;
  readonly title: string;
  readonly description: string;
  readonly department: string;
  readonly channel?: InteractionChannel;
}

export interface CitizenDetail extends CitizenSummary {
  readonly addresses?: readonly {
    readonly street: string;
    readonly number?: string;
    readonly complement: string;
    readonly neighborhood: string;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
    readonly reference: string;
  }[];
  readonly documents?: readonly {
    readonly type: string;
    readonly value: string;
    readonly issuer: string;
  }[];
  readonly referrerId?: string;
  readonly voteEstimate: VoteEstimate | null;
  readonly creationReview?: {
    readonly reason: string;
    readonly candidateIds: readonly string[];
    readonly author: string;
    readonly at: string;
  };
  readonly birthDate: string | null;
  readonly cra: string | null;
  readonly observations: string;
  readonly categories: readonly string[];
  readonly phones: readonly CitizenPhone[];
  readonly emails: readonly { readonly address: string; readonly label: string }[];
  readonly socialLinks: readonly {
    readonly label: string;
    readonly url: string;
    readonly icon: IconName;
  }[];
  readonly address: {
    readonly street: string;
    readonly complement: string;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
    readonly reference: string;
  };
  readonly personalData: readonly { readonly label: string; readonly value: string }[];
  readonly photos: readonly CitizenPhoto[];
  readonly interactions: readonly CitizenInteraction[];
  readonly requests: readonly CitizenRequest[];
  readonly appointments: readonly CitizenAppointment[];
  readonly registeredAt: string;
  readonly responsible: string;
}

export interface TimelineFilters {
  readonly from: string;
  readonly to: string;
  readonly department: string;
  readonly type: string;
  readonly query: string;
}
