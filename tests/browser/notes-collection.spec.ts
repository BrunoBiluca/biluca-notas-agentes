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
  const searchField = toolbar.locator('mat-form-field.search-field');
  await expect(gridToggle).toBeVisible();
  await expect(sortButton).toBeVisible();
  await expect(search).toBeVisible();
  await expect(searchField.locator('mat-icon[svgicon="search"] svg')).toBeVisible();
  const gridBox = await gridToggle.boundingBox();
  const sortTarget = sortButton.locator('.mat-mdc-button-touch-target');
  const sortBox = await sortButton.boundingBox();
  const sortTargetBox = await sortTarget.boundingBox();
  const searchBox = await search.boundingBox();
  const searchFieldBox = await searchField.boundingBox();
  expect(gridBox).not.toBeNull();
  expect(sortBox).not.toBeNull();
  expect(sortTargetBox).not.toBeNull();
  expect(sortTargetBox!.width).toBeGreaterThanOrEqual(48);
  expect(sortTargetBox!.height).toBeGreaterThanOrEqual(48);
  expect(searchBox).not.toBeNull();
  expect(searchFieldBox).not.toBeNull();
  expect(Math.abs(searchFieldBox!.height - sortTargetBox!.height)).toBeLessThanOrEqual(1);
  expect(sortBox!.x).toBeGreaterThanOrEqual(gridBox!.x + gridBox!.width);
  expect(Math.abs(searchBox!.x + searchBox!.width / 2 - 640)).toBeLessThan(20);

  const searchStyles = await searchField.evaluate((element) => {
    const outline = element.querySelector<HTMLElement>('.mdc-notched-outline__leading')!;
    const icon = element.querySelector<HTMLElement>('mat-icon')!;
    const tokenProbe = document.createElement('span');
    document.body.append(tokenProbe);
    tokenProbe.style.backgroundColor = 'var(--mat-sys-surface-container)';
    const surfaceColor = getComputedStyle(tokenProbe).backgroundColor;
    tokenProbe.style.color = 'var(--mat-sys-primary)';
    const primaryColor = getComputedStyle(tokenProbe).color;
    tokenProbe.remove();
    return {
      background: getComputedStyle(element).backgroundColor,
      border: getComputedStyle(outline).borderLeftColor,
      radius: getComputedStyle(element).borderTopLeftRadius,
      iconColor: getComputedStyle(icon).color,
      surfaceColor,
      primaryColor,
    };
  });
  expect(searchStyles.background).toBe(searchStyles.surfaceColor);
  expect(searchStyles.border).toBe('rgba(0, 0, 0, 0)');
  expect(searchStyles.radius).toBe('4px');
  expect(searchStyles.iconColor).toBe(searchStyles.primaryColor);

  await sortButton.focus();
  await page.keyboard.press('Tab');
  await expect(search).toBeFocused();
  await expect
    .poll(() =>
      searchField
        .locator('.mdc-notched-outline__leading')
        .evaluate((element) => getComputedStyle(element).borderLeftColor),
    )
    .not.toBe('rgba(0, 0, 0, 0)');
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
  const narrowSearchBox = await searchField.boundingBox();
  const narrowControlsBox = await toolbar.locator('.toolbar-controls').boundingBox();
  expect(narrowSearchBox).not.toBeNull();
  expect(narrowControlsBox).not.toBeNull();
  expect(narrowSearchBox!.x).toBeGreaterThanOrEqual(narrowControlsBox!.x);
  expect(narrowSearchBox!.y).toBeGreaterThanOrEqual(
    narrowControlsBox!.y + narrowControlsBox!.height,
  );
  expect(narrowSearchBox!.x + narrowSearchBox!.width).toBeLessThanOrEqual(320);
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
