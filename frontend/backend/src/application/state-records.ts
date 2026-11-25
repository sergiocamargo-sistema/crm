import { ApplicationError } from './error';
import { createHash } from 'node:crypto';
import { emptyCrmState, type CrmState } from '../../../src/app/domain/crm-engine';
import { initialLabelState, type LabelState } from '../../../src/app/domain/label-print';

export interface WorkspaceState {
  readonly crm: CrmState;
  readonly labels: LabelState;
}
export interface StateRecord {
  readonly group: string;
  readonly key: string;
  readonly position: number;
  readonly value: unknown;
  readonly empty?: boolean;
}
export const recordId = (group: string, key: string): string =>
  createHash('sha256')
    .update(JSON.stringify([group, key]))
    .digest('hex');
export const emptyWorkspace = (): WorkspaceState => ({
  crm: emptyCrmState(),
  labels: initialLabelState(),
});

/** Um registro por entidade; históricos, comentários e anexos não crescem no documento do pai. */
export function encodeState(
  state: WorkspaceState,
  previous: ReadonlyMap<string, StateRecord> = new Map(),
): Map<string, StateRecord> {
  const records = new Map<string, StateRecord>();
  const put = (group: string, key: string, value: unknown, position = 0): void => {
    const record = { group, key, value: JSON.parse(JSON.stringify(value)) as unknown, position };
    if (Buffer.byteLength(JSON.stringify(record)) > 700_000)
      throw new ApplicationError(
        413,
        'RECORD_TOO_LARGE',
        'Este registro excede o tamanho permitido. Divida o conteúdo.',
      );
    records.set(recordId(group, key), record);
  };
  const table = (group: string, values: readonly unknown[]): void => {
    if (!values.length) {
      records.set(recordId(group, '@empty'), {
        group,
        key: '@empty',
        value: null,
        position: -1,
        empty: true,
      });
      return;
    }
    const keys = values.map((value, index) => {
      if (typeof value === 'string') return value;
      const item = value as { id?: string; version?: number; record?: { id: string } };
      const key = item.id ?? item.record?.id ?? String(index);
      return group.startsWith('labels.') && group.endsWith('History')
        ? `${key}:${item.version ?? index}`
        : key;
    });
    // Ordinais estáveis: inserir no início não regrava todos os registros seguintes.
    const positions = keys.map((key) => previous.get(recordId(group, key))?.position);
    for (let index = 0; index < positions.length; index++) {
      if (positions[index] !== undefined) continue;
      const left = index > 0 ? positions[index - 1] : undefined;
      const right = positions.slice(index + 1).find((position) => position !== undefined);
      positions[index] =
        left === undefined
          ? right === undefined
            ? index
            : right - 1
          : right === undefined
            ? left + 1
            : (left + right) / 2;
    }
    values.forEach((value, index) => put(group, keys[index], value, positions[index]));
  };
  for (const [key, value] of Object.entries(state.crm)) {
    if (key === 'automation') {
      for (const [name, items] of Object.entries(state.crm.automation))
        table(`crm.automation.${name}`, items);
    } else if (key === 'registration') {
      for (const [name, items] of Object.entries(state.crm.registration))
        items.forEach((entry, position) => put(`crm.registration.${name}`, entry[0], entry, 0));
    } else if (
      [
        'profileEdits',
        'taskComments',
        'taskAttachments',
        'contacts',
        'requestContacts',
        'requestExtras',
      ].includes(key)
    ) {
      for (const [owner, data] of Object.entries(value as Record<string, unknown>)) {
        if (key === 'requestExtras') {
          const meta: Record<string, unknown> = {};
          for (const [field, nested] of Object.entries(data as Record<string, unknown>)) {
            if (Array.isArray(nested)) table(`crm.${key}.${owner}.${field}`, nested);
            else meta[field] = nested;
          }
          put(`crm.${key}`, owner, meta);
        } else if (Array.isArray(data)) table(`crm.${key}.${owner}`, data);
        else put(`crm.${key}`, owner, data);
      }
    } else if (Array.isArray(value)) table(`crm.${key}`, value);
    else if (key === 'kanbanOrder') {
      for (const [view, ids] of Object.entries(state.crm.kanbanOrder))
        for (let index = 0; index < ids.length; index += 500)
          put(`crm.kanbanOrder.${view}`, String(index), ids.slice(index, index + 500), index);
    } else put('config', key, value);
  }
  for (const [key, values] of Object.entries(state.labels)) table(`labels.${key}`, values);
  return records;
}

export function decodeState(records: ReadonlyMap<string, StateRecord>): WorkspaceState {
  const workspace = emptyWorkspace();
  // A forma vem apenas de registros gerados pelo servidor; os argumentos da API não chegam aqui.
  const root = workspace as unknown as Record<string, unknown>;
  const groups = new Map<string, StateRecord[]>();
  for (const item of records.values())
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  for (const [group, items] of [...groups].sort(
    ([a], [b]) => a.split('.').length - b.split('.').length,
  )) {
    items.sort((a, b) => a.position - b.position);
    if (group === 'config') {
      for (const item of items) (root['crm'] as Record<string, unknown>)[item.key] = item.value;
      continue;
    }
    const parts = group.split('.');
    const last = parts.pop()!;
    let target = root;
    for (const part of parts) {
      if (target[part] === undefined) target[part] = {};
      target = target[part] as Record<string, unknown>;
    }
    if (['crm.profileEdits', 'crm.requestExtras'].includes(group))
      target[last] = Object.fromEntries(items.map((item) => [item.key, item.value]));
    else if (group.startsWith('crm.kanbanOrder.'))
      target[last] = items.flatMap((item) => item.value as string[]);
    else target[last] = items.filter((item) => !item.empty).map((item) => item.value);
  }
  return workspace;
}
