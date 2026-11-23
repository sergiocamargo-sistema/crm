import { InjectionToken } from '@angular/core';
import type { LabelConfiguration, LabelFormat, LabelTemplate } from '../models/label-print';
export interface LabelPrintRepository {
  loadConfiguration(): LabelConfiguration;
  saveTemplate(template: LabelTemplate, asNew: boolean): LabelTemplate;
  saveFormat(format: LabelFormat): LabelFormat;
}

export const LABEL_PRINT_REPOSITORY = new InjectionToken<LabelPrintRepository>(
  'LabelPrintRepository',
);
