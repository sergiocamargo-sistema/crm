import { INTERACTION_TYPES, type CitizenInteraction } from '../../citizens/models/citizen-detail';

export const TIMELINE_TYPES = [
  ...INTERACTION_TYPES,
  { value: 'task', label: 'Tarefa', icon: 'circleCheck' },
  { value: 'comment', label: 'Comentário', icon: 'note' },
  { value: 'attachment', label: 'Anexo', icon: 'attachment' },
  { value: 'request-update', label: 'Atualização da solicitação', icon: 'clipboard' },
] as const;

export interface TimelineEntry extends Omit<CitizenInteraction, 'type' | 'direction'> {
  readonly type: (typeof TIMELINE_TYPES)[number]['value'];
  readonly direction?: CitizenInteraction['direction'];
  readonly route?: readonly [string, string];
  readonly fragment?: string;
  readonly contextLabel?: string;
  readonly commentId?: string;
}
