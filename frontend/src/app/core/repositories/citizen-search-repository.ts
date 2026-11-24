import { InjectionToken } from '@angular/core';
import type { CitizenSearchResult } from '../models/citizen-summary';

export interface CitizenSearchRepository {
  search(query: string): readonly CitizenSearchResult[];
}

export const CITIZEN_SEARCH_REPOSITORY = new InjectionToken<CitizenSearchRepository>(
  'CitizenSearchRepository',
);
