import { Injectable, inject } from '@angular/core';
import { CURRENT_USER_PROVIDER } from '../../../core/identity/current-user.provider';
import { createNote, normalizeTitle, normalizeContent } from '../domain/note.factory';
import { validateNoteImage } from '../domain/note-image-validation';
import { Note, NoteDraft, NoteImage, NoteSortMode, NoteViewMode } from '../domain/note.model';
import { NotesStore } from './notes.store';
import {
  EDITING_SESSION_COORDINATOR,
  NOTE_IMAGE_REPOSITORY,
  NOTE_REPOSITORY,
  NOTES_APPLICATION,
  NotesApplication,
  SaveEditResult,
} from './service-contracts';

const PAGE_SIZE = 100;

@Injectable({ providedIn: 'root' })
export class NotesApplicationService implements NotesApplication {
  private readonly store = inject(NotesStore);
  private readonly users = inject(CURRENT_USER_PROVIDER);
  private readonly repository = inject(NOTE_REPOSITORY);
  private readonly imageRepository = inject(NOTE_IMAGE_REPOSITORY);
  private readonly sessions = inject(EDITING_SESSION_COORDINATOR);
  private readonly editRevisions = new Map<string, number>();
  private readonly imageUrls = new Map<string, string>();

  readonly notes = this.store.notes;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly viewMode = this.store.viewMode;
  readonly sortMode = this.store.sortMode;
  readonly query = this.store.query;
  readonly hasMore = this.store.hasMore;
  async loadInitial(): Promise<void> {
    const query = this.query();
    this.store.updateState({
      notes: [],
      hasMore: true,
      searchResults: undefined,
      error: undefined,
    });
    if (query) {
      await this.search(query);
      return;
    }
    await this.loadNextPage();
  }

  async loadNextPage(): Promise<void> {
    if (this.loading() || !this.hasMore()) return;
    this.store.updateState({ loading: true, error: undefined });
    try {
      const offset = this.notes().length;
      const results = this.store.searchResults();
      const next = results
        ? results.slice(offset, offset + PAGE_SIZE)
        : await this.repository.list(this.userId(), offset, PAGE_SIZE, this.sortMode());
      const seen = new Set(this.notes().map((note) => note.id));
      this.store.updateState({
        notes: [...this.notes(), ...next.filter((note) => !seen.has(note.id))],
        hasMore: next.length === PAGE_SIZE && (!results || offset + next.length < results.length),
      });
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.store.updateState({ loading: false });
    }
  }

  async search(query: string): Promise<void> {
    this.store.updateState({ query, loading: true, error: undefined });
    try {
      const results = await this.repository.search(this.userId(), query, this.sortMode());
      this.store.updateState({
        searchResults: results,
        notes: results.slice(0, PAGE_SIZE),
        hasMore: results.length > PAGE_SIZE,
      });
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.store.updateState({ loading: false });
    }
  }

  async create(input: NoteDraft, files: File[] = []): Promise<Note> {
    try {
      const userId = this.userId();
      const images = this.createImageRecords(files, '', userId);
      const note = createNote(
        { ...input, title: normalizeTitle(input.title), content: normalizeContent(input.content) },
        userId,
        this.notes().length,
        Date.now(),
      );
      note.imageIds = images.map((image) => image.id);
      images.forEach((image) => (image.noteId = note.id));
      await this.repository.createWithImages(note, images);
      await this.refreshAfterMutation();
      return note;
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  async get(noteId: string): Promise<Note | undefined> {
    return this.repository.get(this.userId(), noteId);
  }

  async beginEdit(noteId: string): Promise<{ note: Note; otherTabEditing: boolean }> {
    const note = await this.get(noteId);
    if (!note) throw new Error('A nota não existe ou não pertence ao usuário atual.');
    this.editRevisions.set(noteId, note.revision);
    const otherTabEditing = await this.sessions.begin(noteId);
    return { note, otherTabEditing };
  }

  async saveEdit(
    noteId: string,
    draft: NoteDraft,
    resolution?: 'reload' | 'overwrite',
    files: File[] = [],
  ): Promise<SaveEditResult> {
    try {
      const userId = this.userId();
      const current = await this.repository.get(userId, noteId);
      if (!current) throw new Error('A nota não existe ou não pertence ao usuário atual.');
      if (resolution === 'reload') {
        this.editRevisions.set(noteId, current.revision);
        return { kind: 'conflict', current };
      }
      const images = this.createImageRecords(files, noteId, userId);
      const retainedIds = [...draft.imageIds, ...images.map((image) => image.id)];
      const removedIds = current.imageIds.filter((imageId) => !draft.imageIds.includes(imageId));
      const note: Note = {
        ...current,
        ...draft,
        title: normalizeTitle(draft.title),
        content: normalizeContent(draft.content),
        imageIds: retainedIds,
      };
      const result = await this.repository.saveWithImages(
        note,
        this.editRevisions.get(noteId) ?? current.revision,
        images,
        removedIds,
        resolution === 'overwrite',
      );
      if (result.kind === 'conflict') return result;
      for (const imageId of removedIds) this.revokeImageUrl(imageId);
      this.editRevisions.set(noteId, result.note.revision);
      this.sessions.announceSaved(noteId, result.note.revision);
      this.sessions.end(noteId);
      await this.refreshAfterMutation();
      return result;
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  cancelEdit(noteId: string): void {
    this.editRevisions.delete(noteId);
    this.sessions.end(noteId);
  }

  async delete(noteId: string): Promise<void> {
    try {
      const note = await this.repository.get(this.userId(), noteId);
      await this.repository.remove(this.userId(), noteId);
      note?.imageIds.forEach((imageId) => this.revokeImageUrl(imageId));
      this.cancelEdit(noteId);
      await this.refreshAfterMutation();
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  async setPinned(noteId: string, pinned: boolean): Promise<void> {
    try {
      await this.repository.setPinned(this.userId(), noteId, pinned);
      await this.refreshAfterMutation();
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  async reorder(noteId: string, targetIndex: number): Promise<void> {
    try {
      await this.repository.reorder(this.userId(), noteId, targetIndex);
      await this.refreshAfterMutation();
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  setViewMode(mode: NoteViewMode): void {
    this.store.updateState({ viewMode: mode });
  }

  async setSortMode(mode: NoteSortMode): Promise<void> {
    this.store.updateState({ sortMode: mode });
    await this.search(this.query());
  }

  async imageUrl(imageId: string, noteId: string): Promise<string | undefined> {
    try {
      if (this.imageUrls.has(imageId)) return this.imageUrls.get(imageId);
      const image = await this.imageRepository.get(this.userId(), noteId, imageId);
      if (!image) return undefined;
      const url = URL.createObjectURL(image.blob);
      this.imageUrls.set(imageId, url);
      return url;
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  private userId(): string {
    const id = this.users.getUserId();
    if (!id.trim()) throw new Error('O usuário atual não foi identificado.');
    return id;
  }

  private createImageRecords(files: File[], noteId: string, ownerId: string): NoteImage[] {
    return files.map((file) => {
      const validation = validateNoteImage(file);
      if (validation) throw new Error(validation);
      return {
        id: crypto.randomUUID(),
        noteId,
        ownerId,
        mimeType: file.type,
        sizeBytes: file.size,
        blob: file,
        createdAt: Date.now(),
      };
    });
  }

  private async refreshAfterMutation(): Promise<void> {
    const query = this.query();
    if (query || this.sortMode() !== 'updated') {
      await this.search(query);
    } else {
      await this.loadInitial();
    }
  }

  private setError(error: unknown): void {
    this.store.updateState({
      error: error instanceof Error ? error.message : 'Ocorreu uma falha inesperada.',
    });
  }

  private revokeImageUrl(imageId: string): void {
    const url = this.imageUrls.get(imageId);
    if (url) URL.revokeObjectURL(url);
    this.imageUrls.delete(imageId);
  }
}

export const NOTES_APPLICATION_PROVIDER = {
  provide: NOTES_APPLICATION,
  useExisting: NotesApplicationService,
};
