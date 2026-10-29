import { expect, test } from '@playwright/test';
import { makeNotes, seedNotes } from './helpers';

test('persists and displays an image attached to a note', async ({ page }) => {
  await seedNotes(page, makeNotes(0));
  await page.goto('/notes/new');
  await page.getByLabel('Título').fill('Nota com imagem');
  await page.locator('input[type=file]').setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2cAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(page.getByAltText('Prévia da imagem selecionada')).toBeVisible();
  await page.getByRole('button', { name: 'Salvar nota' }).click();
  await expect(page.getByRole('heading', { name: 'Nota com imagem' })).toBeVisible();
  await expect(page.getByRole('dialog').locator('app-note-images img')).toHaveCount(1);
  await page.getByRole('dialog').getByRole('button', { name: 'Editar nota' }).click();
  await page.getByRole('button', { name: 'Remover imagem' }).click();
  await page.getByRole('button', { name: 'Salvar nota' }).click();
  await expect(page.getByRole('heading', { name: 'Nota com imagem' })).toBeVisible();
  await expect(page.getByRole('dialog').locator('app-note-images img')).toHaveCount(0);

  await page.getByRole('dialog').getByRole('button', { name: 'Editar nota' }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2cAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByRole('button', { name: 'Salvar nota' }).click();
  await expect(page.getByRole('dialog').locator('app-note-images img')).toHaveCount(1);
  const deletedNoteId = await page.evaluate(async () => {
    const request = indexedDB.open('biluca-notes', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction('notes', 'readonly');
    const notes = await new Promise<{ id: string }[]>((resolve, reject) => {
      const requestAll = tx.objectStore('notes').getAll();
      requestAll.onsuccess = () => resolve(requestAll.result);
      requestAll.onerror = () => reject(requestAll.error);
    });
    db.close();
    return notes[0].id;
  });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('dialog').getByRole('button', { name: 'Remover nota' }).click();
  await expect(page.getByRole('heading', { name: 'Sua coleção está vazia' })).toBeVisible();
  const remaining = await page.evaluate(async () => {
    const request = indexedDB.open('biluca-notes', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction(['notes', 'note-images'], 'readonly');
    const [notes, images] = await Promise.all([
      new Promise<number>((resolve, reject) => {
        const count = tx.objectStore('notes').count();
        count.onsuccess = () => resolve(count.result);
        count.onerror = () => reject(count.error);
      }),
      new Promise<number>((resolve, reject) => {
        const count = tx.objectStore('note-images').count();
        count.onsuccess = () => resolve(count.result);
        count.onerror = () => reject(count.error);
      }),
    ]);
    db.close();
    return { notes, images };
  });
  expect(remaining).toEqual({ notes: 0, images: 0 });
  await page.goto(`/notes/${deletedNoteId}`);
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('não existe');
});

test('attaches an image during collection-page creation and renders it above the title without card padding', async ({
  page,
}) => {
  await seedNotes(page, makeNotes(0));
  await page.getByRole('textbox', { name: 'Título' }).fill('Nota com imagem na coleção');
  await page.locator('input[type=file]').setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2cAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(page.getByAltText('Prévia da imagem selecionada')).toBeVisible();
  await page.getByRole('button', { name: 'Criar nota' }).click();

  const card = page.getByTestId('note-card').filter({ hasText: 'Nota com imagem na coleção' });
  await expect(card.locator('app-note-images img')).toHaveCount(1);
  const imagePosition = await card.evaluate((cardElement) => {
    const cardBox = cardElement.getBoundingClientRect();
    const imageBox = cardElement.querySelector('app-note-images img')!.getBoundingClientRect();
    const title = cardElement.querySelector('.title')!.getBoundingClientRect();
    return {
      imageBottom: imageBox.bottom,
      imageLeftInset: imageBox.left - cardBox.left,
      imageRightInset: cardBox.right - imageBox.right,
      titleTop: title.top,
    };
  });
  expect(imagePosition.imageBottom).toBeLessThanOrEqual(imagePosition.titleTop);
  expect(imagePosition.imageLeftInset).toBeLessThanOrEqual(1.5);
  expect(imagePosition.imageRightInset).toBeLessThanOrEqual(1.5);
  await card.getByRole('button', { name: 'Nota com imagem na coleção' }).click();
  const dialog = page.getByRole('dialog', { name: 'Nota com imagem na coleção' });
  await expect(dialog.locator('app-note-images img')).toHaveCount(1);
  const dialogImagePosition = await dialog.locator('mat-card').evaluate((cardElement) => {
    const cardBox = cardElement.getBoundingClientRect();
    const imageBox = cardElement.querySelector('app-note-images img')!.getBoundingClientRect();
    const title = cardElement.querySelector('#note-dialog-title')!.getBoundingClientRect();
    return {
      imageBottom: imageBox.bottom,
      imageLeftInset: imageBox.left - cardBox.left,
      imageRightInset: cardBox.right - imageBox.right,
      titleTop: title.top,
    };
  });
  expect(dialogImagePosition.imageBottom).toBeLessThanOrEqual(dialogImagePosition.titleTop + 0.5);
  expect(dialogImagePosition.imageLeftInset).toBeLessThanOrEqual(1.5);
  expect(dialogImagePosition.imageRightInset).toBeLessThanOrEqual(1.5);
});
