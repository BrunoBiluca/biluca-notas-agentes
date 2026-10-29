import { expect, Page } from '@playwright/test';

export interface BrowserNote {
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

export async function seedNotes(page: Page, notes: BrowserNote[]): Promise<void> {
  await page.goto('/notes');
  await expect(page.getByRole('heading', { name: /Suas notas/ })).toBeVisible();
  await page.evaluate(async (records) => {
    const request = indexedDB.open('biluca-notes', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    for (const record of records) store.put(record);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, notes);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Suas notas/ })).toBeVisible();
}

export function makeNotes(count: number, ownerId = 'local-user'): BrowserNote[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, index) => ({
    id: `note-${String(index).padStart(4, '0')}`,
    ownerId,
    title:
      index === count - 1
        ? `Busca especial term-${String(index).padStart(4, '0')}`
        : `Nota ${index}`,
    content: `Conteúdo ${index}`,
    createdAt: now - index,
    updatedAt: now - index,
    pinned: false,
    manualOrder: index,
    revision: 1,
    imageIds: [],
  }));
}
