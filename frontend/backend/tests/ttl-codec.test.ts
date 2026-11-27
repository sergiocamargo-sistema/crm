import test from 'node:test';
import assert from 'node:assert/strict';
import { Timestamp } from 'firebase-admin/firestore';
import { encodeDocument, decodeDocument } from '../src/infrastructure/firestore-database';

test('TTL usa timestamp no Firestore e mantém ISO nos contratos e backups portáteis', () => {
  const value = {
    expiresAt: '2026-11-28T12:00:00.000Z',
    createdAt: '2026-11-27T12:00:00.000Z',
    count: 1,
  };
  for (const collection of ['crmRateLimits', 'crmSecurityAudit']) {
    const stored = encodeDocument(collection, value);
    assert.ok(stored['expiresAt'] instanceof Timestamp);
    assert.deepEqual(decodeDocument(collection, stored), value);
  }
  assert.deepEqual(encodeDocument('crmRecords', value), value);
  assert.equal(typeof value.expiresAt, 'string');
});
