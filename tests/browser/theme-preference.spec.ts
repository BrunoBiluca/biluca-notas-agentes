import { expect, test } from '@playwright/test';

test('selects and persists each theme mode', async ({ page }) => {
  await page.goto('/notes');
  const trigger = page.getByRole('button', { name: 'Selecionar tema da aplicação' });
  await expect(trigger).toBeVisible();

  for (const [label, mode, colorScheme] of [
    ['Claro', 'light', 'light'],
    ['Escuro', 'dark', 'dark'],
    ['Definido pelo sistema', 'system', 'light dark'],
  ]) {
    await trigger.click();
    const option = page.getByRole('menuitem', { name: label, exact: true });
    await expect(option).toBeVisible();
    await option.click();
    await expect(page.locator('html')).toHaveCSS('color-scheme', colorScheme);
    expect(await page.evaluate(() => localStorage.getItem('biluca-notas-agentes.theme-preference'))).toBe(
      mode,
    );

    await page.reload();
    await trigger.click();
    await expect(page.getByRole('menuitem', { name: `${label} (atual)`, exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  }
});

test('follows operating-system color changes while system mode is selected', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/notes');
  await page.getByRole('button', { name: 'Selecionar tema da aplicação' }).click();
  await page.getByRole('menuitem', { name: /^Definido pelo sistema/ }).click();

  const lightBackground = await page.locator('body').evaluate((element) => {
    return getComputedStyle(element).backgroundColor;
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect
    .poll(() =>
      page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(lightBackground);
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light dark');
});

test('supports choosing a theme with keyboard navigation', async ({ page }) => {
  await page.goto('/notes');
  const trigger = page.getByRole('button', { name: 'Selecionar tema da aplicação' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu', { name: 'Opções de tema' })).toBeVisible();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('biluca-notas-agentes.theme-preference'))).toBe(
    'dark',
  );
  await expect(trigger).toBeFocused();
});

test('keeps the theme selector reachable and the menu within a touch viewport', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 720 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/notes');

  const trigger = page.getByRole('button', { name: 'Selecionar tema da aplicação' });
  const touchTarget = await trigger.locator('.mat-mdc-button-touch-target').boundingBox();
  expect(touchTarget?.width).toBeGreaterThanOrEqual(48);
  expect(touchTarget?.height).toBeGreaterThanOrEqual(48);

  await page.touchscreen.tap(
    (touchTarget?.x ?? 0) + (touchTarget?.width ?? 0) / 2,
    (touchTarget?.y ?? 0) + (touchTarget?.height ?? 0) / 2,
  );
  const menu = page.getByRole('menu', { name: 'Opções de tema' });
  await expect(menu).toBeVisible();
  const menuBox = await menu.boundingBox();
  expect(menuBox?.x).toBeGreaterThanOrEqual(0);
  expect((menuBox?.x ?? 0) + (menuBox?.width ?? 0)).toBeLessThanOrEqual(320);
  const systemOption = page.getByRole('menuitem', { name: 'Definido pelo sistema' });
  await expect(systemOption).toBeVisible();
  expect(
    await page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  const optionBox = await systemOption.boundingBox();
  await page.touchscreen.tap(
    (optionBox?.x ?? 0) + (optionBox?.width ?? 0) / 2,
    (optionBox?.y ?? 0) + (optionBox?.height ?? 0) / 2,
  );
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light dark');
  await context.close();
});

test('suppresses theme menu motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/notes');
  await page.getByRole('button', { name: 'Selecionar tema da aplicação' }).click();

  const menu = page.getByRole('menu', { name: 'Opções de tema' });
  await expect(menu).toBeVisible();
  const motion = await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationName: style.animationName, transitionDuration: style.transitionDuration };
  });
  expect(motion.animationName).toBe('none');
  expect(motion.transitionDuration.split(',').every((duration) => Number.parseFloat(duration) === 0)).toBe(
    true,
  );
});

test('announces when the selected preference cannot be persisted', async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'biluca-notas-agentes.theme-preference') {
        throw new DOMException('Access denied', 'QuotaExceededError');
      }
      originalSetItem.call(this, key, value);
    };
  });
  await page.goto('/notes');
  await page.getByRole('button', { name: 'Selecionar tema da aplicação' }).click();
  await page.getByRole('menuitem', { name: 'Escuro', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('somente nesta sessão');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});
