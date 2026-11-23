import type { CitizenInteraction, CitizenRequest } from '../../citizens/models/citizen-detail';
import type { TimelineEntry } from '../../activities/models/timeline-entry';
import type { RequestExtras } from './request-detail';

export function requestTimeline(
  request: CitizenRequest,
  extras: RequestExtras,
  interactions: readonly CitizenInteraction[],
): readonly TimelineEntry[] {
  const common = {
    department: request.department,
    protocol: request.protocol,
    requestId: request.id,
    route: ['/solicitacoes', request.id] as const,
  };
  const opening: TimelineEntry = {
    ...common,
    id: request.id,
    type: 'request',
    title: request.title,
    description: request.description,
    author: request.createdBy,
    occurredAt: request.createdAt,
    direction: request.direction,
  };
  return [
    opening,
    ...extras.attachments.map((attachment): TimelineEntry => ({
      ...common,
      id: `${attachment.id}-created`,
      type: 'attachment',
      title: `Anexo adicionado: ${attachment.name}`,
      description:
        attachment.kind === 'photo'
          ? 'Foto vinculada à solicitação.'
          : attachment.kind === 'audio'
            ? 'Áudio vinculado à solicitação.'
            : 'Documento vinculado à solicitação.',
      author: attachment.author,
      occurredAt: attachment.createdAt,
      fragment: attachment.taskId ?? 'request-attachments',
      contextLabel: attachment.taskId
        ? `Tarefa: ${extras.tasks.find((task) => task.id === attachment.taskId)?.title ?? ''}`
        : `Solicitação #${request.protocol}`,
    })),
    ...interactions.filter((item) => item.requestId === request.id),
    ...request.history
      .filter(
        (entry) =>
          !entry.sourceInteractionId ||
          !interactions.some((item) => item.id === entry.sourceInteractionId),
      )
      .map((entry): TimelineEntry => ({
        ...common,
        ...entry,
        id: `${request.id}-${entry.id}`,
        type: 'request-update',
        author: entry.author,
        contextLabel: `Solicitação #${request.protocol}`,
      })),
    ...extras.tasks.flatMap((task): TimelineEntry[] => {
      const context = {
        ...common,
        fragment: task.id,
        author: task.createdBy,
        contextLabel: `Tarefa: ${task.title}`,
      };
      return [
        {
          ...context,
          id: `${task.id}-created`,
          type: 'task',
          title: `Tarefa criada: ${task.title}`,
          description: task.description,
          occurredAt: task.createdAt,
        },
      ];
    }),
    ...extras.comments.map((comment): TimelineEntry => {
      const task = extras.tasks.find((item) => item.id === comment.taskId);
      const parent = extras.comments.find((item) => item.id === comment.parentId);
      return {
        ...common,
        id: comment.id,
        commentId: comment.id,
        type: 'comment',
        title: comment.parentId
          ? `Resposta a ${parent?.author ?? 'comentário'}`
          : task
            ? `Comentário na tarefa: ${task.title}`
            : 'Comentário na solicitação',
        description: comment.text,
        author: comment.author,
        occurredAt: comment.createdAt,
        fragment: task?.id ?? 'request-timeline',
        contextLabel: task ? `Tarefa: ${task.title}` : `Solicitação #${request.protocol}`,
      };
    }),
    ...extras.changes.map((change): TimelineEntry => ({
      ...common,
      ...change,
      type: change.type ?? 'request-update',
      fragment: change.taskId,
      contextLabel: change.taskId
        ? `Tarefa: ${extras.tasks.find((task) => task.id === change.taskId)?.title ?? ''}`
        : `Solicitação #${request.protocol}`,
    })),
  ].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}
