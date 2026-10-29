import { Injectable, inject } from '@angular/core';
import {
  NOTE_IMAGE_STORE,
  NOTE_STORE,
  NotesDatabase,
  requestResult,
  transactionDone,
} from '../../../core/persistence/notes-database';
import { Note, NoteImage, NoteSortMode } from '../domain/note.model';
import { validateNoteImage } from '../domain/note-image-validation';
import { NOTE_REPOSITORY, NoteRepository, SaveEditResult } from './service-contracts';

function sortNotes(notes: Note[], sort: NoteSortMode): Note[] {
  return notes.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === 'manual') {
      return a.manualOrder - b.manualOrder || a.id.localeCompare(b.id);
    }
    return b.updatedAt - a.updatedAt || a.id.localeCompare(b.id);
  });
}

@Injectable({ providedIn: 'root' })
export class IndexedDbNoteRepository implements NoteRepository {
  private readonly database = inject(NotesDatabase);

  async create(note: Note): Promise<void> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_STORE, 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore(NOTE_STORE).add(note);
    await done;
  }

  async createWithImages(note: Note, imagesToSave: NoteImage[]): Promise<void> {
    for (const image of imagesToSave) {
      const validation = validateNoteImage({ type: image.mimeType, size: image.sizeBytes });
      if (validation) throw new Error(validation);
      if (image.noteId !== note.id || image.ownerId !== note.ownerId) {
        throw new Error('A imagem não pertence à nota e ao usuário atuais.');
      }
    }
    const db = await this.database.open();
    const tx = db.transaction([NOTE_STORE, NOTE_IMAGE_STORE], 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore(NOTE_STORE).add(note);
    const imageStore = tx.objectStore(NOTE_IMAGE_STORE);
    for (const image of imagesToSave) imageStore.add(image);
    await done;
  }

  async get(ownerId: string, noteId: string): Promise<Note | undefined> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_STORE, 'readonly');
    const result = await requestResult<Note | undefined>(
      tx.objectStore(NOTE_STORE).index('ownerId_id').get([ownerId, noteId]),
    );
    await transactionDone(tx);
    return result;
  }

  async list(ownerId: string, offset: number, limit: number, sort: NoteSortMode): Promise<Note[]> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_STORE, 'readonly');
    const all = await requestResult<Note[]>(
      tx.objectStore(NOTE_STORE).index('ownerId').getAll(ownerId),
    );
    await transactionDone(tx);
    return sortNotes(all, sort).slice(offset, offset + limit);
  }

  async search(ownerId: string, query: string, sort: NoteSortMode): Promise<Note[]> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_STORE, 'readonly');
    const all = await requestResult<Note[]>(
      tx.objectStore(NOTE_STORE).index('ownerId').getAll(ownerId),
    );
    await transactionDone(tx);
    const term = query.trim().toLocaleLowerCase();
    return sortNotes(
      term
        ? all.filter((note) =>
            `${note.title}\n${note.content ?? ''}`.toLocaleLowerCase().includes(term),
          )
        : all,
      sort,
    );
  }

  async saveWithImages(
    note: Note,
    expectedRevision: number,
    imagesToSave: NoteImage[],
    imagesToRemove: string[],
    overwrite = false,
  ): Promise<SaveEditResult> {
    const db = await this.database.open();
    const tx = db.transaction([NOTE_STORE, NOTE_IMAGE_STORE], 'readwrite');
    const done = transactionDone(tx);
    const notes = tx.objectStore(NOTE_STORE);
    const images = tx.objectStore(NOTE_IMAGE_STORE);
    const current = await requestResult<Note | undefined>(
      notes.index('ownerId_id').get([note.ownerId, note.id]),
    );
    if (!current) {
      tx.abort();
      await done.catch(() => undefined);
      throw new Error('A nota não existe ou não pertence ao usuário atual.');
    }
    if (!overwrite && current.revision !== expectedRevision) {
      tx.abort();
      await done.catch(() => undefined);
      return { kind: 'conflict', current };
    }
    for (const imageId of imagesToRemove) {
      const image = await requestResult<NoteImage | undefined>(images.get(imageId));
      if (image?.ownerId === note.ownerId && image.noteId === note.id) images.delete(imageId);
    }
    for (const image of imagesToSave) {
      const validation = validateNoteImage({ type: image.mimeType, size: image.sizeBytes });
      if (validation) {
        tx.abort();
        await done.catch(() => undefined);
        throw new Error(validation);
      }
      if (image.noteId !== note.id || image.ownerId !== note.ownerId) {
        tx.abort();
        await done.catch(() => undefined);
        throw new Error('A imagem não pertence à nota e ao usuário atuais.');
      }
      images.put(image);
    }
    const saved: Note = {
      ...current,
      title: note.title,
      content: note.content,
      backgroundColor: note.backgroundColor,
      imageIds: note.imageIds,
      updatedAt: Date.now(),
      revision: current.revision + 1,
    };
    notes.put(saved);
    await done;
    return { kind: 'saved', note: saved };
  }

  async remove(ownerId: string, noteId: string): Promise<void> {
    const db = await this.database.open();
    const tx = db.transaction([NOTE_STORE, NOTE_IMAGE_STORE], 'readwrite');
    const done = transactionDone(tx);
    const note = await requestResult<Note | undefined>(
      tx.objectStore(NOTE_STORE).index('ownerId_id').get([ownerId, noteId]),
    );
    if (!note) {
      tx.abort();
      await done.catch(() => undefined);
      throw new Error('A nota não existe ou não pertence ao usuário atual.');
    }
    tx.objectStore(NOTE_STORE).delete(noteId);
    const imageIndex = tx.objectStore(NOTE_IMAGE_STORE).index('ownerId_noteId');
    const cursorRequest = imageIndex.openCursor(IDBKeyRange.only([ownerId, noteId]));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    await done;
  }

  async setPinned(ownerId: string, noteId: string, pinned: boolean): Promise<void> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_STORE, 'readwrite');
    const done = transactionDone(tx);
    const current = await requestResult<Note | undefined>(
      tx.objectStore(NOTE_STORE).index('ownerId_id').get([ownerId, noteId]),
    );
    if (!current) {
      tx.abort();
      await done.catch(() => undefined);
      throw new Error('A nota não existe ou não pertence ao usuário atual.');
    }
    current.pinned = pinned;
    current.updatedAt = Date.now();
    current.revision++;
    tx.objectStore(NOTE_STORE).put(current);
    await done;
  }

  async reorder(ownerId: string, noteId: string, targetIndex: number): Promise<void> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_STORE, 'readwrite');
    const done = transactionDone(tx);
    const store = tx.objectStore(NOTE_STORE);
    const all = await requestResult<Note[]>(store.index('ownerId').getAll(ownerId));
    const note = all.find((item) => item.id === noteId);
    if (!note) {
      tx.abort();
      await done.catch(() => undefined);
      throw new Error('A nota não existe ou não pertence ao usuário atual.');
    }
    const group = sortNotes(
      all.filter((item) => item.pinned === note.pinned),
      'manual',
    );
    const currentIndex = group.findIndex((item) => item.id === noteId);
    const boundedIndex = Math.max(0, Math.min(targetIndex, group.length - 1));
    const [moved] = group.splice(currentIndex, 1);
    group.splice(boundedIndex, 0, moved);
    group.forEach((item, index) => {
      if (item.manualOrder !== index) {
        item.manualOrder = index;
        item.revision++;
        store.put(item);
      }
    });
    await done;
  }
}

export const NOTE_REPOSITORY_PROVIDER = {
  provide: NOTE_REPOSITORY,
  useExisting: IndexedDbNoteRepository,
};
