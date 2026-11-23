import type { CustomKanbanColumn } from '../../features/kanban/models/kanban';

export const MOCK_KANBAN_COLUMNS: readonly CustomKanbanColumn[] = [
  { id: 'column-planejamento', name: 'Planejamento' },
  { id: 'column-expediente', name: 'Expediente do gabinete' },
  { id: 'column-acompanhamento', name: 'Acompanhamento externo' },
];
