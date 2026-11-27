interface EncryptedCacheValue {
  readonly version: 2;
  readonly iv: string;
  readonly ciphertext: string;
}
const encode = (bytes: Uint8Array): string => {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
};
const decode = (value: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
function sessionCacheStorage(): Storage | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}

/** A chave fica na sessão da aba; nunca junto dos registros no IndexedDB. */
export class SearchCacheCipher {
  private readonly keys = new Map<string, Promise<CryptoKey>>();
  constructor(private readonly storage: Storage | undefined = sessionCacheStorage()) {}

  async encrypt(owner: string, value: unknown): Promise<EncryptedCacheValue> {
    const key = await this.key(owner);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(owner) },
      key,
      new TextEncoder().encode(JSON.stringify(value)),
    );
    return { version: 2, iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) };
  }
  async decrypt(owner: string, envelope: EncryptedCacheValue): Promise<unknown> {
    if (envelope.version !== 2) throw new Error('Versão antiga do cache.');
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: decode(envelope.iv), additionalData: new TextEncoder().encode(owner) },
      await this.key(owner),
      decode(envelope.ciphertext),
    );
    return JSON.parse(new TextDecoder().decode(plaintext)) as unknown;
  }
  clear(owner: string): void {
    this.keys.delete(owner);
    this.storage?.removeItem(this.storageKey(owner));
  }
  private key(owner: string): Promise<CryptoKey> {
    let key = this.keys.get(owner);
    if (!key) {
      const storageKey = this.storageKey(owner);
      const saved = this.storage?.getItem(storageKey);
      const raw = saved ? decode(saved) : crypto.getRandomValues(new Uint8Array(32));
      if (raw.length !== 32) throw new Error('Chave de cache inválida.');
      if (!saved) this.storage?.setItem(storageKey, encode(raw));
      key = crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
      this.keys.set(owner, key);
    }
    return key;
  }
  private storageKey(owner: string): string {
    return `gabinete-search-key-v2-${owner}`;
  }
}
