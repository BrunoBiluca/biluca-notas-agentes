export interface Note {
  id: string;
  ownerId: string;
  title: string;
  content?: string;
  backgroundColor?: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  manualOrder: number;
  revision: number;
  imageIds: string[];
}

export interface NoteImage {
  id: string;
  noteId: string;
  ownerId: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;
  createdAt: number;
}

export type NoteDraft = Pick<Note, 'title' | 'content' | 'backgroundColor' | 'imageIds'>;

export interface NoteImageDraft {
  id: string;
  file: File;
}

export type NoteSortMode = 'updated' | 'manual';
export type NoteViewMode = 'list' | 'grid';
