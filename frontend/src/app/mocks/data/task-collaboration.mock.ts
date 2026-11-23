import type {
  RequestAttachment,
  RequestComment,
} from '../../features/requests/models/request-detail';

export const MOCK_TASK_COMMENTS: Readonly<Record<string, readonly RequestComment[]>> = {
  'task-organizar-visita': [
    {
      id: 'task-visit-comment-1',
      taskId: 'task-organizar-visita',
      parentId: null,
      author: 'Rafael Souza',
      createdAt: '2026-11-18T09:00:00-03:00',
      text: '@ana.martins podemos incluir a Praça da Vila Nova no roteiro? /solicitacoes/request-praca-acessivel',
    },
    {
      id: 'task-visit-comment-2',
      taskId: 'task-organizar-visita',
      parentId: 'task-visit-comment-1',
      author: 'Ana Martins',
      createdAt: '2026-11-18T09:15:00-03:00',
      text: 'Sim, vou confirmar o melhor horário com a equipe.',
    },
    {
      id: 'task-visit-comment-3',
      taskId: 'task-organizar-visita',
      parentId: 'task-visit-comment-2',
      author: 'Camila Oliveira',
      createdAt: '2026-11-18T09:30:00-03:00',
      text: '153/2026',
    },
  ],
};
export const MOCK_TASK_ATTACHMENTS: Readonly<Record<string, readonly RequestAttachment[]>> = {
  'task-organizar-visita': [
    {
      id: 'task-visit-photo',
      taskId: 'task-organizar-visita',
      name: 'Local da visita.jpg',
      kind: 'photo',
      mimeType: 'image/jpeg',
      size: null,
      author: 'Ana Martins',
      createdAt: '2026-11-18T08:00:00-03:00',
      url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=75',
    },
    {
      id: 'task-visit-document',
      taskId: 'task-organizar-visita',
      name: 'Roteiro da visita.pdf',
      kind: 'document',
      mimeType: 'application/pdf',
      size: null,
      author: 'Ana Martins',
      createdAt: '2026-11-18T08:10:00-03:00',
      url: 'request-examples/relato-da-solicitacao.pdf',
    },
  ],
};
