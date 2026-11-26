import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FileStorage } from '../ports/file-storage';

/** Somente desenvolvimento local: arquivos e links somem ao encerrar o processo. */
export class MemoryFiles implements FileStorage {
  private readonly files = new Map<string, { content: Buffer; contentType: string }>();
  constructor(
    private readonly origin: string,
    private readonly secret: string,
  ) {}
  async write(path: string, content: Uint8Array, contentType: string): Promise<void> {
    this.files.set(path, { content: Buffer.from(content), contentType });
  }
  async remove(path: string): Promise<void> {
    this.files.delete(path);
  }
  async signedReadUrl(path: string, expiresAt: Date): Promise<string> {
    const expires = String(expiresAt.getTime());
    return `${this.origin}/local/files/${encodeURIComponent(path)}?expires=${expires}&signature=${this.signature(path, expires)}`;
  }
  read(url: URL): { readonly content: Buffer; readonly contentType: string } | null {
    if (url.origin !== this.origin || !url.pathname.startsWith('/local/files/')) return null;
    let path: string;
    try {
      path = decodeURIComponent(url.pathname.slice('/local/files/'.length));
    } catch {
      return null;
    }
    const expires = url.searchParams.get('expires') ?? '';
    const signature = url.searchParams.get('signature') ?? '';
    if (
      !/^\d+$/u.test(expires) ||
      Number(expires) <= Date.now() ||
      !/^[a-f0-9]{64}$/u.test(signature)
    )
      return null;
    if (
      !timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(this.signature(path, expires), 'hex'),
      )
    )
      return null;
    const file = this.files.get(path);
    return file ? { content: Buffer.from(file.content), contentType: file.contentType } : null;
  }
  private signature(path: string, expires: string): string {
    return createHmac('sha256', this.secret)
      .update(JSON.stringify([path, expires]))
      .digest('hex');
  }
}
