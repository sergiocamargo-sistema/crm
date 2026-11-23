import type { RequestExtras, RequestPattern } from '../../features/requests/models/request-detail';

export const MOCK_REQUEST_PATTERNS: readonly RequestPattern[] = [
  {
    id: 'pattern-iluminacao',
    name: 'Manutenção de iluminação',
    departmentId: 'sjc-manutencao-iluminacao',
  },
  { id: 'pattern-limpeza', name: 'Limpeza de praça', departmentId: 'sjc-manutencao-limpeza' },
  { id: 'pattern-poda', name: 'Poda de árvore', departmentId: 'dept-ambiente' },
  { id: 'pattern-buraco', name: 'Tapa-buraco', departmentId: 'dept-obras' },
];

export function initialRequestExtras(requestId: string, completed: boolean): RequestExtras {
  const taskId = `${requestId}-task-01`;
  return {
    awareness: [],
    attachments: [
      {
        id: `${requestId}-attachment-photo`,
        name: 'foto-do-local.jpg',
        kind: 'photo',
        mimeType: 'image/jpeg',
        size: null,
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=75',
        author: 'Ana Martins',
        createdAt: completed ? '2026-10-07T11:25:00-03:00' : '2026-11-13T14:45:00-03:00',
      },
      {
        id: `${requestId}-attachment-document`,
        name: 'relato-da-solicitacao.pdf',
        kind: 'document',
        mimeType: 'application/pdf',
        size: null,
        url: 'request-examples/relato-da-solicitacao.pdf',
        author: 'Ana Martins',
        createdAt: completed ? '2026-10-07T11:30:00-03:00' : '2026-11-13T14:50:00-03:00',
      },
    ],
    departmentId: completed ? 'sjc-manutencao-limpeza' : 'sjc-manutencao-iluminacao',
    patternId: completed ? 'pattern-limpeza' : 'pattern-iluminacao',
    tasks: completed
      ? []
      : [
          {
            id: taskId,
            title: 'Preparar e encaminhar o ofício',
            description: 'Conferir o endereço e encaminhar a demanda com o protocolo à secretaria.',
            assigneeIds: ['user-ana'],
            labelIds: ['task-label-documentacao'],
            createdBy: 'Ana Martins',
            dueAt: '2026-11-14T18:00:00-03:00',
            createdAt: '2026-11-13T15:00:00-03:00',
            completedAt: '2026-11-14T09:00:00-03:00',
            status: 'completed',
            priority: 'normal',
            customColumnId: 'column-expediente',
          },
          {
            id: `${requestId}-task-02`,
            title: 'Acompanhar a vistoria',
            description: 'Confirmar a previsão da equipe técnica e retornar ao munícipe.',
            assigneeIds: ['user-rafael', 'user-camila'],
            labelIds: ['task-label-visita', 'task-label-retorno'],
            createdBy: 'Rafael Souza',
            dueAt: '2026-11-25T18:00:00-03:00',
            createdAt: '2026-11-14T09:05:00-03:00',
            completedAt: null,
            status: 'waiting',
            priority: 'high',
            customColumnId: 'column-acompanhamento',
          },
        ],
    comments: completed
      ? [
          {
            id: `${requestId}-comment-01`,
            text: 'Conclusão confirmada com o munícipe. O local foi limpo.',
            author: 'Rafael Souza',
            createdAt: '2026-10-19T16:00:00-03:00',
            taskId: null,
            parentId: null,
          },
        ]
      : [
          {
            id: `${requestId}-comment-01`,
            text: 'O morador confirmou os dois pontos sem iluminação. Priorizar o retorno após a vistoria.',
            author: 'Ana Martins',
            createdAt: '2026-11-17T11:00:00-03:00',
            taskId: null,
            parentId: null,
          },
          {
            id: `${requestId}-comment-02`,
            text: 'Ofício encaminhado. A secretaria confirmou o recebimento do endereço e das referências.',
            author: 'Ana Martins',
            createdAt: '2026-11-14T09:10:00-03:00',
            taskId,
            parentId: null,
          },
          {
            id: `${requestId}-comment-03`,
            text: 'Vou acompanhar a resposta e combinar o retorno com o munícipe.',
            author: 'Rafael Souza',
            createdAt: '2026-11-14T09:20:00-03:00',
            taskId,
            parentId: `${requestId}-comment-02`,
          },
        ],
    changes: completed
      ? []
      : [
          {
            author: 'Ana Martins',
            id: `${taskId}-completed`,
            type: 'task',
            taskId,
            title: 'Tarefa concluída: Preparar e encaminhar o ofício',
            description: 'Ofício conferido e encaminhado à secretaria.',
            occurredAt: '2026-11-14T09:00:00-03:00',
          },
        ],
  };
}
