export const LABEL_FIELDS = [
  { value: 'name', label: 'Nome' },
  { value: 'street', label: 'Logradouro e número' },
  { value: 'complement', label: 'Complemento' },
  { value: 'neighborhood', label: 'Bairro' },
  { value: 'cityState', label: 'Cidade / UF' },
  { value: 'postalCode', label: 'CEP' },
  { value: 'phone', label: 'Telefone' },
  { value: 'cra', label: 'CRA' },
  { value: 'categories', label: 'Categorias' },
  { value: 'observations', label: 'Observação' },
  { value: 'birthday', label: 'Aniversário' },
  { value: 'text', label: 'Texto fixo' },
] as const;
export type LabelField = (typeof LABEL_FIELDS)[number]['value'];
export interface LabelBlock {
  readonly id: string;
  readonly field: LabelField;
  readonly text: string;
  readonly bold: boolean;
  readonly joinPrevious: boolean;
}
export interface LabelTemplate {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly font: 'helvetica' | 'times' | 'courier';
  readonly fontSize: number;
  readonly align: 'left' | 'center' | 'right';
  readonly padding: number;
  readonly blocks: readonly LabelBlock[];
}
export interface LabelFormat {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly origin: 'pimaco' | 'custom';
  readonly source: string;
  readonly paperWidth: number;
  readonly paperHeight: number;
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly columns: number;
  readonly rows: number;
}
export interface LabelRecipient {
  readonly id: string;
  readonly name: string;
  readonly street: string;
  readonly complement: string;
  readonly neighborhood: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly phone: string;
  readonly cra: string;
  readonly categories: readonly string[];
  readonly observations: string;
  readonly birthDate: string | null;
}
export interface LabelJob {
  readonly recipients: readonly LabelRecipient[];
  readonly template: LabelTemplate;
  readonly format: LabelFormat;
  readonly copies: number;
  readonly startAt: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly guides: boolean;
}
export interface LabelPdf {
  readonly bytes: Uint8Array;
  readonly pages: number;
  readonly labels: number;
}
export interface LabelConfiguration {
  readonly defaultFormatId: string;
  readonly defaultTemplate: LabelTemplate;
  readonly customFormatDraft: LabelFormat;
  readonly templates: readonly LabelTemplate[];
  readonly formats: readonly LabelFormat[];
}
