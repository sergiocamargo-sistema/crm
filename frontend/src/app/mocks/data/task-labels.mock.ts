import type { TaskLabel } from '../../core/models/task-label';

export const MOCK_TASK_LABEL_DEFAULT_COLOR = '#064ea0';

export const MOCK_TASK_LABELS: readonly TaskLabel[] = [
  { id: 'task-label-retorno', name: 'Retorno ao munícipe', color: '#f4bf23' },
  { id: 'task-label-documentacao', name: 'Documentação', color: '#064ea0' },
  { id: 'task-label-visita', name: 'Visita', color: '#267848' },
];
