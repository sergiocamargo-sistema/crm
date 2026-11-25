export interface FileStorage {
  write(path: string, content: Uint8Array, contentType: string): Promise<void>;
  signedReadUrl(path: string, expiresAt: Date): Promise<string>;
  remove(path: string): Promise<void>;
}
