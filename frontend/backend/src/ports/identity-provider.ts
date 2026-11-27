export interface VerifiedIdentity {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly provider: string;
  readonly emailVerified: boolean;
  readonly authenticatedAt?: number;
}

export interface IdentityProvider {
  verify(token: string): Promise<VerifiedIdentity>;
}
