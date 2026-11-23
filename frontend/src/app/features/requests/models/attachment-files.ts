export const ATTACHMENT_TYPES = {
  mp3: { kind: 'audio', mime: 'audio/mpeg' },
  m4a: { kind: 'audio', mime: 'audio/mp4' },
  aac: { kind: 'audio', mime: 'audio/aac' },
  wav: { kind: 'audio', mime: 'audio/wav' },
  ogg: { kind: 'audio', mime: 'audio/ogg' },
  oga: { kind: 'audio', mime: 'audio/ogg' },
  opus: { kind: 'audio', mime: 'audio/ogg' },
  webm: { kind: 'audio', mime: 'audio/webm' },
  flac: { kind: 'audio', mime: 'audio/flac' },
  amr: { kind: 'audio', mime: 'audio/amr' },
  aif: { kind: 'audio', mime: 'audio/aiff' },
  aiff: { kind: 'audio', mime: 'audio/aiff' },
  '3gp': { kind: 'audio', mime: 'audio/3gpp' },
  jpg: { kind: 'photo', mime: 'image/jpeg' },
  jpeg: { kind: 'photo', mime: 'image/jpeg' },
  png: { kind: 'photo', mime: 'image/png' },
  webp: { kind: 'photo', mime: 'image/webp' },
  avif: { kind: 'photo', mime: 'image/avif' },
  gif: { kind: 'photo', mime: 'image/gif' },
  heic: { kind: 'photo', mime: 'image/heic' },
  heif: { kind: 'photo', mime: 'image/heif' },
  pdf: { kind: 'document', mime: 'application/pdf' },
  doc: { kind: 'document', mime: 'application/msword' },
  docx: {
    kind: 'document',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  odt: { kind: 'document', mime: 'application/vnd.oasis.opendocument.text' },
  xls: { kind: 'document', mime: 'application/vnd.ms-excel' },
  xlsx: {
    kind: 'document',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  ods: { kind: 'document', mime: 'application/vnd.oasis.opendocument.spreadsheet' },
  ppt: { kind: 'document', mime: 'application/vnd.ms-powerpoint' },
  pptx: {
    kind: 'document',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  odp: { kind: 'document', mime: 'application/vnd.oasis.opendocument.presentation' },
  txt: { kind: 'document', mime: 'text/plain' },
  csv: { kind: 'document', mime: 'text/csv' },
  rtf: { kind: 'document', mime: 'application/rtf' },
} as const;
export const ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_TYPES)
  .map((extension) => `.${extension}`)
  .join(',');
export const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024;
export function attachmentType(name: string, mimeType = '') {
  const extension = name.split('.').at(-1)?.toLowerCase() ?? '';
  const type = Object.hasOwn(ATTACHMENT_TYPES, extension)
    ? ATTACHMENT_TYPES[extension as keyof typeof ATTACHMENT_TYPES]
    : null;
  return type?.kind === 'audio' && mimeType.startsWith('audio/')
    ? { kind: type.kind, mime: mimeType }
    : type;
}
export function attachmentSize(size: number | null): string {
  if (size === null) return '';
  if (size < 1024) return `${size} B`;
  return size < 1024 * 1024
    ? `${Math.ceil(size / 1024)} KB`
    : `${(size / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}
