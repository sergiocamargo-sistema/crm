import { Service, signal } from '@angular/core';
import type { TeamProfile } from '../../domain/contracts/backend-api';

@Service()
export class SessionContext {
  readonly profile = signal<TeamProfile | null>(null);
  set(profile: TeamProfile | null): void {
    this.profile.set(profile);
  }
  require(): TeamProfile {
    const profile = this.profile();
    if (!profile) throw new Error('Entre novamente para continuar.');
    return profile;
  }
}
