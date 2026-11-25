import { createState, type StateCell, type StateFactory } from './state-cell';
import {
  type LabelConfiguration,
  type LabelField,
  type LabelFormat,
  type LabelTemplate,
} from '../features/labels/models/label-print';
import catalog from '../features/labels/data/pimaco-formats.json';

const INITIAL_LABEL_TEMPLATE: LabelTemplate = {
  id: 'template-name-address',
  version: 1,
  name: 'Nome e endereço',
  font: 'helvetica',
  fontSize: 9,
  align: 'left',
  padding: 2,
  blocks: ['name', 'street', 'complement', 'neighborhood', 'cityState', 'postalCode'].map(
    (field, index) => ({
      id: `block-${index}`,
      field: field as LabelField,
      text: '',
      bold: field === 'name',
      joinPrevious: false,
    }),
  ),
};
const INITIAL_CUSTOM_FORMAT: LabelFormat = {
  id: 'custom',
  version: 0,
  name: 'Formato personalizado',
  origin: 'custom',
  source: '',
  paperWidth: 210,
  paperHeight: 297,
  width: 99,
  height: 38.1,
  left: 4.7,
  top: 15.2,
  gapX: 2.6,
  gapY: 0,
  columns: 2,
  rows: 7,
};

export interface LabelState {
  readonly templates: readonly LabelTemplate[];
  readonly customFormats: readonly LabelFormat[];
  readonly templateHistory: readonly LabelTemplate[];
  readonly formatHistory: readonly LabelFormat[];
}

export const initialLabelState = (): LabelState => ({
  templates: [structuredClone(INITIAL_LABEL_TEMPLATE)],
  customFormats: [],
  templateHistory: [],
  formatHistory: [],
});

export class LabelPrintEngine {
  private readonly templates: StateCell<readonly LabelTemplate[]>;
  private readonly customFormats: StateCell<readonly LabelFormat[]>;
  private readonly templateHistory: LabelTemplate[];
  private readonly formatHistory: LabelFormat[];

  constructor(initial: LabelState = initialLabelState(), state: StateFactory = createState) {
    this.templates = state(initial.templates);
    this.customFormats = state(initial.customFormats);
    this.templateHistory = [...initial.templateHistory];
    this.formatHistory = [...initial.formatHistory];
  }

  snapshot(): LabelState {
    return {
      templates: this.templates(),
      customFormats: this.customFormats(),
      templateHistory: this.templateHistory,
      formatHistory: this.formatHistory,
    };
  }
  private readonly officialFormats: readonly LabelFormat[] = catalog.formats.flatMap((group) =>
    group.codes.map((code) => ({
      id: `pimaco-${code.replace(/\s/g, '')}-${group.columns}`,
      version: 1,
      name: `Pimaco ${code} · ${group.columns} × ${group.rows} · ${group.family}`,
      origin: 'pimaco' as const,
      source: catalog.sources[group.source],
      paperWidth: group.paperWidth,
      paperHeight: group.paperHeight,
      width: group.width,
      height: group.height,
      left: group.left,
      top: group.top,
      gapX: group.gapX,
      gapY: group.gapY,
      columns: group.columns,
      rows: group.rows,
    })),
  );
  loadConfiguration(): LabelConfiguration {
    return {
      defaultFormatId: 'pimaco-6182-2',
      defaultTemplate: this.templates()[0] ?? INITIAL_LABEL_TEMPLATE,
      customFormatDraft: INITIAL_CUSTOM_FORMAT,
      templates: this.templates(),
      formats: [...this.officialFormats, ...this.customFormats()],
    };
  }
  saveTemplate(template: LabelTemplate, asNew: boolean): LabelTemplate {
    const existing = this.templates().find((item) => item.id === template.id);
    if (!asNew && (!existing || existing.version !== template.version))
      throw new Error('O modelo foi atualizado. Selecione-o novamente antes de salvar.');
    if (
      this.templates().some(
        (item) =>
          (asNew || item.id !== template.id) &&
          item.name.toLocaleLowerCase('pt-BR') === template.name.trim().toLocaleLowerCase('pt-BR'),
      )
    )
      throw new Error('Já existe um modelo com esse nome.');
    const saved = {
      ...template,
      id: asNew ? `template-${crypto.randomUUID()}` : template.id,
      version: asNew ? 1 : template.version + 1,
      name: template.name.trim(),
    };
    if (existing && !asNew) this.templateHistory.push(existing);
    this.templates.update((items) =>
      asNew ? [...items, saved] : items.map((item) => (item.id === saved.id ? saved : item)),
    );
    return saved;
  }
  saveFormat(format: LabelFormat): LabelFormat {
    const existing = this.customFormats().find((item) => item.id === format.id);
    if (existing && existing.version !== format.version)
      throw new Error('Este formato foi atualizado. Selecione-o novamente.');
    const saved: LabelFormat = {
      ...format,
      id: existing?.id ?? `format-${crypto.randomUUID()}`,
      origin: 'custom',
      version: (existing?.version ?? 0) + 1,
      source: '',
      name: format.name.trim(),
    };
    if (existing) this.formatHistory.push(existing);
    this.customFormats.update((items) =>
      existing ? items.map((item) => (item.id === saved.id ? saved : item)) : [...items, saved],
    );
    return saved;
  }
}
