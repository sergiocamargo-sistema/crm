import { computed, inject, Service, signal, type Signal } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../citizens/repositories/citizen-detail-repository';
import { LABEL_PRINT_REPOSITORY } from '../repositories/label-print-repository';
import type {
  LabelConfiguration,
  LabelFormat,
  LabelJob,
  LabelRecipient,
  LabelTemplate,
} from '../models/label-print';
import { ReadStore, RemoteReadStore } from '../../../core/stores/read-store';
import { labelFormatError, labelTemplateError } from '../models/label-layout';
@Service()
export class LabelPrintService {
  private readonly citizens = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly repository = inject(LABEL_PRINT_REPOSITORY);
  private readonly configuration = signal<LabelConfiguration | null>(null);
  readonly configurationStore = new ReadStore(
    computed(() => {
      const configuration = this.configuration();
      if (!configuration)
        throw new Error('Carregue a configuração de impressão antes de abrir o editor.');
      return configuration;
    }),
  );
  async initialize(): Promise<void> {
    this.configuration.set(await this.repository.loadConfiguration());
  }
  observeRecipients(selection: Signal<string>) {
    return new RemoteReadStore(
      async () => {
        const ids = [
          ...new Set(
            selection()
              .split(',')
              .map((id) => id.trim())
              .filter(Boolean),
          ),
        ];
        const recipients: LabelRecipient[] = [];
        // A seleção inteira pode ser impressa; cada lote transfere só os campos de impressão.
        for (let offset = 0; offset < ids.length; offset += 200)
          recipients.push(
            ...(await this.citizens.prepareLabelRecipients(ids.slice(offset, offset + 200))),
          );
        return { recipients, error: '' };
      },
      { recipients: [] as LabelRecipient[], error: '' },
      selection,
    );
  }
  async saveTemplate(template: LabelTemplate, asNew: boolean): Promise<LabelTemplate> {
    const error = labelTemplateError(template);
    if (error) throw new Error(error);
    const result = await this.repository.saveTemplate(template, asNew);
    await this.initialize();
    return result;
  }
  async saveFormat(format: LabelFormat): Promise<LabelFormat> {
    const error = labelFormatError(format);
    if (error) throw new Error(error);
    if (!format.name.trim() || format.name.length > 80)
      throw new Error('Informe um nome de formato de até 80 caracteres.');
    const result = await this.repository.saveFormat(format);
    await this.initialize();
    return result;
  }
  async generate(job: LabelJob) {
    const { createLabelPdf } = await import('./label-pdf');
    return createLabelPdf(job);
  }
}
