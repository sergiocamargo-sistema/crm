import { randomUUID } from 'node:crypto';
import Ajv from 'ajv';
import schema from '../generated/api.schema.json';
import type { ApiInvocation } from '../../../src/app/domain/contracts/backend-api';
import type { DocumentDatabase } from '../ports/document-database';
import type { IdentityProvider } from '../ports/identity-provider';
import type { FileStorage } from '../ports/file-storage';
import { AccessService } from '../application/access';
import { Dispatcher } from '../application/dispatcher';
import { FilesService } from '../application/files';
import { ApplicationError } from '../application/error';

export interface ApiRequest {
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly body: Uint8Array;
}
export interface ApiReply {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
}
export interface ApiDependencies {
  readonly database: DocumentDatabase;
  readonly identity: IdentityProvider;
  readonly storage: FileStorage;
  readonly allowedOrigins: readonly (string | RegExp)[];
  readonly logError?: (traceId: string) => void;
}
const validate = new Ajv({ allErrors: false, strict: false }).compile<ApiInvocation>(schema);
const METHODS: Readonly<Record<string, string>> = {
  '/v1/session': 'GET',
  '/v1/actions': 'POST',
  '/v1/files': 'POST',
};

/** Transporte compartilhado pelo Functions, servidor local e testes, sem inicializar Firebase. */
export function createApi(
  dependencies: ApiDependencies,
): (request: ApiRequest) => Promise<ApiReply> {
  const access = new AccessService(dependencies.identity, dependencies.database);
  const files = new FilesService(dependencies.database, dependencies.storage);
  const dispatcher = new Dispatcher(dependencies.database, files);
  const limits = new Map<string, { minute: number; count: number }>();
  return async (request) => {
    const traceId = randomUUID();
    const headers: Record<string, string> = {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/json; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
      Vary: 'Origin',
    };
    try {
      const origin = request.headers['origin'];
      if (origin) {
        if (
          !dependencies.allowedOrigins.some((allowed) =>
            typeof allowed === 'string' ? allowed === origin : allowed.test(origin),
          )
        )
          throw new ApplicationError(403, 'ORIGIN_DENIED', 'Este endereço não está autorizado.');
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-File-Name';
        headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      }
      const path = request.path.replace(/\/$/u, '');
      const method = METHODS[path];
      if (!method) throw new ApplicationError(404, 'NOT_FOUND', 'Endereço não encontrado.');
      if (request.method === 'OPTIONS') return { status: 204, headers, body: null };
      if (request.method !== method) {
        headers['Allow'] = method;
        throw new ApplicationError(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
      }
      if (request.body.byteLength > (path === '/v1/files' ? 20 * 1024 * 1024 : 2 * 1024 * 1024))
        throw new ApplicationError(
          413,
          'BODY_TOO_LARGE',
          'O conteúdo enviado excede o tamanho permitido.',
        );
      const bearer = request.headers['authorization']?.match(/^Bearer (\S+)$/u)?.[1];
      if (!bearer) throw new ApplicationError(401, 'SESSION_REQUIRED', 'Entre para continuar.');
      const context = await access.authorize(bearer);
      const minute = Math.floor(Date.now() / 60_000);
      const limit = limits.get(context.identity.id);
      if (!limit || limit.minute !== minute) limits.set(context.identity.id, { minute, count: 1 });
      else if (++limit.count > 240)
        throw new ApplicationError(
          429,
          'RATE_LIMIT',
          'Aguarde alguns instantes antes de continuar.',
        );
      if (limits.size > 1000) limits.clear();
      if (path === '/v1/session')
        return {
          status: 200,
          headers,
          body: { role: context.role, profile: { actor: context.actor, users: context.users } },
        };
      if (path === '/v1/files') {
        let name: string;
        try {
          name = decodeURIComponent(request.headers['x-file-name'] ?? '');
        } catch {
          throw new ApplicationError(400, 'INVALID_FILE', 'Nome de arquivo inválido.');
        }
        return {
          status: 201,
          headers,
          body: await files.upload(
            context,
            name,
            request.headers['content-type'] ?? '',
            request.body,
          ),
        };
      }
      let invocation: unknown;
      try {
        invocation = JSON.parse(Buffer.from(request.body).toString('utf8')) as unknown;
      } catch {
        throw new ApplicationError(400, 'INVALID_JSON', 'Envie um JSON válido.');
      }
      if (
        request.headers['content-type']?.split(';')[0]?.trim().toLowerCase() !==
          'application/json' ||
        !validate(invocation)
      )
        throw new ApplicationError(400, 'INVALID_INPUT', 'Confira os dados enviados.');
      return { status: 200, headers, body: await dispatcher.execute(context, invocation) };
    } catch (error: unknown) {
      const known = error instanceof ApplicationError;
      const status = known ? error.status : 500;
      if (status >= 500) dependencies.logError?.(traceId);
      headers['Content-Type'] = 'application/problem+json; charset=utf-8';
      return {
        status,
        headers,
        body: {
          type: 'about:blank',
          status,
          code: known ? error.code : 'OPERATION_FAILED',
          title: known ? error.message : 'Não foi possível concluir esta operação.',
          traceId,
        },
      };
    }
  };
}
