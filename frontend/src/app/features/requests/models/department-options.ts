import type { Department } from './request-detail';

export interface DepartmentOption extends Department {
  readonly label: string;
}

export function departmentOptions(departments: readonly Department[]): readonly DepartmentOption[] {
  const byParent = new Map<string | null, Department[]>();
  for (const department of departments) {
    const parentId = department.parentId;
    const siblings = byParent.get(parentId) ?? [];
    siblings.push(department);
    byParent.set(parentId, siblings);
  }

  function walk(parentId: string | null, parentLabel: string): DepartmentOption[] {
    const siblings = byParent.get(parentId) ?? [];
    return siblings
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .flatMap((department) => {
        const label = parentLabel ? `${parentLabel} › ${department.name}` : department.name;
        return [{ ...department, label }, ...walk(department.id, label)];
      });
  }

  return walk(null, '');
}

export function departmentScopeIds(
  departments: readonly Department[],
  selectedIds: readonly string[],
): ReadonlySet<string> {
  const children = new Map<string, string[]>();
  for (const { id, parentId } of departments) {
    if (parentId === null) continue;
    const siblings = children.get(parentId) ?? [];
    siblings.push(id);
    children.set(parentId, siblings);
  }
  const scope = new Set(selectedIds);
  const pending = [...scope];
  while (pending.length) {
    const parent = pending.pop()!;
    for (const child of children.get(parent) ?? []) {
      if (!scope.has(child)) {
        scope.add(child);
        pending.push(child);
      }
    }
  }
  return scope;
}
