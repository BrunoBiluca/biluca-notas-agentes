import { InjectionToken } from '@angular/core';
import { Note, NoteDraft, NoteImage, NoteSortMode, NoteViewMode } from '../domain/note.model';

export type SaveEditResult = { kind: 'saved'; note: Note } | { kind: 'conflict'; current: Note };

export interface NoteRepository {
  create(note: Note): Promise<void>;
  createWithImages(note: Note, images: NoteImage[]): Promise<void>;
  saveWithImages(
    note: Note,
    expectedRevision: number,
    imagesToSave: NoteImage[],
    imagesToRemove: string[],
    overwrite?: boolean,
  ): Promise<SaveEditResult>;
  get(ownerId: string, noteId: string): Promise<Note | undefined>;
  list(ownerId: string, offset: number, limit: number, sort: NoteSortMode): Promise<Note[]>;
  search(ownerId: string, query: string, sort: NoteSortMode): Promise<Note[]>;
  remove(ownerId: string, noteId: string): Promise<void>;
  setPinned(ownerId: string, noteId: string, pinned: boolean): Promise<void>;
  reorder(ownerId: string, noteId: string, targetIndex: number): Promise<void>;
}

export interface NoteImageRepository {
  save(image: NoteImage): Promise<void>;
  get(ownerId: string, noteId: string, imageId: string): Promise<NoteImage | undefined>;
  remove(ownerId: string, noteId: string, imageId: string): Promise<void>;
  removeForNote(ownerId: string, noteId: string): Promise<void>;
}

export interface EditingSessionCoordinator {
  begin(noteId: string): Promise<boolean>;
  end(noteId: string): void;
  announceSaved(noteId: string, revision: number): void;
  close(): void;
}

export interface NotesApplication {
  readonly notes: import('@angular/core').Signal<Note[]>;
  readonly loading: import('@angular/core').Signal<boolean>;
  readonly error: import('@angular/core').Signal<string | undefined>;
  readonly viewMode: import('@angular/core').Signal<NoteViewMode>;
  readonly sortMode: import('@angular/core').Signal<NoteSortMode>;
  readonly query: import('@angular/core').Signal<string>;
  readonly hasMore: import('@angular/core').Signal<boolean>;
  loadInitial(): Promise<void>;
  loadNextPage(): Promise<void>;
  search(query: string): Promise<void>;
  create(input: NoteDraft, images?: File[]): Promise<Note>;
  get(noteId: string): Promise<Note | undefined>;
  beginEdit(noteId: string): Promise<{ note: Note; otherTabEditing: boolean }>;
  saveEdit(
    noteId: string,
    draft: NoteDraft,
    resolution?: 'reload' | 'overwrite',
    images?: File[],
  ): Promise<SaveEditResult>;
  cancelEdit(noteId: string): void;
  delete(noteId: string): Promise<void>;
  setPinned(noteId: string, pinned: boolean): Promise<void>;
  reorder(noteId: string, targetIndex: number): Promise<void>;
  setViewMode(mode: NoteViewMode): void;
  setSortMode(mode: NoteSortMode): Promise<void>;
  imageUrl(imageId: string, noteId: string): Promise<string | undefined>;
}

export const NOTES_APPLICATION = new InjectionToken<NotesApplication>('NOTES_APPLICATION');
export const NOTE_REPOSITORY = new InjectionToken<NoteRepository>('NOTE_REPOSITORY');
export const NOTE_IMAGE_REPOSITORY = new InjectionToken<NoteImageRepository>(
  'NOTE_IMAGE_REPOSITORY',
);
export const EDITING_SESSION_COORDINATOR = new InjectionToken<EditingSessionCoordinator>(
  'EDITING_SESSION_COORDINATOR',
);
