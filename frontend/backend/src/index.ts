import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import Ajv from 'ajv';
import schema from './generated/api.schema.json';
import type { ApiInvocation } from '../../src/app/domain/contracts/backend-api';
import { createDatabase } from './config/persistence';
import { FirebaseIdentity } from './infrastructure/firebase-identity';
import { FirebaseFiles } from './infrastructure/firebase-files';
import { AccessService } from './application/access';
import { Dispatcher } from './application/dispatcher';
import { FilesService } from './application/files';
import { maintenance } from './maintenance';
import { ApplicationError } from './application/error';

initializeApp({ storageBucket: 'sergio-6ceff.firebasestorage.app' });
const database = createDatabase();
const access = new AccessService(new FirebaseIdentity(), database);
const storage = new FirebaseFiles();
const files = new FilesService(database, storage);
export const crmMaintenance = maintenance(database, storage);
const dispatcher = new Dispatcher(database, files);
const validate = new Ajv({ allErrors: false, strict: false }).compile<ApiInvocation>(schema);
const limits = new Map<string, { minute: number; count: number }>();
const allowedOrigins = [
  'https://sergiocamargo-sistema.github.io',
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/u,
];

/** Entrada HTTP prevista. Não publica Hosting nem altera o GitHub Pages. */
export const crmApi = onRequest(
  {
    region: 'southamerica-east1',
    memory: '512MiB',
    minInstances: 0,
    maxInstances: 2,
    concurrency: 20,
    timeoutSeconds: 60,
    cors: allowedOrigins,
  },
  async (request, response) => {
    response.set('Cache-Control', 'no-store');
    response.set('X-Content-Type-Options', 'nosniff');
    const traceId = crypto.randomUUID();
    try {
      const bearer = request.get('authorization')?.match(/^Bearer (\S+)$/u)?.[1];
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
      const path = request.path.replace(/\/$/u, '');
      if (path === '/v1/session' && request.method === 'GET') {
        response.json({
          role: context.role,
          profile: { actor: context.actor, users: context.users },
        });
        return;
      }
      if (path === '/v1/files' && request.method === 'POST') {
        let name: string;
        try {
          name = decodeURIComponent(request.get('x-file-name') ?? '');
        } catch {
          throw new ApplicationError(400, 'INVALID_FILE', 'Nome de arquivo inválido.');
        }
        response
          .status(201)
          .json(
            await files.upload(context, name, request.get('content-type') ?? '', request.rawBody),
          );
        return;
      }
      if (path !== '/v1/actions' || request.method !== 'POST')
        throw new ApplicationError(404, 'NOT_FOUND', 'Endereço não encontrado.');
      if (
        request.rawBody.byteLength > 2 * 1024 * 1024 ||
        !request.is('application/json') ||
        !validate(request.body)
      )
        throw new ApplicationError(400, 'INVALID_INPUT', 'Confira os dados enviados.');
      response.json(await dispatcher.execute(context, request.body));
    } catch (error: unknown) {
      const known = error instanceof ApplicationError;
      const status = known ? error.status : 500;
      // Não incluir argumentos, tokens ou dados pessoais nos logs.
      if (status >= 500) console.error('crm_request_failed', { traceId });
      response
        .status(status)
        .type('application/problem+json')
        .json({
          type: 'about:blank',
          status,
          code: known ? error.code : 'OPERATION_FAILED',
          title: known ? (error as Error).message : 'Não foi possível concluir esta operação.',
          traceId,
        });
    }
  },
);
