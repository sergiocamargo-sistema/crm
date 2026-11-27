import { createHash, randomUUID } from 'node:crypto';
import type {
  ApiInvocation,
  BackendOperation,
  ApiResult,
} from '../../../src/app/domain/contracts/backend-api';
import { createCrmEngine } from '../../../src/app/domain/crm-engine';
import { LabelPrintEngine } from '../../../src/app/domain/label-print';
import { referralBranch } from '../../../src/app/domain/referral-tree';
import {
  userMentionPattern,
  type MentionNotification,
} from '../../../src/app/core/models/collaboration';
import type { TeamContext } from '../../../src/app/domain/team-context';
import {
  labelFormatError,
  labelTemplateError,
} from '../../../src/app/features/labels/models/label-layout';
import type { DocumentDatabase } from '../ports/document-database';
import { validateAccess, type MemberAccess, type RequestContext } from './access';
import { WorkspaceRepository } from './workspace-repository';
import { ApplicationError, RevisionConflict } from './error';
import { SearchCache, matchesSearch } from './search-cache';
import { attachmentType } from '../../../src/app/features/requests/models/attachment-files';
import type { FilesService } from './files';
import { appendAudit, auditEntry, requirePermission, operationPermission } from './security';

export const isQuery = (operation: BackendOperation): boolean =>
  /^(load|list|prepare|search|sync)/u.test(operation);
export class Dispatcher {
  private readonly workspaces: WorkspaceRepository;
  private readonly search: SearchCache;
  constructor(
    private readonly database: DocumentDatabase,
    private readonly files: FilesService,
  ) {
    this.workspaces = new WorkspaceRepository(database);
    this.search = new SearchCache(database);
  }

  async execute(context: RequestContext, invocation: ApiInvocation): Promise<ApiResult<unknown>> {
    const { operation, args, requestId } = invocation;
    requirePermission(context.member, operationPermission(operation));
    if (operation === 'prepareLabelRecipients' && args[0].length > 200)
      throw new ApplicationError(
        413,
        'BATCH_TOO_LARGE',
        'Prepare no máximo 200 etiquetas por lote.',
      );
    if (!/^[a-zA-Z0-9_-]{8,160}$/u.test(requestId))
      throw new ApplicationError(400, 'INVALID_REQUEST_ID', 'Identificação de operação inválida.');
    validateBusinessInput(args);
    if (operation === 'loadWorkspaceVersion')
      return {
        result: (await this.database.get('crmMeta', 'head')) ?? {
          epoch: 'uninitialized',
          revision: 0,
        },
        revision: 0,
      };
    if (operation === 'loadTeam')
      return { result: { actor: context.actor, users: context.users }, revision: 0 };
    if (operation === 'loadHomeMessage') return { result: '', revision: 0 };
    if (operation === 'loadNotifications') {
      const items = await this.database.find<MentionNotification>('crmNotifications', {
        filters: [{ field: 'recipientId', operator: 'equals', value: context.actor.id }],
      });
      return {
        result: items
          .map(({ value }) => value)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        revision: 0,
      };
    }
    if (operation === 'markNotificationRead' || operation === 'markAllNotificationsRead') {
      let remaining: boolean;
      do {
        remaining = await this.database.atomic(async (transaction) => {
          const member = await transaction.get<MemberAccess>('teamAccess', context.identity.id);
          validateAccess(context.identity, member);
          requirePermission(member!, operationPermission(operation));
          const items =
            operation === 'markNotificationRead'
              ? [
                  {
                    id: args[0],
                    value: await transaction.get<MentionNotification>('crmNotifications', args[0]),
                  },
                ]
              : await transaction.find<MentionNotification>('crmNotifications', {
                  filters: [
                    { field: 'recipientId', operator: 'equals', value: context.actor.id },
                    { field: 'readAt', operator: 'equals', value: null },
                  ],
                  limit: 200,
                });
          let changed = 0;
          for (const { id, value } of items)
            if (value?.recipientId === context.actor.id && !value.readAt) {
              changed++;
              transaction.put('crmNotifications', id, {
                ...value,
                readAt: new Date().toISOString(),
              });
            }
          if (changed)
            appendAudit(
              transaction,
              auditEntry(context, operation, 'committed', { count: changed }),
            );
          return operation === 'markAllNotificationsRead' && items.length === 200;
        });
      } while (remaining);
      return { result: null, revision: 0 };
    }
    const fingerprint = createHash('sha256')
      .update(JSON.stringify({ operation, args }))
      .digest('hex');
    if (!isQuery(operation)) {
      const previous = await this.workspaces.receipt(context, requestId, fingerprint);
      if (previous) return { ...previous, result: await this.files.hydrate(previous.result) };
    }
    const fileLinks = isQuery(operation) ? [] : await this.files.authorizeReferences(context, args);
    for (let attempt = 0; attempt < 4; attempt++) {
      const snapshot = await this.workspaces.load();
      if (operation === 'searchCitizens') {
        const index = await this.searchProjection(snapshot);
        return {
          result: index
            .filter((person) => matchesSearch(person.searchText, args[0]))
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
            .slice(0, Math.min(100, Math.max(1, args[1])))
            .map(({ searchText: _text, ...person }) => person),
          revision: snapshot.revision,
        };
      }
      if (operation === 'syncCitizenSearch')
        return { result: await this.search.sync(snapshot, ...args), revision: snapshot.revision };
      const state = structuredClone(snapshot.state);
      const notifications: MentionNotification[] = [];
      const team: TeamContext = {
        actor: context.actor,
        users: context.users,
        validateAssignees: (ids) => {
          const unique = [...new Set(ids)];
          if (!unique.length || unique.some((id) => !context.users.some((user) => user.id === id)))
            throw new Error('Selecione pelo menos um responsável da equipe.');
          return unique;
        },
        notifyMentions: (previousText, text, record) => {
          const handles = (value: string): Set<string> =>
            new Set(
              [
                ...value
                  .replace(
                    /https?:\/\/\S+|\/(?:municipes|solicitacoes|interacoes|conversas|agendamentos)\/\S+|\/kanban\?\S+/giu,
                    ' ',
                  )
                  .matchAll(userMentionPattern()),
              ].map((match) => match[1]!.toLowerCase()),
            );
          const old = handles(previousText);
          const current = handles(text);
          context.users
            .filter((user) => current.has(user.handle) && !old.has(user.handle))
            .forEach((user) =>
              notifications.push({
                id: randomUUID(),
                recipientId: user.id,
                actor: context.actor.name,
                taskId: record.taskId,
                taskTitle: record.taskTitle,
                commentId: record.commentId ?? null,
                createdAt: new Date().toISOString(),
                readAt: null,
              }),
            );
        },
      };
      const engine = createCrmEngine(state.crm, team);
      if (
        operation === 'addCategory' &&
        !(await engine.loadCitizenCategories()).includes(args[1])
      ) {
        requirePermission(context.member, 'catalogs.manage');
        context = { ...context, additionalPermissions: ['catalogs.manage'] };
      }
      const labels = new LabelPrintEngine(state.labels);
      let result: unknown;
      try {
        if (operation === 'loadLabelConfiguration') result = labels.loadConfiguration();
        else if (operation === 'saveLabelTemplate') {
          const error = labelTemplateError(args[0]);
          if (error) throw new Error(error);
          result = labels.saveTemplate(...args);
        } else if (operation === 'saveLabelFormat') {
          const error = labelFormatError(args[0]);
          if (error) throw new Error(error);
          result = labels.saveFormat(...args);
        } else if (operation === 'loadReferralBranch')
          result = referralBranch(state.crm.citizens, state.crm.profileEdits, args[0]);
        else {
          // A união ApiInvocation validada por JSON Schema é a lista fechada das operações públicas.
          const handler = (
            engine as unknown as Record<string, (...parameters: readonly unknown[]) => unknown>
          )[operation];
          if (typeof handler !== 'function')
            throw new ApplicationError(404, 'UNKNOWN_OPERATION', 'Operação não disponível.');
          const parameters: unknown[] = [...args];
          if (operation === 'addTaskAttachments' || operation === 'addRequestAttachments') {
            parameters[1] = args[1].map((attachment) => {
              if (!/^crm-file:\/\/[a-f0-9-]{36}$/u.test(attachment.url))
                throw new Error('Envie o arquivo antes de anexar.');
              const file = fileLinks.find(({ id }) => id === attachment.url.slice(11))?.metadata;
              if (!file) throw new Error('Arquivo não encontrado.');
              return {
                ...attachment,
                id: `attachment-${randomUUID()}`,
                name: file.name,
                mimeType: file.mimeType,
                size: file.size,
                kind: attachmentType(file.name, file.mimeType)!.kind,
                author: context.actor.name,
                createdAt: new Date().toISOString(),
              };
            });
          }
          result = await handler.apply(engine, parameters);
        }
      } catch (error) {
        if (error instanceof ApplicationError) throw error;
        throw new ApplicationError(
          422,
          'INVALID_OPERATION',
          error instanceof Error ? error.message : 'Não foi possível concluir a operação.',
        );
      }
      if (isQuery(operation)) {
        return { result: await this.files.hydrate(result ?? null), revision: snapshot.revision };
      }
      try {
        const nextState = { crm: engine.snapshot(), labels: labels.snapshot() };
        const linkedIds = fileLinks.length ? this.files.references(nextState) : new Set<string>();
        const committed = await this.workspaces.commit(
          context,
          snapshot,
          nextState,
          requestId,
          fingerprint,
          result,
          notifications,
          fileLinks.filter(({ id }) => linkedIds.has(id)),
        );
        return { ...committed, result: await this.files.hydrate(committed.result) };
      } catch (error) {
        if (!(error instanceof RevisionConflict) || attempt === 3) throw error;
      }
    }
    throw new RevisionConflict();
  }
  private async searchProjection(snapshot: import('./workspace-repository').WorkspaceSnapshot) {
    let page: string | null = null;
    const records: import('../../../src/app/domain/contracts/backend-api').SearchCachePage['records'][number][] =
      [];
    do {
      const result = await this.search.sync(snapshot, null, 0, page);
      records.push(...result.records);
      page = result.nextPage;
    } while (page);
    return records;
  }
}

function validateBusinessInput(value: unknown, key = '', depth = 0): void {
  if (depth > 30)
    throw new ApplicationError(400, 'INVALID_INPUT', 'O conteúdo informado é profundo demais.');
  if (typeof value === 'string') {
    const limit =
      key === 'name'
        ? 200
        : key === 'title'
          ? 120
          : ['text', 'description', 'observations'].includes(key)
            ? 5000
            : 20_000;
    if (value.length > limit)
      throw new ApplicationError(
        400,
        'INVALID_INPUT',
        `O campo ${key || 'texto'} excede o limite permitido.`,
      );
    if (['title', 'name'].includes(key) && !value.trim())
      throw new ApplicationError(400, 'INVALID_INPUT', 'Informe o nome ou título.');
    if (['occurredAt', 'createdAt'].includes(key) && !Number.isFinite(Date.parse(value)))
      throw new ApplicationError(400, 'INVALID_DATE', 'Informe uma data válida.');
  } else if (Array.isArray(value)) {
    if (value.length > 10_000)
      throw new ApplicationError(413, 'TOO_MANY_ITEMS', 'Divida esta operação em lotes menores.');
    value.forEach((item) => validateBusinessInput(item, key, depth + 1));
  } else if (value && typeof value === 'object')
    for (const [field, item] of Object.entries(value))
      validateBusinessInput(item, field, depth + 1);
}
