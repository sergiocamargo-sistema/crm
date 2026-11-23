import type { DepartmentOption } from './department-options';
import type { RequestPattern } from './request-detail';

export interface RequestPatternListItem extends RequestPattern {
  readonly departmentLabel: string;
  readonly requestCount: number;
}

export interface RequestPatternManagementResult {
  readonly items: readonly RequestPatternListItem[];
  readonly total: number;
  readonly departments: readonly DepartmentOption[];
}
