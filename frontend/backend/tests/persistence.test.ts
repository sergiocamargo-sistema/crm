import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryDatabase } from '../src/infrastructure/memory-database';
import { encodeState, decodeState, emptyWorkspace } from '../src/application/state-records';
import { LabelPrintEngine } from '../../src/app/domain/label-print';
import { harness, result } from './fixtures';

test('transações fazem rollback e leituras paralelas não veem dados sem commit', async () => {
  const database = new MemoryDatabase();
  let release: (() => void) | undefined;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pending = database.atomic(async (transaction) => {
    transaction.put('items', 'one', { count: 1 });
    await waiting;
    throw new Error('rollback');
  });
  await Promise.resolve();
  assert.equal(await database.get('items', 'one'), null);
  release!();
  await assert.rejects(pending, /rollback/u);
  assert.equal(await database.get('items', 'one'), null);
  await Promise.all(
    Array.from({ length: 10 }, () =>
      database.atomic(async (transaction) => {
        const item = await transaction.get<{ count: number }>('items', 'one');
        transaction.put('items', 'one', { count: (item?.count ?? 0) + 1 });
      }),
    ),
  );
  assert.deepEqual(await database.get('items', 'one'), { count: 10 });
});

test('persistência preserva filhos vazios de solicitações e versões históricas das etiquetas', () => {
  const base = emptyWorkspace();
  const labels = new LabelPrintEngine(base.labels);
  const original = labels.loadConfiguration().defaultTemplate;
  const first = labels.saveTemplate({ ...original, name: 'Primeira edição' }, false);
  labels.saveTemplate({ ...first, name: 'Segunda edição' }, false);
  const state = {
    crm: {
      ...base.crm,
      requestExtras: {
        'request-test': {
          departmentId: '',
          patternId: null,
          awareness: [],
          attachments: [],
          tasks: [],
          comments: [],
          changes: [],
        },
      },
    },
    labels: labels.snapshot(),
  };
  const restored = decodeState(encodeState(state));
  assert.deepEqual(restored, state);
  assert.deepEqual(
    restored.labels.templateHistory.map(({ version }) => version),
    [1, 2],
  );
});

test('adicionar no início de um catálogo grande altera só o registro novo', () => {
  const base = emptyWorkspace();
  const before = encodeState({
    ...base,
    crm: {
      ...base.crm,
      categoryCatalog: Array.from({ length: 1500 }, (_, index) => `Categoria ${index}`),
    },
  });
  const state = decodeState(before);
  const after = encodeState(
    {
      ...state,
      crm: { ...state.crm, categoryCatalog: ['Nova categoria', ...state.crm.categoryCatalog] },
    },
    before,
  );
  const changed = [...after].filter(
    ([id, value]) => JSON.stringify(before.get(id)) !== JSON.stringify(value),
  );
  assert.equal(changed.length, 1);
  assert.deepEqual(decodeState(after).crm.categoryCatalog.slice(0, 2), [
    'Nova categoria',
    'Categoria 0',
  ]);
});

test('cadastro, avaliação e categorias sobrevivem a outra instância da API; repetição não duplica', async () => {
  const first = await harness();
  const command = first.citizen('Munícipe de teste');
  const requestId = 'same-http-request';
  const created = result<{ kind: string; id: string }>(
    await first.action('createCitizen', [command], requestId),
  );
  assert.equal(created.kind, 'created');
  assert.deepEqual(result(await first.action('createCitizen', [command], requestId)), created);
  assert.equal(
    (await first.action('createCitizen', [first.citizen('Outro nome')], requestId)).status,
    409,
  );
  result(await first.action('saveCabinetRating', [created.id, 5]));
  const second = await harness(first.database);
  const detail = result<{ cabinetRating: number }>(await second.action('loadDetail', [created.id]));
  assert.equal(detail.cabinetRating, 5);
  assert.equal((await second.action('saveCabinetRating', [created.id, 25])).status, 400);
  result(await second.action('saveCabinetRating', [created.id, null]));
  assert.equal(
    result<{ cabinetRating: null }>(await first.action('loadDetail', [created.id])).cabinetRating,
    null,
  );
});

test('duas instâncias gravando juntas preservam as duas alterações', async () => {
  const first = await harness();
  const second = await harness(first.database);
  const replies = await Promise.all([
    first.action('createCitizenCategory', ['Categoria A']),
    second.action('createCitizenCategory', ['Categoria B']),
  ]);
  replies.forEach((reply) => result(reply));
  assert.deepEqual(result<readonly string[]>(await first.action('loadCitizenCategories')), [
    'Categoria A',
    'Categoria B',
  ]);
});

test('reconstruir solicitações não altera os documentos lidos e evita um documento por coleção vazia', () => {
  const base = emptyWorkspace();
  const state = {
    ...base,
    crm: {
      ...base.crm,
      requestExtras: {
        'request-test': {
          departmentId: '',
          patternId: null,
          awareness: [],
          attachments: [],
          tasks: [],
          comments: [
            {
              id: 'comment-one',
              text: 'Texto',
              taskId: null,
              parentId: null,
              author: 'Equipe',
              createdAt: '2026-11-26T12:00:00.000Z',
            },
          ],
          changes: [],
        },
      },
    },
  };
  const records = encodeState(state);
  const original = structuredClone(records);
  const restored = decodeState(records);
  assert.deepEqual(restored, state);
  assert.deepEqual(records, original);
  assert.deepEqual(encodeState(restored, records), records);
  assert.equal(
    [...records.values()].filter(({ group }) => group.startsWith('crm.requestExtras.request-test.'))
      .length,
    1,
  );
});
