import { expect, test } from '@playwright/test';
import { makeNotes, seedNotes } from './helpers';

test('loads an initial batch of 100 and automatically loads the next batch', async ({ page }) => {
  await seedNotes(page, makeNotes(105));
  await expect(page.getByTestId('note-card')).toHaveCount(100);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByTestId('note-card')).toHaveCount(105);
  await page.getByRole('radio', { name: 'Visualização em lista' }).click();
  await expect(page.getByTestId('note-card')).toHaveCount(105);
  await expect(page.getByRole('button', { name: 'Editar nota' }).first()).toBeVisible();
});

test('renders the Material toolbar, creation form, note sections and responsive card actions', async ({
  page,
}) => {
  await seedNotes(page, [
    { ...makeNotes(1)[0], id: 'pinned', title: 'Fixada', pinned: true },
    { ...makeNotes(1)[0], id: 'free', title: 'Livre', pinned: false },
  ]);
  const toolbar = page.getByRole('toolbar', { name: 'Barra de navegação das notas' });
  const gridToggle = toolbar.getByRole('radio', { name: 'Visualização em grade' });
  const sortButton = toolbar.getByRole('button', { name: /ordem de atualização/i });
  const search = toolbar.getByRole('searchbox', { name: 'Buscar por título ou conteúdo' });
  await expect(gridToggle).toBeVisible();
  await expect(sortButton).toBeVisible();
  await expect(search).toBeVisible();
  const gridBox = await gridToggle.boundingBox();
  const sortTarget = sortButton.locator('.mat-mdc-button-touch-target');
  const sortBox = await sortButton.boundingBox();
  const sortTargetBox = await sortTarget.boundingBox();
  const searchBox = await search.boundingBox();
  expect(gridBox).not.toBeNull();
  expect(sortBox).not.toBeNull();
  expect(sortTargetBox).not.toBeNull();
  expect(sortTargetBox!.width).toBeGreaterThanOrEqual(48);
  expect(sortTargetBox!.height).toBeGreaterThanOrEqual(48);
  expect(searchBox).not.toBeNull();
  expect(sortBox!.x).toBeGreaterThanOrEqual(gridBox!.x + gridBox!.width);
  expect(Math.abs(searchBox!.x + searchBox!.width / 2 - 640)).toBeLessThan(20);
  await expect(page.getByRole('heading', { name: 'Notas fixadas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notas livres' })).toBeVisible();

  const toolbarBottom = await toolbar.boundingBox();
  const formBox = await page.locator('form.create-note').boundingBox();
  expect(toolbarBottom).not.toBeNull();
  expect(formBox).not.toBeNull();
  expect(formBox!.y).toBeGreaterThan(toolbarBottom!.y + toolbarBottom!.height);

  const card = page.getByTestId('note-card').first();
  await card.hover();
  await expect(card.getByRole('button', { name: 'Editar nota' })).toBeVisible();
  await card.getByRole('button', { name: 'Editar nota' }).focus();
  await expect(card.getByRole('button', { name: 'Remover nota' })).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await page.setViewportSize({ width: 320, height: 780 });
  await expect(search).toBeVisible();
  await expect(page.getByRole('button', { name: 'Criar nota' })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
});

test('keeps note actions directly operable by touch', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const touchPage = await context.newPage();
  try {
    await seedNotes(touchPage, makeNotes(1));
    const edit = touchPage.getByRole('button', { name: 'Editar nota' });
    await expect(edit).toBeVisible();
    const editBox = await edit.locator('.mat-mdc-button-touch-target').boundingBox();
    expect(editBox).not.toBeNull();
    expect(editBox!.width).toBeGreaterThanOrEqual(48);
    expect(editBox!.height).toBeGreaterThanOrEqual(48);
    await edit.tap();
    await expect(touchPage.getByRole('heading', { name: 'Editar nota' })).toBeVisible();
  } finally {
    await context.close();
  }
});
