import { getAppCheck } from 'firebase-admin/app-check';
import type { AppAttestation } from '../ports/app-attestation';

export class FirebaseAttestation implements AppAttestation {
  constructor(private readonly appId: string) {}
  async verify(token: string): Promise<void> {
    const verified = await getAppCheck().verifyToken(token);
    if (verified.appId !== this.appId) throw new Error('Aplicação não autorizada.');
  }
}
