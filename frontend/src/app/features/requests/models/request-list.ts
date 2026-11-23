import type { CitizenRequest } from '../../citizens/models/citizen-detail';

export interface RequestListItem extends Pick<
  CitizenRequest,
  'id' | 'title' | 'description' | 'protocol' | 'status' | 'createdAt' | 'department'
> {
  readonly departmentId: string;
  readonly citizen: { readonly id: string; readonly name: string } | null;
}

export interface RequestListQuery {
  readonly text: string;
  readonly status: '' | CitizenRequest['status'];
  readonly departmentId: string;
  readonly order: 'recent' | 'oldest';
}

export interface RequestListResult {
  readonly items: readonly RequestListItem[];
  readonly total: number;
}

export const initialRequestListQuery = (): RequestListQuery => ({
  text: '',
  status: '',
  departmentId: '',
  order: 'recent',
});
