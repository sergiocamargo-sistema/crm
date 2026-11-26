import test from 'node:test';
import assert from 'node:assert/strict';
import { actor, harness, result } from './fixtures';
import type { MentionNotification } from '../../src/app/core/models/collaboration';
import type { SearchCachePage } from '../../src/app/domain/contracts/backend-api';

test('API rejeita conta não autorizada, JSON inválido e métodos internos do motor', async () => {
  const api = await harness();
  assert.equal(
    (await api.handle({ method: 'GET', path: '/v1/session', headers: {}, body: new Uint8Array() }))
      .status,
    401,
  );
  assert.equal((await api.action('initializeTaskHistory', [[]])).status, 400);
  assert.equal((await api.action('snapshot')).status, 400);
  assert.equal((await api.action('loadDetail', ['x', 'argumento-extra'])).status, 400);
  const malformed = await api.handle({
    method: 'POST',
    path: '/v1/actions',
    headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
    body: Buffer.from('{'),
  });
  assert.equal(malformed.status, 400);
  await api.database.atomic(async (transaction) =>
    transaction.put('teamAccess', actor.id, { email: actor.email, active: false, role: 'admin' }),
  );
  assert.equal((await api.action('loadTeam')).status, 403);
});

test('preflight CORS responde sem autenticação e origem desconhecida é recusada', async () => {
  const api = await harness();
  const preflight = await api.handle({
    method: 'OPTIONS',
    path: '/v1/actions',
    headers: { origin: 'http://localhost:4300' },
    body: new Uint8Array(),
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers['Access-Control-Allow-Origin'], 'http://localhost:4300');
  const denied = await api.handle({
    method: 'GET',
    path: '/v1/session',
    headers: { origin: 'https://unknown.invalid', authorization: 'Bearer test-token' },
    body: new Uint8Array(),
  });
  assert.equal(denied.status, 403);
});

test('marcar mais de 450 notificações usa lotes e preserva outros destinatários', async () => {
  const api = await harness();
  for (let offset = 0; offset < 650; offset += 100)
    await api.database.atomic(async (transaction) => {
      for (let index = offset; index < Math.min(offset + 100, 650); index++)
        transaction.put('crmNotifications', `notification-${index}`, {
          id: `notification-${index}`,
          recipientId: index < 600 ? actor.id : 'another-member',
          actor: 'Equipe',
          taskId: 'task-test',
          taskTitle: 'Tarefa de teste',
          commentId: null,
          createdAt: '2026-11-26T12:00:00.000Z',
          readAt: null,
        } satisfies MentionNotification);
    });
  result(await api.action('markAllNotificationsRead'));
  const notifications = await api.database.find<MentionNotification>('crmNotifications');
  assert.equal(
    notifications.filter(({ value }) => value.recipientId === actor.id && value.readAt).length,
    600,
  );
  assert.equal(
    notifications.filter(({ value }) => value.recipientId !== actor.id && value.readAt).length,
    0,
  );
  assert.equal(
    result<readonly MentionNotification[]>(await api.action('loadNotifications')).length,
    600,
  );
});

test('busca incremental entrega só o munícipe alterado e a busca remota aceita telefone sem máscara', async () => {
  const api = await harness();
  const created = result<{ id: string }>(
    await api.action('createCitizen', [
      api.citizen('Pessoa de teste', {
        phones: [{ key: 'phone-one', number: '(11) 91234-5678', label: 'Celular', whatsapp: true }],
      }),
    ]),
  );
  const first = result<SearchCachePage>(await api.action('syncCitizenSearch', [null, 0, null]));
  assert.equal(first.reset, true);
  assert.equal(first.records.length, 1);
  result(await api.action('saveObservations', [created.id, 'Texto atualizado']));
  const delta = result<SearchCachePage>(
    await api.action('syncCitizenSearch', [first.epoch, first.revision, null]),
  );
  assert.equal(delta.reset, false);
  assert.equal(delta.records.length, 1);
  assert.ok(delta.records[0].searchText.includes('texto atualizado'));
  const remote = result<readonly { id: string }[]>(
    await api.action('searchCitizens', ['11912345678', 100]),
  );
  assert.equal(remote[0].id, created.id);
  assert.deepEqual(result(await api.action('searchCitizens', ['', 100])), []);
});
