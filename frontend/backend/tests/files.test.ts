import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, result } from './fixtures';
import type { StoredFile } from '../src/application/files';
import type { CitizenDetail } from '../../src/app/features/citizens/models/citizen-detail';
import { FilesService } from '../src/application/files';
import { MAX_ATTACHMENT_SIZE } from '../../src/app/features/requests/models/attachment-files';

const bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
test('upload, ficha e listagem preservam a referência e não invalidam URLs das fotos', async () => {
  const api = await harness();
  const reply = await api.handle({
    method: 'POST',
    path: '/v1/files',
    headers: {
      authorization: 'Bearer test-token',
      'content-type': 'image/png',
      'x-file-name': 'foto.png',
    },
    body: bytes,
  });
  assert.equal(reply.status, 201);
  const { reference } = reply.body as { reference: string };
  const command = {
    ...api.citizen('Pessoa com foto'),
    photos: [{ src: reference, label: 'Foto de teste' }],
  };
  const { id } = result<{ id: string }>(await api.action('createCitizen', [command]));
  const detail = result<CitizenDetail>(await api.action('loadDetail', [id]));
  assert.equal(detail.photos[0].fileReference, reference);
  assert.deepEqual(api.storage.read(new URL(detail.photos[0].src))?.content, bytes);
  const query = {
    query: '',
    neighborhoods: [],
    cabinetRatings: [],
    ageRanges: [],
    birthdayDays: [],
    birthdayMonths: [],
    requestStatuses: [],
    includedCategories: [],
    excludedCategories: [],
    categoryMatch: 'all',
    includedDepartmentIds: [],
    excludedDepartmentIds: [],
    order: 'name-asc',
  };
  const list = result<{ items: readonly { photo: { src: string } }[] }>(
    await api.action('loadCitizenList', [query]),
  );
  assert.deepEqual(api.storage.read(new URL(list.items[0].photo.src))?.content, bytes);
  assert.equal(
    (await api.database.get<StoredFile>('crmFiles', reference.slice(11)))?.attached,
    true,
  );
});

test('revisão de duplicidade não marca foto pendente como vinculada; texto não vira link', async () => {
  const api = await harness();
  result(await api.action('createCitizen', [api.citizen('Nome duplicado')]));
  const reply = await api.handle({
    method: 'POST',
    path: '/v1/files',
    headers: {
      authorization: 'Bearer test-token',
      'content-type': 'image/png',
      'x-file-name': 'foto.png',
    },
    body: bytes,
  });
  const { reference } = reply.body as { reference: string };
  const review = result<{ kind: string }>(
    await api.action('createCitizen', [
      { ...api.citizen('Nome duplicado'), photos: [{ src: reference, label: 'Foto' }] },
    ]),
  );
  assert.equal(review.kind, 'review');
  assert.equal(
    (await api.database.get<StoredFile>('crmFiles', reference.slice(11)))?.attached,
    false,
  );
  const service = new FilesService(api.database, api.storage);
  assert.deepEqual(await service.hydrate({ text: reference }), { text: reference });
  assert.equal(service.references({ text: reference }).size, 0);
});

test('arquivos rejeitam tamanho excessivo e URLs locais assinadas expiram', async () => {
  const api = await harness();
  const reply = await api.handle({
    method: 'POST',
    path: '/v1/files',
    headers: {
      authorization: 'Bearer test-token',
      'content-type': 'image/png',
      'x-file-name': 'foto.png',
    },
    body: new Uint8Array(MAX_ATTACHMENT_SIZE + 1),
  });
  assert.equal(reply.status, 413);
  await api.storage.write('crm/example', bytes, 'image/png');
  assert.equal(
    api.storage.read(new URL(await api.storage.signedReadUrl('crm/example', new Date(0)))),
    null,
  );
});
