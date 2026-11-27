/** Prova da aplicação independente do provedor de identidade e do banco. */
export interface AppAttestation {
  verify(token: string): Promise<void>;
}
