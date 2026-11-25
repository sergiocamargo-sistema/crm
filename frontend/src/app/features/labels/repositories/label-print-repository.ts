import { InjectionToken } from '@angular/core';
import type { LabelConfiguration, LabelFormat, LabelTemplate } from '../models/label-print';
export interface LabelPrintRepository {
  loadConfiguration(): Promise<LabelConfiguration>;
  saveTemplate(template: LabelTemplate, asNew: boolean): Promise<LabelTemplate>;
  saveFormat(format: LabelFormat): Promise<LabelFormat>;
}

export const LABEL_PRINT_REPOSITORY = new InjectionToken<LabelPrintRepository>(
  'LabelPrintRepository',
);
