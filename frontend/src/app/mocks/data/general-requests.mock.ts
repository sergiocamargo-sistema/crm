import type { CitizenRequest } from '../../features/citizens/models/citizen-detail';
import type { RequestExtras } from '../../features/requests/models/request-detail';
import { MOCK_CITIZENS } from './citizens.mock';

const awareness = ['cid-joao', 'cid-luciana'].map((citizenId) => ({
  id: `request-praca-acessivel-awareness-${citizenId}`,
  citizenId,
  author: 'Ana Martins',
  createdAt: '2026-11-18T09:15:00-03:00',
}));

// Demanda identificada pelo gabinete, sem munícipe solicitante.
export const MOCK_GENERAL_REQUEST: CitizenRequest = {
  id: 'request-praca-acessivel',
  createdBy: 'Ana Martins',
  title: 'Adequação de acessibilidade na Praça da Vila Nova',
  protocol: '2026-0153',
  status: 'pending',
  description:
    'Durante uma visita à Praça da Vila Nova, a equipe do gabinete identificou barreiras nas entradas e nas áreas de circulação. Solicita-se vistoria para instalação de rampas e adequação das calçadas, garantindo acesso aos espaços de convivência.',
  department: 'Secretaria de Obras',
  createdAt: '2026-11-18T09:00:00-03:00',
  dueAt: '2026-12-02T18:00:00-03:00',
  priority: 'Normal',
  history: [],
};

export const MOCK_GENERAL_REQUEST_EXTRAS: RequestExtras = {
  departmentId: 'dept-obras',
  patternId: null,
  awareness,
  attachments: [],
  tasks: [
    {
      id: `${MOCK_GENERAL_REQUEST.id}-task-01`,
      title: 'Solicitar vistoria de acessibilidade',
      description:
        'Encaminhar à Secretaria de Obras os pontos de acesso que precisam de adequação.',
      assigneeIds: ['user-ana', 'user-camila'],
      labelIds: ['task-label-visita'],
      createdBy: 'Ana Martins',
      dueAt: '2026-11-20T18:00:00-03:00',
      createdAt: '2026-11-18T09:05:00-03:00',
      completedAt: null,
      status: 'in-progress',
      priority: 'normal',
      customColumnId: 'column-acompanhamento',
    },
  ],
  comments: [],
  changes: awareness.map((link) => ({
    author: link.author,
    id: `${link.id}-created`,
    title: 'Munícipe vinculado para ciência',
    description: MOCK_CITIZENS.find((citizen) => citizen.id === link.citizenId)!.name,
    occurredAt: link.createdAt,
  })),
};
