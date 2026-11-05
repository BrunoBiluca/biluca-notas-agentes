import { expect, test } from '@playwright/test';
import { makeNotes, seedNotes } from './helpers';

function luminance(color: string): number {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Unsupported computed color: ${color}`);
  const linear = channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('preserves note colors and core collection interactions in every theme', async ({ page }) => {
  const notes = makeNotes(3);
  notes[0].title = 'Nota sem cor';
  notes[1].title = 'Nota violeta';
  notes[1].backgroundColor = '#e8def8';
  notes[2].title = 'Nota verde';
  notes[2].backgroundColor = '#121316';
  await seedNotes(page, notes);

  const cards = page.getByTestId('note-card');
  const initialColors = await cards.evaluateAll((elements) =>
    elements.map((element) => (element as HTMLElement).style.backgroundColor),
  );
  const trigger = page.getByRole('button', { name: 'Selecionar tema da aplicação' });

  for (const [label, mode, colorScheme] of [
    ['Claro', 'light', 'light'],
    ['Escuro', 'dark', 'dark'],
    ['Definido pelo sistema', 'system', 'light dark'],
  ]) {
    await trigger.click();
    await page.getByRole('menuitem', { name: label, exact: true }).click();
    await expect(page.locator('html')).toHaveCSS('color-scheme', colorScheme);
    await expect(cards).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Nota sem cor' })).toBeVisible();
    await expect(page.getByText('Conteúdo 0')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('biluca-notas-agentes.theme-preference'))).toBe(
      mode,
    );
    expect(
      await cards.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).style.backgroundColor),
      ),
    ).toEqual(initialColors);
    const notePairs = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const card = element as HTMLElement;
        const background = getComputedStyle(card).backgroundColor;
        return {
          foreground: getComputedStyle(card).color,
          background:
            background === 'rgba(0, 0, 0, 0)'
              ? getComputedStyle(document.body).backgroundColor
              : background,
        };
      }),
    );
    for (const pair of notePairs) {
      expect(contrastRatio(pair.foreground, pair.background)).toBeGreaterThanOrEqual(4.5);
    }

    await page.getByRole('button', { name: 'Nota verde' }).click();
    const detailPairs = await page.locator('.detail-card').evaluate((element) => {
      const card = element as HTMLElement;
      const cardBackground = getComputedStyle(card).backgroundColor;
      return [...card.querySelectorAll<HTMLElement>('h1, .content, .date, .mat-mdc-button')].map(
        (content) => {
          const buttonBackground = getComputedStyle(content).backgroundColor;
          return {
            name: content.className || content.tagName,
            foreground: getComputedStyle(content).color,
            background:
              buttonBackground !== 'rgba(0, 0, 0, 0)' ? buttonBackground : cardBackground,
          };
        },
      );
    });
    for (const pair of detailPairs) {
      expect(
        contrastRatio(pair.foreground, pair.background),
        pair.name,
      ).toBeGreaterThanOrEqual(4.5);
    }
    await page.getByRole('button', { name: 'Fechar detalhe da nota' }).click();

    await page.getByRole('button', { name: 'Nota sem cor' }).click();
    const detailCard = page.locator('.detail-card');
    await expect(detailCard).toBeVisible();
    await expect(detailCard).toHaveCSS('color', await page.locator('html').evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--mat-sys-on-surface)';
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }));
    await page.getByRole('button', { name: 'Fechar detalhe da nota' }).click();

    await page.getByRole('searchbox', { name: 'Buscar por título ou conteúdo' }).fill('Nota violeta');
    await expect(cards).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Nota violeta' })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Buscar por título ou conteúdo' }).fill('');
    await expect(cards).toHaveCount(3);

    await page.getByRole('radio', { name: 'Visualização em lista' }).click();
    await expect(cards.first()).toBeVisible();
    await cards.first().hover();
    await page.getByRole('button', { name: 'Fixar nota' }).first().click();
    await expect(page.getByRole('heading', { name: 'Notas fixadas' })).toBeVisible();
    const pinnedCard = page.getByTestId('note-card').filter({ has: page.getByText('Nota sem cor') });
    await pinnedCard.hover();
    await expect(pinnedCard.getByRole('button', { name: 'Desafixar nota' })).toBeVisible();
    await pinnedCard.getByRole('button', { name: 'Desafixar nota' }).click();
    const sortButton = page.getByRole('button', { name: /ordenação atual:/i });
    if ((await sortButton.getAttribute('aria-pressed')) === 'true') await sortButton.click();
    await sortButton.click();
    await expect(page.getByRole('button', { name: /ordem manual/i })).toBeVisible();
  }
});
