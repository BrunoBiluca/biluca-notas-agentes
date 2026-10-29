export const MAX_IMAGE_SIZE_BYTES = 10_000_000;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export function validateNoteImage(file: Pick<File, 'type' | 'size'>): string | undefined {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return 'Formato não aceito. Use JPEG, PNG, WebP ou GIF.';
  }
  if (file.size < 1 || file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'A imagem deve ter entre 1 byte e 10 MB.';
  }
  return undefined;
}
