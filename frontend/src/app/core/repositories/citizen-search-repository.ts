import { InjectionToken } from '@angular/core';
import type { CitizenSummary } from '../models/citizen-summary';

export interface CitizenSearchRepository {
  search(query: string): readonly CitizenSummary[];
}

export const CITIZEN_SEARCH_REPOSITORY = new InjectionToken<CitizenSearchRepository>(
  'CitizenSearchRepository',
);
