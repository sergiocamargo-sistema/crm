import { randomUUID, createHash } from 'node:crypto';
import type { DocumentDatabase } from '../ports/document-database';
import type { RequestContext, MemberAccess } from './access';
import { validateAccess } from './access';
import { ApplicationError, RevisionConflict } from './error';
import {
  decodeState,
  emptyWorkspace,
  encodeState,
  type StateRecord,
  type WorkspaceState,
} from './state-records';
import type { MentionNotification } from '../../../src/app/core/models/collaboration';

export interface WorkspaceVersion {
  readonly epoch: string;
  readonly revision: number;
}
interface Journal {
  readonly revision: number;
  readonly changed: readonly string[];
  readonly expiresAt: string;
}
interface Receipt {
  readonly fingerprint: string;
  readonly result: unknown;
  readonly revision: number;
  readonly expiresAt: string;
}
export interface WorkspaceSnapshot extends WorkspaceVersion {
  readonly state: WorkspaceState;
  readonly records: ReadonlyMap<string, StateRecord>;
}

export class WorkspaceRepository {
  private cache: WorkspaceSnapshot | undefined;
  constructor(private readonly database: DocumentDatabase) {}

  async load(): Promise<WorkspaceSnapshot> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const head = await this.database.get<WorkspaceVersion>('crmMeta', 'head');
      const version = head ?? { epoch: 'uninitialized', revision: 0 };
      if (this.cache?.epoch === version.epoch && this.cache.revision === version.revision)
        return this.cache;
      let records: Map<string, StateRecord>;
      if (this.cache?.epoch === version.epoch && version.revision - this.cache.revision <= 100) {
        const journal = await this.database.find<Journal>('crmJournal', {
          filters: [{ field: 'revision', operator: 'greater-than', value: this.cache.revision }],
          order: { field: 'revision', direction: 'ascending' },
          limit: 101,
        });
        if (
          journal.length !== version.revision - this.cache.revision ||
          journal.at(-1)?.value.revision !== version.revision
        ) {
          this.cache = undefined;
          continue;
        }
        records = new Map(this.cache.records);
        const ids = [...new Set(journal.flatMap(({ value }) => value.changed))];
        // Limitar a concorrência para não abrir milhares de leituras simultâneas.
        for (let offset = 0; offset < ids.length; offset += 25) {
          await Promise.all(
            ids.slice(offset, offset + 25).map(async (id) => {
              const value = await this.database.get<StateRecord>('crmRecords', id);
              if (value) records.set(id, value);
              else records.delete(id);
            }),
          );
        }
      } else
        records = new Map(
          (await this.database.find<StateRecord>('crmRecords')).map(({ id, value }) => [id, value]),
        );
      const confirmed = await this.database.get<WorkspaceVersion>('crmMeta', 'head');
      if (confirmed?.revision !== head?.revision || confirmed?.epoch !== head?.epoch) continue;
      const state = records.size ? decodeState(records) : emptyWorkspace();
      return (this.cache = { ...version, state, records });
    }
    throw new RevisionConflict();
  }

  async receipt(
    context: RequestContext,
    requestId: string,
    fingerprint: string,
  ): Promise<{ result: unknown; revision: number } | null> {
    const receipt = await this.database.get<Receipt>(
      'crmReceipts',
      this.receiptId(context, requestId),
    );
    if (!receipt) return null;
    if (receipt.fingerprint !== fingerprint)
      throw new ApplicationError(
        409,
        'IDEMPOTENCY_CONFLICT',
        'A identificação desta operação já foi usada com outros dados.',
      );
    return receipt;
  }

  async commit(
    context: RequestContext,
    previous: WorkspaceSnapshot,
    state: WorkspaceState,
    requestId: string,
    fingerprint: string,
    result: unknown,
    notifications: readonly MentionNotification[],
    fileLinks: readonly { id: string; metadata: import('./files').StoredFile }[],
  ): Promise<{ result: unknown; revision: number }> {
    const next = encodeState(state, previous.records);
    const changed = [...new Set([...previous.records.keys(), ...next.keys()])].filter(
      (id) => JSON.stringify(previous.records.get(id)) !== JSON.stringify(next.get(id)),
    );
    if (changed.length + notifications.length + fileLinks.length > 400)
      throw new ApplicationError(
        413,
        'BATCH_TOO_LARGE',
        'Esta operação altera registros demais de uma vez. Divida a operação.',
      );
    if (Buffer.byteLength(JSON.stringify(result ?? null)) > 700_000)
      throw new ApplicationError(
        413,
        'RESULT_TOO_LARGE',
        'O resultado desta operação excede o tamanho permitido.',
      );
    const revision = previous.revision + 1;
    const epoch = previous.epoch === 'uninitialized' ? randomUUID() : previous.epoch;
    const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const committed = await this.database.atomic(async (transaction) => {
      const [head, member, existing] = await Promise.all([
        transaction.get<WorkspaceVersion>('crmMeta', 'head'),
        transaction.get<MemberAccess>('teamAccess', context.identity.id),
        transaction.get<Receipt>('crmReceipts', this.receiptId(context, requestId)),
      ]);
      validateAccess(context.identity, member);
      for (const file of fileLinks) {
        const stored = await transaction.get<import('./files').StoredFile>('crmFiles', file.id);
        if (
          !stored ||
          stored.deleting ||
          (!stored.attached && stored.ownerId !== context.identity.id)
        )
          throw new ApplicationError(
            403,
            'FILE_ACCESS_DENIED',
            'O arquivo não está mais disponível. Envie-o novamente.',
          );
      }
      if (existing) {
        if (existing.fingerprint !== fingerprint)
          throw new ApplicationError(
            409,
            'IDEMPOTENCY_CONFLICT',
            'Esta operação já foi usada com outros dados.',
          );
        return { result: existing.result, revision: existing.revision, applied: false };
      }
      if (
        (head?.revision ?? 0) !== previous.revision ||
        (head?.epoch ?? 'uninitialized') !== previous.epoch
      )
        throw new RevisionConflict();
      for (const id of changed) {
        const item = next.get(id);
        if (item) transaction.put('crmRecords', id, item);
        else transaction.remove('crmRecords', id);
      }
      for (const file of fileLinks) transaction.put('crmFiles', file.id, file.metadata);
      for (const notification of notifications)
        transaction.put('crmNotifications', notification.id, notification);
      transaction.put('crmMeta', 'head', { epoch, revision });
      transaction.put('crmJournal', String(revision).padStart(16, '0'), {
        revision,
        changed,
        citizensChanged: [
          ...new Set(
            changed.flatMap((id) => {
              const item = next.get(id) ?? previous.records.get(id);
              return item && ['crm.citizens', 'crm.profileEdits'].includes(item.group)
                ? [item.key]
                : [];
            }),
          ),
        ],
        expiresAt,
      });
      transaction.put('crmReceipts', this.receiptId(context, requestId), {
        fingerprint,
        result: result ?? null,
        revision,
        expiresAt,
      });
      return { result: result ?? null, revision, applied: true };
    });
    if (committed.applied) this.cache = { state, records: next, epoch, revision };
    return { result: committed.result, revision: committed.revision };
  }

  private receiptId(context: RequestContext, requestId: string): string {
    return createHash('sha256').update(`${context.identity.id}:${requestId}`).digest('hex');
  }
}
