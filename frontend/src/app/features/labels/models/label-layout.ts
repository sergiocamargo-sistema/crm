import {
  LABEL_FIELDS,
  type LabelFormat,
  type LabelJob,
  type LabelRecipient,
  type LabelTemplate,
} from './label-print';

export function labelFormatError(format: LabelFormat, offsetX = 0, offsetY = 0): string {
  const values = [
    format.paperWidth,
    format.paperHeight,
    format.width,
    format.height,
    format.left,
    format.top,
    format.gapX,
    format.gapY,
    format.columns,
    format.rows,
    offsetX,
    offsetY,
  ];
  if (values.some((value) => !Number.isFinite(value))) return 'Informe medidas numéricas válidas.';
  if (
    [format.paperWidth, format.paperHeight, format.width, format.height].some((value) => value <= 0)
  )
    return 'Informe dimensões positivas para a folha e a etiqueta.';
  if (format.paperWidth > 1200 || format.paperHeight > 1200)
    return 'A folha deve ter até 1.200 mm por dimensão.';
  if ([format.left, format.top, format.gapX, format.gapY].some((value) => value < 0))
    return 'Margens e espaçamentos não podem ser negativos.';
  if (
    ![format.columns, format.rows].every(
      (value) => Number.isInteger(value) && value >= 1 && value <= 100,
    ) ||
    format.columns * format.rows > 2000
  )
    return 'Informe uma grade de até 2.000 etiquetas por folha.';
  const right =
    format.left + offsetX + format.columns * format.width + (format.columns - 1) * format.gapX;
  const bottom =
    format.top + offsetY + format.rows * format.height + (format.rows - 1) * format.gapY;
  if (
    format.left + offsetX < 0 ||
    format.top + offsetY < 0 ||
    right > format.paperWidth + 0.05 ||
    bottom > format.paperHeight + 0.05
  )
    return 'A grade e o deslocamento precisam caber por inteiro na folha.';
  return '';
}
export function labelTemplateError(template: LabelTemplate): string {
  if (!template.name.trim() || template.name.length > 80)
    return 'Informe um nome de modelo de até 80 caracteres.';
  if (!template.blocks.length || template.blocks.length > 20)
    return 'O modelo deve ter de 1 a 20 campos.';
  if (!Number.isFinite(template.fontSize) || template.fontSize < 5 || template.fontSize > 36)
    return 'Use uma fonte entre 5 e 36 pontos.';
  if (!Number.isFinite(template.padding) || template.padding < 0 || template.padding > 20)
    return 'Use uma margem interna entre 0 e 20 mm.';
  if (
    template.blocks.some(
      (block) =>
        !LABEL_FIELDS.some((field) => field.value === block.field) || block.text.length > 500,
    )
  )
    return 'Revise os campos do modelo e os textos fixos (até 500 caracteres).';
  return '';
}
export function labelJobError(job: LabelJob): string {
  const error =
    labelFormatError(job.format, job.offsetX, job.offsetY) || labelTemplateError(job.template);
  if (error) return error;
  if (!job.recipients.length) return 'Selecione ao menos um destinatário.';
  if (!Number.isInteger(job.copies) || job.copies < 1 || job.copies > 100)
    return 'Informe de 1 a 100 cópias por munícipe.';
  if (job.copies * job.recipients.length > 5000) return 'Gere até 5.000 etiquetas por vez.';
  if (
    !Number.isInteger(job.startAt) ||
    job.startAt < 1 ||
    job.startAt > job.format.columns * job.format.rows
  )
    return 'A posição inicial deve existir na primeira folha.';
  if (Math.min(job.format.width, job.format.height) <= job.template.padding * 2)
    return 'A margem interna ocupa toda a etiqueta. Reduza-a ou escolha outro formato.';
  return '';
}
export function recipientAddressError(recipient: LabelRecipient, template: LabelTemplate): string {
  if (!recipient.name.trim()) return 'Nome não informado.';
  const needsAddress = template.blocks.some((block) =>
    ['street', 'complement', 'neighborhood', 'cityState', 'postalCode'].includes(block.field),
  );
  if (
    needsAddress &&
    (!recipient.street.trim() ||
      !recipient.neighborhood.trim() ||
      !recipient.city.trim() ||
      !recipient.state.trim() ||
      !/^\d{5}-?\d{3}$/.test(recipient.postalCode))
  )
    return 'Endereço incompleto: confira logradouro, bairro, cidade, UF e CEP.';
  return '';
}
export function labelFieldText(
  recipient: LabelRecipient,
  field: string,
  fixedText: string,
): string {
  switch (field) {
    case 'cityState':
      return [recipient.city, recipient.state].filter(Boolean).join(' / ');
    case 'postalCode':
      return recipient.postalCode ? `CEP ${recipient.postalCode}` : '';
    case 'cra':
      return recipient.cra ? `CRA ${recipient.cra}` : '';
    case 'categories':
      return recipient.categories.join(' · ');
    case 'birthday':
      return recipient.birthDate
        ? `${recipient.birthDate.slice(8, 10)}/${recipient.birthDate.slice(5, 7)}`
        : '';
    case 'text':
      return fixedText;
    case 'name':
    case 'street':
    case 'complement':
    case 'neighborhood':
    case 'phone':
    case 'observations':
      return recipient[field];
    default:
      return '';
  }
}

export interface LabelTextPart {
  readonly text: string;
  readonly bold: boolean;
}
export interface LabelContentRow {
  readonly id: string;
  readonly parts: readonly LabelTextPart[];
}

// Shared by the sample and PDF so empty fields never leave dangling separators.
export function composeLabelRows(
  recipient: LabelRecipient,
  template: LabelTemplate,
): readonly LabelContentRow[] {
  const rows: { id: string; parts: LabelTextPart[] }[] = [];
  let current: (typeof rows)[number] | undefined;
  for (const block of template.blocks) {
    if (!block.joinPrevious) current = undefined;
    const text = labelFieldText(recipient, block.field, block.text).trim();
    if (!text) continue;
    if (current) {
      current.parts.push({ text: ' - ', bold: false }, { text, bold: block.bold });
    } else {
      current = { id: block.id, parts: [{ text, bold: block.bold }] };
      rows.push(current);
    }
  }
  return rows;
}
