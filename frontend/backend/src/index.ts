import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { createDatabase } from './config/persistence';
import { FirebaseIdentity } from './infrastructure/firebase-identity';
import { FirebaseFiles } from './infrastructure/firebase-files';
import { maintenance } from './maintenance';
import { createApi } from './http/api';

initializeApp({ storageBucket: 'sergio-6ceff.firebasestorage.app' });
const database = createDatabase();
const storage = new FirebaseFiles();
const handle = createApi({
  database,
  storage,
  identity: new FirebaseIdentity(),
  allowedOrigins: [
    'https://sergiocamargo-sistema.github.io',
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/u,
  ],
  logError: (traceId) => console.error('crm_request_failed', { traceId }),
});
export const crmMaintenance = maintenance(database, storage);
export const crmApi = onRequest(
  {
    region: 'southamerica-east1',
    memory: '512MiB',
    serviceAccount: 'crm-backend@sergio-6ceff.iam.gserviceaccount.com',
    invoker: 'public',
    minInstances: 0,
    maxInstances: 2,
    concurrency: 4,
    timeoutSeconds: 60,
    cors: false,
  },
  async (request, response) => {
    const headers = Object.fromEntries(
      Object.entries(request.headers).map(([name, value]) => [
        name,
        Array.isArray(value) ? value.join(', ') : value,
      ]),
    );
    const result = await handle({
      method: request.method,
      path: request.path,
      headers,
      body: request.rawBody ?? new Uint8Array(),
    });
    response.status(result.status).set(result.headers);
    if (result.status === 204) response.end();
    else response.json(result.body);
  },
);
