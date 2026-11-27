import { ATTACHMENT_TYPES } from '../../../src/app/features/requests/models/attachment-files';
import { ApplicationError } from './error';

/** Verificação de assinatura/formato. Não equivale a análise antimalware. */
export function verifiedContentType(name: string, data: Uint8Array): string {
  const extension = name.split('.').at(-1)?.toLowerCase() as keyof typeof ATTACHMENT_TYPES;
  const type = ATTACHMENT_TYPES[extension];
  if (!type) return reject();
  const bytes = Buffer.from(data);
  const starts = (...signature: number[]): boolean =>
    signature.every((value, index) => data[index] === value);
  const ascii = (text: string, offset = 0): boolean =>
    bytes.subarray(offset, offset + text.length).toString('ascii') === text;
  let valid = false;
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      valid = starts(0xff, 0xd8, 0xff);
      break;
    case 'png':
      valid = starts(137, 80, 78, 71, 13, 10, 26, 10);
      break;
    case 'gif':
      valid = ascii('GIF87a') || ascii('GIF89a');
      break;
    case 'webp':
      valid = ascii('RIFF') && ascii('WEBP', 8);
      break;
    case 'avif':
    case 'heic':
    case 'heif':
      valid =
        ascii('ftyp', 4) &&
        /avif|avis|heic|heix|hevc|hevx|mif1|msf1/u.test(bytes.subarray(8, 40).toString('ascii'));
      break;
    case 'pdf':
      valid = ascii('%PDF-');
      break;
    case 'doc':
    case 'xls':
    case 'ppt':
      valid = starts(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1);
      break;
    case 'docx':
    case 'xlsx':
    case 'pptx': {
      const folder = extension === 'docx' ? 'word/' : extension === 'xlsx' ? 'xl/' : 'ppt/';
      valid =
        starts(0x50, 0x4b, 3, 4) &&
        bytes.includes(Buffer.from('[Content_Types].xml')) &&
        bytes.includes(Buffer.from(folder));
      break;
    }
    case 'odt':
    case 'ods':
    case 'odp':
      valid = starts(0x50, 0x4b, 3, 4) && bytes.includes(Buffer.from(type.mime));
      break;
    case 'rtf':
      valid = ascii('{\\rtf');
      break;
    case 'txt':
    case 'csv': {
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
        valid =
          !text.includes('\u0000') &&
          !/<\s*(?:!doctype\s+html|html|script|svg|iframe)\b/iu.test(text);
      } catch {
        valid = false;
      }
      break;
    }
    case 'mp3':
      valid = ascii('ID3') || (data[0] === 0xff && (data[1]! & 0xe0) === 0xe0);
      break;
    case 'aac':
      valid = data[0] === 0xff && (data[1]! & 0xf6) === 0xf0;
      break;
    case 'm4a':
    case '3gp':
      valid = ascii('ftyp', 4);
      break;
    case 'wav':
      valid = ascii('RIFF') && ascii('WAVE', 8);
      break;
    case 'ogg':
    case 'oga':
    case 'opus':
      valid = ascii('OggS');
      break;
    case 'webm':
      valid = starts(0x1a, 0x45, 0xdf, 0xa3);
      break;
    case 'flac':
      valid = ascii('fLaC');
      break;
    case 'amr':
      valid = ascii('#!AMR');
      break;
    case 'aif':
    case 'aiff':
      valid = ascii('FORM') && (ascii('AIFF', 8) || ascii('AIFC', 8));
      break;
  }
  if (!valid) return reject();
  return type.mime;
}
function reject(): never {
  throw new ApplicationError(
    400,
    'INVALID_FILE_CONTENT',
    'O conteúdo do arquivo não corresponde ao formato informado.',
  );
}
