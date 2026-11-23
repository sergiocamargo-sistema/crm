import { Service, signal } from '@angular/core';
import { adjacentDay, reportDay } from '../models/work-hours';

@Service()
export class WorkHoursStore {
  readonly query = signal({ day: adjacentDay(reportDay(Date.now()), -1), userId: '' });
}
