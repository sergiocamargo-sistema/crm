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
        metadata: { cacheControl: 'private, max-age=300' },
      });
  }

  async signedReadUrl(path: string, expiresAt: Date): Promise<string> {
    const [url] = await getStorage()
      .bucket()
      .file(path)
      .getSignedUrl({ action: 'read', expires: expiresAt });
    return url;
  }

  async remove(path: string): Promise<void> {
    await getStorage().bucket().file(path).delete({ ignoreNotFound: true });
  }
}
