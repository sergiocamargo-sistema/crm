import { computed, inject, Service, type Signal } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import { LABEL_PRINT_REPOSITORY } from '../repositories/label-print-repository';
import type { LabelFormat, LabelJob, LabelTemplate } from '../models/label-print';
import { ReadStore } from '../../../core/stores/read-store';
import { labelFormatError, labelTemplateError } from '../models/label-layout';
@Service()
export class LabelPrintService {
  private readonly citizens = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly repository = inject(LABEL_PRINT_REPOSITORY);
  readonly configurationStore = new ReadStore(computed(() => this.repository.loadConfiguration()));
  observeRecipients(selection: Signal<string>) {
    return new ReadStore(
      computed(() => {
        try {
          const ids = [
            ...new Set(
              selection()
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean),
            ),
          ];
          return { recipients: this.citizens.prepareLabelRecipients(ids), error: '' };
        } catch (error: unknown) {
          return {
            recipients: [],
            error:
              error instanceof Error
                ? error.message
                : 'Não foi possível preparar os destinatários.',
          };
        }
      }),
    );
  }
  saveTemplate(template: LabelTemplate, asNew: boolean): LabelTemplate {
    const error = labelTemplateError(template);
    if (error) throw new Error(error);
    return this.repository.saveTemplate(template, asNew);
  }
  saveFormat(format: LabelFormat): LabelFormat {
    const error = labelFormatError(format);
    if (error) throw new Error(error);
    if (!format.name.trim() || format.name.length > 80)
      throw new Error('Informe um nome de formato de até 80 caracteres.');
    return this.repository.saveFormat(format);
  }
  async generate(job: LabelJob) {
    const { createLabelPdf } = await import('./label-pdf');
    return createLabelPdf(job);
  }
}
