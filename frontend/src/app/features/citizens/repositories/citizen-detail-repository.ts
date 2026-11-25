import { InjectionToken } from '@angular/core';
import type { AsyncRepository } from '../../../domain/contracts/backend-api';
import type { CitizenDetailOperations } from '../../../domain/contracts/citizen-operations';
export type CitizenDetailRepository = AsyncRepository<CitizenDetailOperations>;
export const CITIZEN_DETAIL_REPOSITORY = new InjectionToken<CitizenDetailRepository>(
  'CitizenDetailRepository',
);
