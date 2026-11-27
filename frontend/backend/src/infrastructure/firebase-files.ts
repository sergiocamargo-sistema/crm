import { getStorage } from 'firebase-admin/storage';
import type { FileStorage } from '../ports/file-storage';

export class FirebaseFiles implements FileStorage {
  async write(path: string, content: Uint8Array, contentType: string): Promise<void> {
    await getStorage()
      .bucket()
      .file(path)
      .save(Buffer.from(content), {
        resumable: false,
        contentType,
        metadata: {
          cacheControl: 'private, no-store',
          contentDisposition: /^(image|audio)\//u.test(contentType) ? 'inline' : 'attachment',
        },
      });
  }

  async signedReadUrl(path: string, expiresAt: Date, contentType?: string): Promise<string> {
    const [url] = await getStorage()
      .bucket()
      .file(path)
      .getSignedUrl({
        action: 'read',
        expires: expiresAt,
        responseDisposition:
          contentType && /^(image|audio)\//u.test(contentType) ? 'inline' : 'attachment',
        ...(contentType ? { responseType: contentType } : {}),
      });
    return url;
  }

  async remove(path: string): Promise<void> {
    await getStorage().bucket().file(path).delete({ ignoreNotFound: true });
  }
}
