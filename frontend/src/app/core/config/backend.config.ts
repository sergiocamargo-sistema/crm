/** A URL é pública. A autorização é conferida pela API em toda chamada. */
export const backendConfig = {
  url: 'https://southamerica-east1-sergio-6ceff.cloudfunctions.net/crmApi',
  searchSyncIntervalMs: 60_000,
  searchCacheMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  searchCacheMaxRecords: 20_000,
} as const;
