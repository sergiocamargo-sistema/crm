import type { TeamProfile } from '../../../src/app/domain/contracts/backend-api';
import type { TeamUser } from '../../../src/app/core/models/collaboration';
import type { DatabaseReader } from '../ports/document-database';
import type { IdentityProvider, VerifiedIdentity } from '../ports/identity-provider';
import { ApplicationError } from './error';

export interface MemberAccess {
  readonly active: boolean;
  readonly email: string;
  readonly role: 'admin' | 'member';
  readonly name?: string;
  readonly handle?: string;
}

export interface RequestContext extends TeamProfile {
  readonly identity: VerifiedIdentity;
  readonly role: MemberAccess['role'];
}

export function validateAccess(identity: VerifiedIdentity, member: MemberAccess | null): void {
  if (
    !identity.emailVerified ||
    identity.provider !== 'google.com' ||
    member?.active !== true ||
    !['admin', 'member'].includes(member.role) ||
    member.email.trim().toLowerCase() !== identity.email.toLowerCase()
  ) {
    throw new ApplicationError(403, 'ACCESS_DENIED', 'Esta conta não tem acesso ao gabinete.');
  }
}

export class AccessService {
  private teamCache: { expires: number; users: readonly TeamUser[] } | undefined;
  constructor(
    private readonly identity: IdentityProvider,
    private readonly database: DatabaseReader,
  ) {}

  async authorize(token: string): Promise<RequestContext> {
    let identity: VerifiedIdentity;
    try {
      identity = await this.identity.verify(token);
    } catch {
      throw new ApplicationError(401, 'INVALID_SESSION', 'Entre novamente para continuar.');
    }
    const member = await this.database.get<MemberAccess>('teamAccess', identity.id);
    validateAccess(identity, member);
    const actor = this.toUser(identity.id, member!);
    if (!this.teamCache || this.teamCache.expires < Date.now()) {
      const members = await this.database.find<MemberAccess>('teamAccess');
      this.teamCache = {
        expires: Date.now() + 30_000,
        users: members
          .filter(({ value }) => value.active && ['admin', 'member'].includes(value.role))
          .map(({ id, value }) => this.toUser(id, value)),
      };
    }
    const users = [...this.teamCache.users.filter((user) => user.id !== actor.id), actor].sort(
      (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
    );
    return { identity, role: member!.role, actor, users };
  }

  private toUser(id: string, member: MemberAccess): TeamUser {
    const name = member.name?.trim() || member.email.split('@')[0] || 'Usuário';
    const parts = name.split(/\s+/u);
    return {
      id,
      name,
      handle:
        member.handle?.trim() ||
        `${name
          .normalize('NFD')
          .replace(/\p{M}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/gu, '.')
          .replace(/^\.|\.$/gu, '')}.${id.slice(0, 6).toLowerCase()}`,
      initials: [parts[0], ...(parts.length > 1 ? [parts.at(-1)] : [])]
        .map((part) => part?.[0] ?? '')
        .join('')
        .toUpperCase(),
    };
  }
}
