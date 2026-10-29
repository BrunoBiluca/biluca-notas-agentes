import { Note } from './note.model';

export interface CreateNoteInput {
  title: string;
  content?: string;
  backgroundColor?: string;
  imageIds?: string[];
}

export function normalizeTitle(title: string): string {
  const normalized = title.trim();
  if (!normalized) {
    throw new Error('Informe um título para a nota.');
  }
  return normalized;
}

export function normalizeContent(content?: string): string | undefined {
  const normalized = content?.trim();
  return normalized || undefined;
}

export function createNote(
  input: CreateNoteInput,
  ownerId: string,
  manualOrder: number,
  now = Date.now(),
  id: string = crypto.randomUUID(),
): Note {
  if (!ownerId.trim()) {
    throw new Error('O usuário atual não foi identificado.');
  }

  const note: Note = {
    id,
    ownerId,
    title: normalizeTitle(input.title),
    createdAt: now,
    updatedAt: now,
    pinned: false,
    manualOrder: Math.max(0, Math.trunc(manualOrder)),
    revision: 1,
    imageIds: [...(input.imageIds ?? [])],
  };
  const content = normalizeContent(input.content);
  if (content) note.content = content;
  if (input.backgroundColor) note.backgroundColor = input.backgroundColor;
  return note;
}

export function getForegroundColor(backgroundColor?: string): '#000000' | '#ffffff' {
  if (!backgroundColor) return '#000000';
  const hex = backgroundColor.replace('#', '');
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return '#000000';
  const expanded = hex.length === 3 ? [...hex].map((part) => part + part).join('') : hex;
  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.179 ? '#000000' : '#ffffff';
}
