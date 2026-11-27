import { DestroyRef, effect, inject, Service, signal } from '@angular/core';
import type { CitizenSearchRepository } from '../repositories/citizen-search-repository';
import type { CitizenSearchResult } from '../models/citizen-summary';
import type { SearchCachePage } from '../../domain/contracts/backend-api';
import { backendConfig } from '../config/backend.config';
import { SessionContext } from './session-context';
import { ApiClient } from './api-client';
import { DataConnection } from './data-connection';
import { SearchCacheCipher } from './search-cache-cipher';

type SearchRecord = SearchCachePage['records'][number];
interface CacheMeta {
  epoch: string;
  revision: number;
  updatedAt: number;
}
interface CacheEntry {
  id: string;
  value: SearchRecord | CacheMeta;
}
const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
const MAX_CACHE_BYTES = 12 * 1024 * 1024;

@Service()
export class CachedCitizenSearch implements CitizenSearchRepository {
  private readonly api = inject(ApiClient);
  private readonly session = inject(SessionContext);
  private readonly connection = inject(DataConnection);
  private readonly index = signal<readonly SearchRecord[]>([]);
  private readonly cipher = new SearchCacheCipher();
  private owner: string | null = null;
  private meta: CacheMeta | null = null;
  private ready: Promise<void> = Promise.resolve();
  private syncing: Promise<void> | undefined;
  private remote = false;
  private generation = 0;

  constructor() {
    effect(() => {
      const owner = this.session.profile()?.actor.id ?? null;
      if (owner === this.owner) return;
      const previous = this.owner;
      this.owner = owner;
      const generation = ++this.generation;
      this.index.set([]);
      this.meta = null;
      this.remote = false;
      this.syncing = undefined;
      if (previous) void this.erase(previous);
      this.ready = owner ? this.initialize(owner, generation) : Promise.resolve();
      void this.ready.catch(() => {});
    });
    effect(() => {
      this.connection.revision();
      if (this.owner) void this.ready.then(() => this.synchronize()).catch(() => {});
    });
    const timer = setInterval(() => {
      if (this.owner && document.visibilityState === 'visible')
        void this.synchronize().catch(() => {});
    }, backendConfig.searchSyncIntervalMs);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  async search(query: string): Promise<readonly CitizenSearchResult[]> {
    const value = normalize(query.trim());
    if (value.length < 2) return [];
    // Dependência reativa: uma sincronização concluída atualiza os seletores já abertos.
    this.index();
    await this.ready;
    if (!this.owner) return [];
    if (this.remote) return this.api.call('searchCitizens', query, 100);
    const terms = value.split(/\s+/u);
    const digits = value.replace(/\D/gu, '');
    const phone = /^[\d\s()+.-]+$/u.test(value) && digits.length >= 2;
    return this.index()
      .filter(
        (person) =>
          terms.every((term) => person.searchText.includes(term)) ||
          (phone && person.searchText.includes(digits)),
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .slice(0, 100)
      .map(({ searchText: _text, ...person }) => person);
  }
  private async initialize(owner: string, generation: number): Promise<void> {
    // A versão anterior armazenava texto livre em claro. Não reutilizar esse índice.
    await this.deleteDatabase(`gabinete-search-v1-${owner}`);
    if (typeof indexedDB !== 'undefined' && typeof indexedDB.databases === 'function') {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases
            .filter(({ name }) => name?.startsWith('gabinete-search-v1-'))
            .map(({ name }) => this.deleteDatabase(name!)),
        );
      } catch {
        /* Outros navegadores permitem somente a limpeza do usuário atual. */
      }
    }
    try {
      const entries = await this.read(owner);
      if (generation !== this.generation) return;
      const meta = entries.find(({ id }) => id === '@meta')?.value as CacheMeta | undefined;
      if (meta && Date.now() - meta.updatedAt < backendConfig.searchCacheMaxAgeMs) {
        this.meta = meta;
        this.index.set(
          entries.filter(({ id }) => id !== '@meta').map(({ value }) => value as SearchRecord),
        );
      } else await this.erase(owner);
    } catch {
      await this.erase(owner);
    }
    if (generation === this.generation) await this.synchronize();
  }
  private synchronize(): Promise<void> {
    if (this.syncing) return this.syncing;
    if (!this.owner || this.remote) return Promise.resolve();
    const owner = this.owner;
    const generation = this.generation;
    this.syncing = this.sync(owner, generation).finally(() => {
      if (generation === this.generation) this.syncing = undefined;
    });
    return this.syncing;
  }
  private async sync(owner: string, generation: number): Promise<void> {
    const original = this.meta;
    let records = new Map(this.index().map((person) => [person.id, person]));
    let bytes = [...records.values()].reduce(
      (total, record) => total + JSON.stringify(record).length * 2,
      0,
    );
    const changed = new Map<string, SearchRecord>();
    const removed = new Set<string>();
    let page: string | null = null;
    let reset = false;
    let target: CacheMeta | null = null;
    for (let pages = 0; pages < 250; pages++) {
      const result: SearchCachePage = await this.api.call(
        'syncCitizenSearch',
        original?.epoch ?? null,
        original?.revision ?? 0,
        page,
      );
      if (generation !== this.generation) return;
      if (target && (result.epoch !== target.epoch || result.revision !== target.revision)) {
        records = new Map();
        bytes = 0;
        changed.clear();
        removed.clear();
        reset = true;
      }
      if (
        result.reset &&
        (!page || result.epoch !== target?.epoch || result.revision !== target?.revision)
      ) {
        records.clear();
        bytes = 0;
        changed.clear();
        removed.clear();
        reset = true;
      }
      result.removedIds.forEach((id) => {
        const previous = records.get(id);
        if (previous) bytes -= JSON.stringify(previous).length * 2;
        records.delete(id);
        changed.delete(id);
        removed.add(id);
      });
      result.records.forEach((person) => {
        const previous = records.get(person.id);
        if (previous) bytes -= JSON.stringify(previous).length * 2;
        bytes += JSON.stringify(person).length * 2;
        records.set(person.id, person);
        changed.set(person.id, person);
        removed.delete(person.id);
      });
      target = { epoch: result.epoch, revision: result.revision, updatedAt: Date.now() };
      if (records.size > backendConfig.searchCacheMaxRecords || bytes > MAX_CACHE_BYTES) {
        this.remote = true;
        this.index.set([]);
        this.meta = null;
        await this.erase(owner);
        return;
      }
      page = result.nextPage;
      if (!page) break;
      if (pages === 249)
        throw new Error('A sincronização precisa ser reiniciada. Tente novamente.');
    }
    if (!target || generation !== this.generation) return;
    try {
      await this.write(owner, target, reset, changed, removed);
    } catch {
      /* Falta de espaço não impede a consulta em memória. */
    }
    if (generation !== this.generation) {
      await this.erase(owner);
      return;
    }
    this.meta = target;
    this.remote = false;
    if (reset || changed.size || removed.size) this.index.set([...records.values()]);
  }
  private open(owner: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`gabinete-search-v2-${owner}`, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('records', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Cache indisponível.'));
    });
  }
  private async read(owner: string): Promise<CacheEntry[]> {
    const db = await this.open(owner);
    try {
      const encrypted = await new Promise<
        { id: string; value: Awaited<ReturnType<SearchCacheCipher['encrypt']>> }[]
      >((resolve, reject) => {
        const request = db
          .transaction('records')
          .objectStore('records')
          .getAll(undefined, backendConfig.searchCacheMaxRecords + 2);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (encrypted.length > backendConfig.searchCacheMaxRecords + 1)
        throw new Error('Cache excedido.');
      return await Promise.all(
        encrypted.map(async ({ id, value }) => ({
          id,
          value: (await this.cipher.decrypt(owner, value)) as CacheEntry['value'],
        })),
      );
    } finally {
      db.close();
    }
  }
  private async write(
    owner: string,
    meta: CacheMeta,
    reset: boolean,
    changed: ReadonlyMap<string, SearchRecord>,
    removed: ReadonlySet<string>,
  ): Promise<void> {
    // Criptografar antes de abrir a transação: await de WebCrypto a encerraria prematuramente.
    const encrypted = await Promise.all(
      [...changed].map(async ([id, value]) => ({
        id,
        value: await this.cipher.encrypt(owner, value),
      })),
    );
    const encryptedMeta = await this.cipher.encrypt(owner, meta);
    const db = await this.open(owner);
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('records', 'readwrite');
        const records = transaction.objectStore('records');
        if (reset) records.clear();
        encrypted.forEach((entry) => records.put(entry));
        removed.forEach((id) => records.delete(id));
        records.put({ id: '@meta', value: encryptedMeta });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      db.close();
    }
  }
  private erase(owner: string): Promise<void> {
    try {
      this.cipher.clear(owner);
    } catch {
      /* Armazenamento pode estar bloqueado. */
    }
    return this.deleteDatabase(`gabinete-search-v2-${owner}`);
  }
  private deleteDatabase(name: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') {
          resolve();
          return;
        }
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = request.onerror = request.onblocked = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}
