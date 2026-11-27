import test from 'node:test';
import assert from 'node:assert/strict';
import { actor, harness, result } from './fixtures';
import { createApi } from '../src/http/api';
import { MemoryDatabase } from '../src/infrastructure/memory-database';
import { MemoryFiles } from '../src/infrastructure/memory-files';
import { RequestQuota } from '../src/application/security';
import { AccessService } from '../src/application/access';
import { WorkspaceRepository } from '../src/application/workspace-repository';
import type { DatabaseTransaction } from '../src/ports/document-database';
import type { AuditEntry } from '../src/application/security';

test('App Check inválido falha antes de autenticação e de consultas ao banco', async () => {
  let authentications = 0;
  const database = new MemoryDatabase();
  const handle = createApi({
    database,
    storage: new MemoryFiles('http://localhost:4400', 'test-secret'),
    identity: {
      verify: async () => {
        authentications++;
        return actor;
      },
    },
    allowedOrigins: [],
    requireAppCheck: true,
    attestation: {
      verify: async (token) => {
        if (token !== 'verified-app') throw new Error();
      },
    },
  });
  const request = {
    method: 'GET',
    path: '/v1/session',
    body: new Uint8Array(),
    headers: { authorization: 'Bearer test-token' },
  };
  assert.equal((await handle(request)).status, 403);
  assert.equal(
    (
      await handle({
        ...request,
        headers: { ...request.headers, 'x-firebase-appcheck': 'invalid' },
      })
    ).status,
    403,
  );
  assert.equal(authentications, 0);
  assert.equal(
    (
      await handle({
        ...request,
        headers: { ...request.headers, 'x-firebase-appcheck': 'verified-app' },
      })
    ).status,
    403,
  );
  assert.equal(authentications, 1);
  assert.equal((await database.find('crmRateLimits')).length, 0);
});

test('o limitador anterior à autenticação também limita solicitações sem token', async () => {
  const api = await harness();
  let last;
  for (let index = 0; index < 301; index++)
    last = await api.handle({
      method: 'GET',
      path: '/v1/session',
      headers: {},
      body: new Uint8Array(),
      remoteAddress: '192.0.2.1',
    });
  assert.equal(last?.status, 429);
  assert.equal(last?.headers['Retry-After'], '60');
});

test('cotas compartilham contagem entre instâncias e recusam lotes excedidos sem aumentar o contador', async () => {
  const database = new MemoryDatabase();
  const first = new RequestQuota(database),
    second = new RequestQuota(database);
  await Promise.all([first.consume(actor.id, 'test', 3), second.consume(actor.id, 'test', 3)]);
  await assert.rejects(second.consume(actor.id, 'test', 3, 2), /Aguarde/u);
  await first.consume(actor.id, 'test', 3);
  await assert.rejects(second.consume(actor.id, 'test', 3), /Aguarde/u);
});

test('membros não administram catálogos nem imprimem e permissões explícitas permitem somente leitura', async () => {
  const api = await harness();
  await api.database.atomic(async (tx) =>
    tx.put('teamAccess', actor.id, { ...actor, active: true, role: 'member' }),
  );
  assert.equal(
    (await api.action('saveDepartment', [null, { name: 'Restrito', parentId: null }])).status,
    403,
  );
  assert.equal((await api.action('prepareLabelRecipients', [[]])).status, 403);
  const { id } = result<{ id: string }>(
    await api.action('createCitizen', [api.citizen('Pessoa teste')]),
  );
  assert.equal((await api.action('addCategory', [id, 'Categoria nova proibida'])).status, 403);
  assert.deepEqual(result(await api.action('loadCitizenCategories')), []);
  await api.database.atomic(async (tx) =>
    tx.put('teamAccess', actor.id, {
      ...actor,
      active: true,
      role: 'member',
      permissions: ['records.read'],
    }),
  );
  assert.equal((await api.action('loadDetail', [id])).status, 200);
  assert.equal((await api.action('saveObservations', [id, 'Alteração proibida'])).status, 403);
  assert.equal((await api.action('syncCitizenSearch', [null, 0, null])).status, 403);
});

test('permissão removida durante uma ação impede o commit', async () => {
  const api = await harness();
  const access = new AccessService({ verify: async () => actor }, api.database);
  const context = { ...(await access.authorize('test')), operation: 'saveObservations' as const };
  const repository = new WorkspaceRepository(api.database);
  const before = await repository.load();
  await api.database.atomic(async (tx) =>
    tx.put('teamAccess', actor.id, {
      ...actor,
      active: true,
      role: 'member',
      permissions: ['records.read'],
    }),
  );
  await assert.rejects(
    repository.commit(context, before, before.state, 'test-request', 'fingerprint', null, [], []),
    /permissão/u,
  );
  assert.equal(await api.database.get('crmMeta', 'head'), null);
});

test('sessão expira após oito horas e configuração inválida de permissões falha fechada', async () => {
  const api = await harness();
  const access = new AccessService(
    { verify: async () => ({ ...actor, authenticatedAt: Date.now() / 1000 - 9 * 3600 }) },
    api.database,
  );
  await assert.rejects(access.authorize('test'), /sessão expirou/u);
  await api.database.atomic(async (tx) =>
    tx.put('teamAccess', actor.id, {
      ...actor,
      active: true,
      role: 'admin',
      permissions: ['typo.permission'],
    }),
  );
  assert.equal((await api.action('loadTeam')).status, 403);
});

test('auditoria registra autoria/operação/alvo sem observações nem texto de busca', async () => {
  const api = await harness();
  const { id } = result<{ id: string }>(
    await api.action('createCitizen', [api.citizen('Nome pessoal')]),
  );
  result(await api.action('saveObservations', [id, 'Observação privada']));
  result(await api.action('loadDetail', [id]));
  result(await api.action('searchCitizens', ['Pesquisa confidencial', 10]));
  const audit = await api.database.find<AuditEntry>('crmSecurityAudit');
  assert.ok(
    audit.some(
      ({ value }) =>
        value.operation === 'saveObservations' &&
        value.outcome === 'committed' &&
        value.resourceIds?.includes(id),
    ),
  );
  assert.ok(
    audit.some(({ value }) => value.operation === 'loadDetail' && value.outcome === 'returned'),
  );
  const serialized = JSON.stringify(audit);
  for (const sensitive of ['Nome pessoal', 'Observação privada', 'Pesquisa confidencial'])
    assert.equal(serialized.includes(sensitive), false);
});

test('falha de auditoria dentro da gravação desfaz também os dados de negócio', async () => {
  class FailingAuditDatabase extends MemoryDatabase {
    override atomic<T>(action: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
      return super.atomic((transaction) =>
        action({
          ...transaction,
          put: (collection, id, value) => {
            if (collection === 'crmSecurityAudit' && (value as AuditEntry).outcome === 'committed')
              throw new Error('audit unavailable');
            transaction.put(collection, id, value);
          },
        }),
      );
    }
  }
  const api = await harness(new FailingAuditDatabase());
  assert.equal(
    (await api.action('createCitizen', [api.citizen('Não pode persistir')])).status,
    500,
  );
  assert.equal((await api.database.find('crmRecords')).length, 0);
  assert.equal(await api.database.get('crmMeta', 'head'), null);
});

test('arquivos com nome de imagem e conteúdo HTML são recusados antes do armazenamento', async () => {
  const api = await harness();
  const response = await api.handle({
    method: 'POST',
    path: '/v1/files',
    headers: {
      authorization: 'Bearer test-token',
      'x-file-name': 'foto.png',
      'content-type': 'image/png',
    },
    body: Buffer.from('<html><script>test</script></html>'),
  });
  assert.equal(response.status, 400);
  assert.equal((await api.database.find('crmFiles')).length, 0);
});

test('IDs inválidos de impressão não injetam texto pessoal na auditoria e lotes grandes falham antes dela', async () => {
  const api = await harness();
  assert.equal(
    (
      await api.action('prepareLabelRecipients', [
        ['endereco.privado@example.com', 'x'.repeat(2000)],
      ])
    ).status,
    422,
  );
  assert.equal(
    (
      await api.action('prepareLabelRecipients', [
        Array.from({ length: 201 }, (_, index) => `id-${index}`),
      ])
    ).status,
    413,
  );
  const audit = JSON.stringify(await api.database.find('crmSecurityAudit'));
  assert.equal(audit.includes('endereco.privado'), false);
  assert.equal(audit.includes('x'.repeat(2000)), false);
});
