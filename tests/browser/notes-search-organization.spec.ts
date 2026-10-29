import { expect, test } from '@playwright/test';
import { makeNotes, seedNotes } from './helpers';

test('searches all notes quickly, prioritizes pins and persists manual ordering', async ({
  page,
}) => {
  await seedNotes(page, makeNotes(1000));
  const search = page.getByRole('searchbox', { name: 'Buscar por título ou conteúdo' });
  const started = Date.now();
  await search.fill('term-0999');
  await expect(page.getByRole('button', { name: /Busca especial term-0999/ })).toBeVisible({
    timeout: 2000,
  });
  expect(Date.now() - started).toBeLessThan(2000);

  await search.fill('');
  await expect(page.getByTestId('note-card')).toHaveCount(100);
  await page.getByRole('button', { name: /ordem de atualização/i }).click();
  await expect(page.getByRole('button', { name: /ordem manual/i })).toBeVisible();
  await page.getByRole('button', { name: 'Fixar nota' }).first().click();
  await expect(page.getByRole('heading', { name: 'Notas fixadas' })).toBeVisible();
  const unpinnedGroup = page.locator('.notes').last();
  const items = unpinnedGroup.locator('.cdk-drag');
  const titles = unpinnedGroup.locator('.title');
  const source = await items.nth(0).boundingBox();
  const destination = await items.nth(1).boundingBox();
  expect(source).not.toBeNull();
  expect(destination).not.toBeNull();
  await page.mouse.move(source!.x + source!.width / 2, source!.y + source!.height / 2);
  await page.mouse.down();
  await page.mouse.move(source!.x + source!.width / 2 + 5, source!.y + source!.height / 2 + 5, {
    steps: 2,
  });
  await page.mouse.move(
    destination!.x + destination!.width / 2,
    destination!.y + destination!.height / 2,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect
    .poll(async () => (await titles.allTextContents()).slice(0, 2))
    .toEqual(['Nota 2', 'Nota 1']);
  await unpinnedGroup
    .locator('app-note-card')
    .nth(1)
    .getByRole('button', { name: 'Mover nota para cima' })
    .click();
  await expect
    .poll(async () => (await titles.allTextContents()).slice(0, 2))
    .toEqual(['Nota 1', 'Nota 2']);
  await page.reload();
  await page.getByRole('button', { name: /ordem de atualização/i }).click();
  await expect(page.getByRole('button', { name: /ordem manual/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notas fixadas' })).toBeVisible();
  await expect(page.getByTestId('note-card')).toHaveCount(100);
  await expect
    .poll(async () =>
      (await page.locator('.notes').last().locator('.title').allTextContents()).slice(0, 2),
    )
    .toEqual(['Nota 1', 'Nota 2']);
});

test('provides named Material icon actions and reorders notes from the keyboard', async ({
  page,
}) => {
  await seedNotes(page, makeNotes(3));
  const sortButton = page.getByRole('button', { name: /ordem de atualização/i });
  await expect(sortButton.locator('mat-icon svg')).toBeVisible();
  await sortButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: /ordem manual/i })).toBeVisible();

  const card = page.getByTestId('note-card').first();
  const pin = card.getByRole('button', { name: 'Fixar nota' });
  await pin.focus();
  await page.keyboard.press('Enter');
  await expect(card.getByRole('button', { name: 'Desafixar nota' })).toBeVisible();
  for (const name of [
    'Editar nota',
    'Mover nota para cima',
    'Mover nota para baixo',
    'Remover nota',
  ]) {
    await expect(card.getByRole('button', { name })).toBeVisible();
    await expect(card.getByRole('button', { name }).locator('mat-icon svg')).toBeVisible();
  }

  const freeCards = page.locator('.notes').last();
  const initialOrder = await freeCards.locator('.title').allTextContents();
  await freeCards
    .locator('app-note-card')
    .nth(1)
    .getByRole('button', { name: 'Mover nota para cima' })
    .focus();
  await page.keyboard.press('Enter');
  await expect
    .poll(() => freeCards.locator('.title').allTextContents())
    .toEqual([initialOrder[1], initialOrder[0]]);
});
