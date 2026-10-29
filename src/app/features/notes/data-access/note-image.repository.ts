import { Injectable, inject } from '@angular/core';
import {
  NOTE_IMAGE_STORE,
  NOTE_STORE,
  NotesDatabase,
  requestResult,
  transactionDone,
} from '../../../core/persistence/notes-database';
import { Note, NoteImage } from '../domain/note.model';
import { validateNoteImage } from '../domain/note-image-validation';
import { NOTE_IMAGE_REPOSITORY, NoteImageRepository } from './service-contracts';

@Injectable({ providedIn: 'root' })
export class IndexedDbNoteImageRepository implements NoteImageRepository {
  private readonly database = inject(NotesDatabase);

  async save(image: NoteImage): Promise<void> {
    const db = await this.database.open();
    const tx = db.transaction([NOTE_STORE, NOTE_IMAGE_STORE], 'readwrite');
    const done = transactionDone(tx);
    const note = await requestResult<Note | undefined>(
      tx.objectStore(NOTE_STORE).index('ownerId_id').get([image.ownerId, image.noteId]),
    );
    if (!note) {
      tx.abort();
      await done.catch(() => undefined);
      throw new Error('A nota não existe ou não pertence ao usuário atual.');
    }
    const validation = validateNoteImage({ type: image.mimeType, size: image.sizeBytes });
    if (validation) {
      tx.abort();
      await done.catch(() => undefined);
      throw new Error(validation);
    }
    tx.objectStore(NOTE_IMAGE_STORE).put(image);
    await done;
  }

  async get(ownerId: string, noteId: string, imageId: string): Promise<NoteImage | undefined> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_IMAGE_STORE, 'readonly');
    const image = await requestResult<NoteImage | undefined>(
      tx.objectStore(NOTE_IMAGE_STORE).get(imageId),
    );
    await transactionDone(tx);
    return image?.ownerId === ownerId && image.noteId === noteId ? image : undefined;
  }

  async remove(ownerId: string, noteId: string, imageId: string): Promise<void> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_IMAGE_STORE, 'readwrite');
    const done = transactionDone(tx);
    const store = tx.objectStore(NOTE_IMAGE_STORE);
    const image = await requestResult<NoteImage | undefined>(store.get(imageId));
    if (image?.ownerId === ownerId && image.noteId === noteId) store.delete(imageId);
    await done;
  }

  async removeForNote(ownerId: string, noteId: string): Promise<void> {
    const db = await this.database.open();
    const tx = db.transaction(NOTE_IMAGE_STORE, 'readwrite');
    const done = transactionDone(tx);
    const cursorRequest = tx
      .objectStore(NOTE_IMAGE_STORE)
      .index('ownerId_noteId')
      .openCursor(IDBKeyRange.only([ownerId, noteId]));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    await done;
  }
}

export const NOTE_IMAGE_REPOSITORY_PROVIDER = {
  provide: NOTE_IMAGE_REPOSITORY,
  useExisting: IndexedDbNoteImageRepository,
};
