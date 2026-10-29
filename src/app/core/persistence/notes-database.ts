import { Injectable } from '@angular/core';

export const NOTES_DATABASE_NAME = 'biluca-notes';
export const NOTES_DATABASE_VERSION = 1;
export const NOTE_STORE = 'notes';
export const NOTE_IMAGE_STORE = 'note-images';

@Injectable({ providedIn: 'root' })
export class NotesDatabase {
  private database?: Promise<IDBDatabase>;

  open(): Promise<IDBDatabase> {
    if (!globalThis.indexedDB) {
      return Promise.reject(new Error('Este navegador não oferece suporte ao IndexedDB.'));
    }
    if (!this.database) {
      const opening = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(NOTES_DATABASE_NAME, NOTES_DATABASE_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          const notes = db.createObjectStore(NOTE_STORE, { keyPath: 'id' });
          notes.createIndex('ownerId', 'ownerId');
          notes.createIndex('ownerId_id', ['ownerId', 'id'], { unique: true });
          notes.createIndex('ownerId_pinned_manualOrder', ['ownerId', 'pinned', 'manualOrder']);
          notes.createIndex('ownerId_pinned_updatedAt', ['ownerId', 'pinned', 'updatedAt']);
          const images = db.createObjectStore(NOTE_IMAGE_STORE, { keyPath: 'id' });
          images.createIndex('ownerId_noteId', ['ownerId', 'noteId']);
        };
        request.onsuccess = () => {
          request.result.onversionchange = () => {
            request.result.close();
            this.database = undefined;
          };
          resolve(request.result);
        };
        request.onerror = () =>
          reject(request.error ?? new Error('Não foi possível abrir o IndexedDB.'));
        request.onblocked = () =>
          reject(new Error('Feche outras abas para atualizar o banco local.'));
      });
      this.database = opening.catch((error: unknown) => {
        this.database = undefined;
        throw error;
      });
    }
    return this.database;
  }
}

export function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Falha ao acessar o IndexedDB.'));
  });
}

export function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Falha na transação local.'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('A transação local foi cancelada.'));
  });
}
