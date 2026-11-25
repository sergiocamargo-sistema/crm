import { randomUUID } from 'node:crypto';
import type { FileStorage } from '../ports/file-storage';
import type { DocumentDatabase } from '../ports/document-database';
import type { RequestContext } from './access';
import { ApplicationError } from './error';
import {
  attachmentType,
  MAX_ATTACHMENT_SIZE,
} from '../../../src/app/features/requests/models/attachment-files';

export interface StoredFile {
  readonly path: string;
  readonly ownerId: string;
  readonly name: string;
  readonly mimeType: string;
  readonly size: number;
  readonly createdAt: string;
  readonly attached: boolean;
  readonly deleting?: boolean;
}
export class FilesService {
  private readonly urls = new Map<string, { url: string; expires: number }>();
  constructor(
    private readonly database: DocumentDatabase,
    private readonly storage: FileStorage,
  ) {}
  async upload(
    context: RequestContext,
    name: string,
    mime: string,
    data: Uint8Array,
  ): Promise<{ reference: string; name: string; mimeType: string; size: number }> {
    const type = attachmentType(name, mime);
    if (
      !name.trim() ||
      name.length > 255 ||
      /[\u0000-\u001f/\\]/u.test(name) ||
      !type ||
      !data.length ||
      data.length > MAX_ATTACHMENT_SIZE
    )
      throw new ApplicationError(400, 'INVALID_FILE', 'Escolha um arquivo válido de até 20 MB.');
    const id = randomUUID();
    const metadata: StoredFile = {
      path: `crm/${id}`,
      ownerId: context.identity.id,
      name,
      mimeType: type.mime,
      size: data.length,
      createdAt: new Date().toISOString(),
      attached: false,
    };
    await this.storage.write(metadata.path, data, type.mime);
    try {
      await this.database.atomic(async (transaction) => {
        transaction.put('crmFiles', id, metadata);
      });
    } catch (error) {
      await this.storage.remove(metadata.path);
      throw error;
    }
    return { reference: `crm-file://${id}`, name, mimeType: type.mime, size: data.length };
  }
  async authorizeReferences(
    context: RequestContext,
    value: unknown,
  ): Promise<readonly { id: string; metadata: StoredFile }[]> {
    const ids = new Set<string>();
    const visit = (item: unknown): void => {
      if (typeof item === 'string' && item.startsWith('crm-file://')) {
        const id = item.slice(11);
        if (!/^[a-f0-9-]{36}$/u.test(id))
          throw new ApplicationError(400, 'INVALID_FILE', 'Referência de arquivo inválida.');
        ids.add(id);
      } else if (typeof item === 'string' && item.startsWith('blob:'))
        throw new ApplicationError(400, 'LOCAL_FILE', 'Envie o arquivo antes de salvar.');
      else if (Array.isArray(item)) item.forEach(visit);
      else if (item && typeof item === 'object') Object.values(item).forEach(visit);
    };
    visit(value);
    return Promise.all(
      [...ids].map(async (id) => {
        const metadata = await this.database.get<StoredFile>('crmFiles', id);
        if (
          !metadata ||
          metadata.deleting ||
          (!metadata.attached && metadata.ownerId !== context.identity.id)
        )
          throw new ApplicationError(
            403,
            'FILE_ACCESS_DENIED',
            'O arquivo não está disponível para esta operação.',
          );
        return { id, metadata: { ...metadata, attached: true } };
      }),
    );
  }
  async hydrate(value: unknown): Promise<unknown> {
    if (typeof value === 'string' && value.startsWith('crm-file://')) {
      const id = value.slice(11);
      const cached = this.urls.get(id);
      if (cached && cached.expires > Date.now() + 60_000) return cached.url;
      const file = await this.database.get<StoredFile>('crmFiles', id);
      if (!file) return '';
      const expires = Date.now() + 3_600_000;
      const url = await this.storage.signedReadUrl(file.path, new Date(expires));
      if (this.urls.size > 1000) this.urls.clear();
      this.urls.set(id, { url, expires });
      return url;
    }
    if (Array.isArray(value)) return Promise.all(value.map((item) => this.hydrate(item)));
    if (value && typeof value === 'object') {
      const original = value as Record<string, unknown>;
      const reference = [original['src'], original['url']].find(
        (item) => typeof item === 'string' && item.startsWith('crm-file://'),
      );
      return {
        ...Object.fromEntries(
          await Promise.all(
            Object.entries(value).map(async ([key, item]) => [
              key,
              key === 'fileReference' ? item : await this.hydrate(item),
            ]),
          ),
        ),
        ...(reference ? { fileReference: reference } : {}),
      };
    }
    return value;
  }
}
