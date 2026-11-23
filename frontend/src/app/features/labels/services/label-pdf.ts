import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import type { LabelJob, LabelPdf } from '../models/label-print';
import {
  composeLabelRows,
  labelJobError,
  recipientAddressError,
  type LabelTextPart,
} from '../models/label-layout';
const pt = (millimeters: number): number => (millimeters * 72) / 25.4;
interface TextFragment extends LabelTextPart {
  readonly width: number;
}
interface TextLine {
  readonly parts: readonly TextFragment[];
  readonly width: number;
}
function wrap(
  parts: readonly LabelTextPart[],
  regular: PDFFont,
  bold: PDFFont,
  size: number,
  width: number,
): TextLine[] {
  const lines: TextLine[] = [];
  let fragments: TextFragment[] = [];
  let lineWidth = 0;
  let pendingSpace: boolean | undefined;
  const fontFor = (isBold: boolean): PDFFont => (isBold ? bold : regular);
  const append = (text: string, isBold: boolean): void => {
    const last = fragments.at(-1);
    const font = fontFor(isBold);
    if (last && last.bold === isBold) {
      const combined = last.text + text;
      const combinedWidth = font.widthOfTextAtSize(combined, size);
      fragments[fragments.length - 1] = { text: combined, bold: isBold, width: combinedWidth };
      lineWidth += combinedWidth - last.width;
    } else {
      const fragmentWidth = font.widthOfTextAtSize(text, size);
      fragments.push({ text, bold: isBold, width: fragmentWidth });
      lineWidth += fragmentWidth;
    }
  };
  const finishLine = (): void => {
    if (fragments.length) lines.push({ parts: fragments, width: lineWidth });
    fragments = [];
    lineWidth = 0;
    pendingSpace = undefined;
  };
  for (const part of parts) {
    const font = fontFor(part.bold);
    for (const token of part.text.replace(/\r/g, '').match(/\n|[^\S\n]+|[^\s]+/gu) ?? []) {
      if (token === '\n') {
        finishLine();
        continue;
      }
      if (/^\s+$/u.test(token)) {
        pendingSpace = part.bold;
        continue;
      }
      const tokenWidth = font.widthOfTextAtSize(token, size);
      const spaceWidth =
        fragments.length && pendingSpace !== undefined
          ? fontFor(pendingSpace).widthOfTextAtSize(' ', size)
          : 0;
      if (lineWidth + spaceWidth + tokenWidth <= width) {
        if (spaceWidth && pendingSpace !== undefined) append(' ', pendingSpace);
        append(token, part.bold);
      } else {
        finishLine();
        if (tokenWidth <= width) append(token, part.bold);
        else
          for (const character of token) {
            const characterWidth = font.widthOfTextAtSize(character, size);
            if (characterWidth > width)
              throw new Error(
                'Um caractere não cabe na largura disponível. Reduza a fonte ou a margem interna.',
              );
            if (fragments.length && lineWidth + characterWidth > width) finishLine();
            append(character, part.bold);
          }
      }
      pendingSpace = undefined;
    }
  }
  finishLine();
  return lines;
}
export async function createLabelPdf(job: LabelJob): Promise<LabelPdf> {
  const invalid = labelJobError(job);
  if (invalid) throw new Error(invalid);
  const pdf = await PDFDocument.create();
  pdf.setTitle('Etiquetas de munícipes');
  pdf.setCreator('Gabinete CRM');
  const fonts = {
    helvetica: [StandardFonts.Helvetica, StandardFonts.HelveticaBold],
    times: [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold],
    courier: [StandardFonts.Courier, StandardFonts.CourierBold],
  } as const;
  const regular = await pdf.embedFont(fonts[job.template.font][0]);
  const bold = await pdf.embedFont(fonts[job.template.font][1]);
  const { format, template } = job;
  const innerWidth = pt(format.width - template.padding * 2);
  const innerHeight = pt(format.height - template.padding * 2);
  const lineHeight = template.fontSize * 1.15;
  const layouts: TextLine[][] = [];
  for (const recipient of job.recipients) {
    const missing = recipientAddressError(recipient, template);
    if (missing) throw new Error(`${recipient.name}: ${missing}`);
    const lines: TextLine[] = [];
    try {
      for (const row of composeLabelRows(recipient, template)) {
        lines.push(...wrap(row.parts, regular, bold, template.fontSize, innerWidth));
      }
    } catch (error: unknown) {
      throw new Error(
        `${recipient.name}: ${error instanceof Error && error.message.includes('WinAnsi') ? 'o texto contém um caractere não suportado pelas fontes disponíveis. Revise o conteúdo.' : error instanceof Error ? error.message : 'não foi possível compor o texto.'}`,
      );
    }
    if (!lines.length)
      throw new Error(
        `${recipient.name}: o modelo não produz conteúdo. Inclua um campo preenchido.`,
      );
    const lastHeight = Math.max(
      regular.heightAtSize(template.fontSize, { descender: true }),
      bold.heightAtSize(template.fontSize, { descender: true }),
    );
    if ((lines.length - 1) * lineHeight + lastHeight > innerHeight)
      throw new Error(
        `${recipient.name}: o conteúdo não cabe na etiqueta. Reduza a fonte/margem, ajuste os campos ou escolha um formato maior.`,
      );
    layouts.push(lines);
  }
  const capacity = format.columns * format.rows;
  const count = job.recipients.length * job.copies;
  const sheets = Math.ceil((job.startAt - 1 + count) / capacity);
  if (sheets > 500)
    throw new Error('O lote ultrapassa 500 folhas. Reduza cópias ou destinatários.');
  for (let sheet = 0; sheet < sheets; sheet++) {
    const page = pdf.addPage([pt(format.paperWidth), pt(format.paperHeight)]);
    for (let cell = 0; cell < capacity; cell++) {
      const ordinal = sheet * capacity + cell - (job.startAt - 1);
      const column = cell % format.columns;
      const row = Math.floor(cell / format.columns);
      const x = pt(format.left + job.offsetX + column * (format.width + format.gapX));
      const top = pt(format.top + job.offsetY + row * (format.height + format.gapY));
      if (job.guides)
        page.drawRectangle({
          x,
          y: page.getHeight() - top - pt(format.height),
          width: pt(format.width),
          height: pt(format.height),
          borderWidth: 0.3,
          borderColor: rgb(0.65, 0.65, 0.65),
        });
      if (ordinal < 0 || ordinal >= count) continue;
      const lines = layouts[Math.floor(ordinal / job.copies)];
      lines.forEach((line, index) => {
        const alignment =
          template.align === 'center'
            ? (innerWidth - line.width) / 2
            : template.align === 'right'
              ? innerWidth - line.width
              : 0;
        const ascent = Math.max(
          regular.heightAtSize(template.fontSize, { descender: false }),
          bold.heightAtSize(template.fontSize, { descender: false }),
        );
        const y = page.getHeight() - top - pt(template.padding) - ascent - index * lineHeight;
        let cursorX = x + pt(template.padding) + alignment;
        for (const part of line.parts) {
          page.drawText(part.text, {
            x: cursorX,
            y,
            size: template.fontSize,
            font: part.bold ? bold : regular,
            color: rgb(0, 0, 0),
          });
          cursorX += part.width;
        }
      });
    }
  }
  return { bytes: await pdf.save(), pages: sheets, labels: count };
}
