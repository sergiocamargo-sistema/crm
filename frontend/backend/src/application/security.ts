import { createHash, randomUUID } from 'node:crypto';
import type { BackendOperation } from '../../../src/app/domain/contracts/backend-api';
import type { DocumentDatabase, DatabaseTransaction } from '../ports/document-database';
import type { MemberAccess, RequestContext } from './access';
import { ApplicationError } from './error';

export const permissions = [
  'records.read',
  'records.write',
  'catalogs.manage',
  'automations.manage',
  'labels.manage',
  'labels.print',
  'files.upload',
  'search.sync',
] as const;
export type Permission = (typeof permissions)[number];
export const memberPermissions: readonly Permission[] = [
  'records.read',
  'records.write',
  'files.upload',
  'search.sync',
];

export function grantedPermissions(member: MemberAccess): readonly Permission[] {
  // Uma lista explícita substitui o perfil, inclusive para um administrador.
  return member.permissions ?? (member.role === 'admin' ? permissions : memberPermissions);
}
export function requirePermission(member: MemberAccess, permission: Permission): void {
  if (!grantedPermissions(member).includes(permission))
    throw new ApplicationError(
      403,
      'PERMISSION_DENIED',
      'Sua conta não tem permissão para esta operação.',
    );
}

/** Contagem compartilhada entre instâncias, sem IP/token/dados pessoais nos documentos. */
export class RequestQuota {
  constructor(private readonly database: DocumentDatabase) {}
  async consume(userId: string, scope: string, maximum: number, cost = 1): Promise<void> {
    const minute = Math.floor(Date.now() / 60_000);
    const id = createHash('sha256').update(`${userId}:${scope}:${minute}`).digest('hex');
    const accepted = await this.database.atomic(async (transaction) => {
      const previous = await transaction.get<{ count: number }>('crmRateLimits', id);
      const count = (previous?.count ?? 0) + cost;
      if (count > maximum) return false;
      transaction.put('crmRateLimits', id, {
        count,
        expiresAt: new Date((minute + 2) * 60_000).toISOString(),
      });
      return true;
    });
    if (!accepted)
      throw new ApplicationError(429, 'RATE_LIMIT', 'Aguarde um minuto antes de continuar.');
  }
}

export interface AuditEntry {
  readonly actorId: string;
  readonly operation: string;
  readonly outcome: 'attempt' | 'committed' | 'returned' | 'denied';
  readonly traceId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly count?: number;
  readonly revision?: number;
  readonly resourceIds?: readonly string[];
}
export function auditEntry(
  context: RequestContext,
  operation: string,
  outcome: AuditEntry['outcome'],
  details: Pick<AuditEntry, 'count' | 'revision'> = {},
): AuditEntry {
  return {
    actorId: context.identity.id,
    operation,
    outcome,
    traceId: context.traceId ?? randomUUID(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 86_400_000).toISOString(),
    ...details,
    ...(context.resourceIds?.length ? { resourceIds: context.resourceIds } : {}),
  };
}
export function appendAudit(transaction: DatabaseTransaction, entry: AuditEntry): void {
  transaction.put('crmSecurityAudit', randomUUID(), entry);
}
export async function recordAudit(database: DocumentDatabase, entry: AuditEntry): Promise<void> {
  await database.atomic(async (transaction) => appendAudit(transaction, entry));
}

/** Limite barato antes de consultas externas; complementa, não substitui, um WAF na borda. */
export class AdmissionLimiter {
  private readonly windows = new Map<string, { minute: number; count: number }>();
  private total = { minute: 0, count: 0 };
  accept(remoteAddress?: string): void {
    const minute = Math.floor(Date.now() / 60_000);
    if (this.total.minute !== minute) {
      this.total = { minute, count: 0 };
      this.windows.clear();
    }
    if (++this.total.count > 1200) this.deny();
    // A chave vem exclusivamente do adaptador HTTP, nunca de um header escolhido pelo cliente.
    if (!remoteAddress) return;
    const id = createHash('sha256').update(remoteAddress).digest('hex');
    const window = this.windows.get(id) ?? { minute, count: 0 };
    if (++window.count > 300) this.deny();
    this.windows.set(id, window);
  }
  private deny(): never {
    throw new ApplicationError(429, 'RATE_LIMIT', 'Muitas requisições. Aguarde um minuto.');
  }
}

export function operationPermission(operation: BackendOperation): Permission {
  return operationPermissions[operation];
}

// A lista fechada abaixo é verificada pelo TypeScript ao adicionar uma operação à API.
const operationPermissions = {
  loadCitizenRegistration: 'records.read',
  createCitizen: 'records.write',
  loadCitizenForEdit: 'records.read',
  updateCitizen: 'records.write',
  listTaskLabels: 'records.read',
  loadTaskLabelManagement: 'records.read',
  saveTaskLabel: 'catalogs.manage',
  deleteTaskLabel: 'catalogs.manage',
  loadRequestList: 'records.read',
  loadKanbanWorkspace: 'records.read',
  saveKanbanTask: 'records.write',
  loadTaskCollaboration: 'records.read',
  addTaskComment: 'records.write',
  addTaskAttachments: 'records.write',
  listTextReferences: 'records.read',
  moveKanbanTask: 'records.write',
  positionKanbanTask: 'records.write',
  assignKanbanTaskColumn: 'records.write',
  createKanbanColumn: 'catalogs.manage',
  loadCitizenList: 'records.read',
  prepareLabelRecipients: 'labels.print',
  loadDetail: 'records.read',
  loadActivityDetail: 'records.read',
  saveRequest: 'records.write',
  createRequest: 'records.write',
  loadRequestWorkspace: 'records.read',
  listRequestAutomationPlans: 'records.read',
  startRequestAutomation: 'records.write',
  loadCitizenTimeline: 'records.read',
  listDepartments: 'records.read',
  searchDepartments: 'records.read',
  saveDepartment: 'catalogs.manage',
  deleteDepartment: 'catalogs.manage',
  listRequestPatterns: 'records.read',
  loadRequestPatternManagement: 'records.read',
  saveRequestPattern: 'catalogs.manage',
  deleteRequestPattern: 'catalogs.manage',
  assignRequestDepartment: 'records.write',
  createAndAssignDepartment: 'catalogs.manage',
  assignRequestPattern: 'records.write',
  addRequestComment: 'records.write',
  addRequestTask: 'records.write',
  addRequestAttachments: 'records.write',
  addRequestAwareness: 'records.write',
  removeRequestAwareness: 'records.write',
  registerRequestContact: 'records.write',
  setRequestTaskCompleted: 'records.write',
  registerContact: 'records.write',
  saveObservations: 'records.write',
  saveCabinetRating: 'records.write',
  loadCitizenCategories: 'records.read',
  createCitizenCategory: 'catalogs.manage',
  addCategory: 'records.write',
  removeCategory: 'records.write',
  loadAutomationWorkspace: 'records.read',
  saveAutomationTemplate: 'automations.manage',
  deleteAutomationTemplate: 'automations.manage',
  saveAutomationSet: 'automations.manage',
  deleteAutomationSet: 'automations.manage',
  saveAutomationRule: 'automations.manage',
  deleteAutomationRule: 'automations.manage',
  retryAutomationRun: 'automations.manage',
  searchCitizens: 'records.read',
  loadWorkspaceVersion: 'records.read',
  loadTeam: 'records.read',
  loadLabelConfiguration: 'records.read',
  saveLabelTemplate: 'labels.manage',
  saveLabelFormat: 'labels.manage',
  loadReferralBranch: 'records.read',
  loadNotifications: 'records.read',
  markNotificationRead: 'records.write',
  markAllNotificationsRead: 'records.write',
  loadHomeMessage: 'records.read',
  syncCitizenSearch: 'search.sync',
} satisfies Record<BackendOperation, Permission>;
