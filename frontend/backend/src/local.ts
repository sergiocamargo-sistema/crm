import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { MemoryDatabase } from './infrastructure/memory-database';
import { MemoryFiles } from './infrastructure/memory-files';
import { createApi } from './http/api';
import type { VerifiedIdentity } from './ports/identity-provider';

async function main(): Promise<void> {
  if (
    process.env['K_SERVICE'] ||
    process.env['FUNCTION_TARGET'] ||
    process.env['NODE_ENV'] === 'production'
  )
    throw new Error('A entrada local não pode ser usada em produção.');
  const port = Number(process.env['CRM_LOCAL_PORT'] ?? '4400');
  if (!Number.isSafeInteger(port) || port < 1024 || port > 65535)
    throw new Error('CRM_LOCAL_PORT deve estar entre 1024 e 65535.');
  const origin = `http://127.0.0.1:${port}`;
  const secret = randomBytes(32).toString('hex');
  const database = new MemoryDatabase();
  const storage = new MemoryFiles(origin, secret);
  const actor: VerifiedIdentity = {
    id: 'local-developer',
    email: 'developer@local.invalid',
    name: 'Desenvolvimento local',
    emailVerified: true,
    provider: 'google.com',
  };
  await database.atomic(async (transaction) =>
    transaction.put('teamAccess', actor.id, {
      email: actor.email,
      name: actor.name,
      active: true,
      role: 'admin',
    }),
  );
  const handle = createApi({
    database,
    storage,
    identity: {
      verify: async (token) => {
        const supplied = Buffer.from(token);
        const expected = Buffer.from(secret);
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected))
          throw new Error('Token local inválido.');
        return actor;
      },
    },
    allowedOrigins: [/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/u],
  });
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', origin);
    if (url.pathname.startsWith('/local/files/') && request.method === 'GET') {
      const file = storage.read(url);
      if (!file) {
        response.writeHead(404, { 'Cache-Control': 'no-store' }).end();
        return;
      }
      response
        .writeHead(200, {
          'Content-Type': file.contentType,
          'Content-Length': file.content.length,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-store',
        })
        .end(file.content);
      return;
    }
    try {
      const limit = url.pathname === '/v1/files' ? 20 * 1024 * 1024 : 2 * 1024 * 1024;
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of request) {
        const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
        size += data.length;
        if (size > limit) {
          response.writeHead(413, { 'Cache-Control': 'no-store' }).end();
          return;
        }
        chunks.push(data);
      }
      const headers = Object.fromEntries(
        Object.entries(request.headers).map(([name, value]) => [
          name,
          Array.isArray(value) ? value.join(', ') : value,
        ]),
      );
      const result = await handle({
        method: request.method ?? 'GET',
        path: url.pathname,
        headers,
        body: Buffer.concat(chunks),
      });
      response
        .writeHead(result.status, result.headers)
        .end(result.status === 204 ? undefined : JSON.stringify(result.body));
    } catch {
      if (!response.headersSent) response.writeHead(500, { 'Cache-Control': 'no-store' });
      response.end();
    }
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(
      `API local: ${origin}\nDados temporários em memória; nenhuma conexão com Firebase.\nToken de desenvolvimento (só deste processo): ${secret}`,
    );
  });
  const close = (): void => {
    server.close();
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha ao iniciar API local.');
  process.exitCode = 1;
});
