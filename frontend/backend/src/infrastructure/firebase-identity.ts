import { getAuth } from 'firebase-admin/auth';
import type { IdentityProvider, VerifiedIdentity } from '../ports/identity-provider';

export class FirebaseIdentity implements IdentityProvider {
  async verify(token: string): Promise<VerifiedIdentity> {
    const identity = await getAuth().verifyIdToken(token, true);
    return {
      id: identity.uid,
      email: identity.email ?? '',
      name: typeof identity['name'] === 'string' ? identity['name'] : (identity.email ?? ''),
      provider: identity.firebase.sign_in_provider,
      emailVerified: identity.email_verified === true,
      authenticatedAt: identity.auth_time,
    };
  }
}
