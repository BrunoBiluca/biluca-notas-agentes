import { expect, test } from '@playwright/test';
import { makeNotes, seedNotes } from './helpers';

interface ContrastPair {
  name: string;
  foreground: string;
  background: string;
  minimum: number;
}

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

async function readTokenPairs(page: import('@playwright/test').Page): Promise<ContrastPair[]> {
  return page.evaluate(() => {
    const pairs = [
      ['on-surface', 'surface', 4.5],
      ['on-surface', 'surface-container', 4.5],
      ['on-surface-variant', 'surface', 4.5],
      ['on-primary', 'primary', 4.5],
      ['on-error', 'error', 4.5],
      ['on-error-container', 'error-container', 4.5],
      ['primary', 'surface', 3],
      ['outline', 'surface', 3],
    ] as const;
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    document.body.append(probe);
    const tokenColor = (token: string, property: 'color' | 'backgroundColor') => {
      probe.style.color = '';
      probe.style.backgroundColor = '';
      probe.style[property] = `var(--mat-sys-${token})`;
      return getComputedStyle(probe)[property];
    };
    const result = pairs.map(([foreground, background, minimum]) => ({
      name: `${foreground} on ${background}`,
      foreground: tokenColor(foreground, 'color'),
      background: tokenColor(background, 'backgroundColor'),
      minimum,
    }));
    probe.remove();
    return result;
  });
}

async function readRenderedPairs(
  page: import('@playwright/test').Page,
): Promise<ContrastPair[]> {
  return page.evaluate(() => {
    const opaqueBackground = (element: HTMLElement): string => {
      let current: HTMLElement | null = element;
      while (current) {
        const color = getComputedStyle(current).backgroundColor;
        if (color !== 'rgba(0, 0, 0, 0)' && !color.endsWith(', 0)')) return color;
        current = current.parentElement;
      }
      return getComputedStyle(document.documentElement).backgroundColor;
    };
    const pair = (
      name: string,
      foregroundElement: HTMLElement,
      backgroundElement: HTMLElement,
      minimum: number,
      foregroundProperty: 'color' | 'borderLeftColor' = 'color',
    ): ContrastPair => ({
      name,
      foreground: getComputedStyle(foregroundElement)[foregroundProperty],
      background: opaqueBackground(backgroundElement),
      minimum,
    });

    const heading = document.querySelector('main h1') as HTMLElement;
    const searchField = document.querySelector('.search-field') as HTMLElement;
    const searchLabel = document.querySelector('.search-field mat-label') as HTMLElement;
    const searchInput = document.querySelector('.search-field input') as HTMLElement;
    const trigger = document.querySelector(
      'button[aria-label="Selecionar tema da aplicação"]',
    ) as HTMLElement;
    const menuPanel = document.querySelector('.mat-mdc-menu-panel') as HTMLElement;
    const menuItem = document.querySelector('.mat-mdc-menu-item') as HTMLElement;
    const currentTheme = document.querySelector('.current-theme') as HTMLElement;
    const noteTitle = document.querySelector('.note-card .title') as HTMLElement;
    const noteContent = document.querySelector('.note-card .content') as HTMLElement;
    const noteAction = document.querySelector('.note-card .actions button') as HTMLElement;
    const noteCard = document.querySelector('.note-card') as HTMLElement;
    const errorAlert = document.querySelector('.theme-persistence-error') as HTMLElement;

    searchInput.focus();
    const focusIndicator = document.querySelector(
      '.search-field .mdc-notched-outline__leading',
    ) as HTMLElement;

    return [
      pair('page heading', heading, document.body, 4.5),
      pair('search label', searchLabel, searchField, 4.5),
      pair('search input', searchInput, searchField, 4.5),
      pair('toolbar theme icon', trigger, document.body, 3),
      pair('theme menu item', menuItem, menuPanel, 4.5),
      pair('current theme indicator', currentTheme, menuPanel, 4.5),
      pair('search focus indicator', focusIndicator, searchField, 3, 'borderLeftColor'),
      pair('note title', noteTitle, noteCard, 4.5),
      pair('note content', noteContent, noteCard, 4.5),
      pair('note action icon', noteAction, noteCard, 3),
      pair('persistence error message', errorAlert, errorAlert, 4.5),
    ];
  });
}

test('meets WCAG 2.2 AA contrast thresholds for semantic color pairs', async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'biluca-notas-agentes.theme-preference') {
        throw new DOMException('Access denied', 'QuotaExceededError');
      }
      originalSetItem.call(this, key, value);
    };
  });
  await seedNotes(page, makeNotes(1));
  const trigger = page.getByRole('button', { name: 'Selecionar tema da aplicação' });
  const results: Record<
    string,
    Array<{ name: string; foreground: string; background: string; ratio: number }>
  > = {};

  for (const [label, mode] of [
    ['Claro', 'light'],
    ['Escuro', 'dark'],
  ]) {
    await trigger.click();
    await page.getByRole('menuitem', { name: label, exact: true }).click();
    await trigger.click();
    const renderedPairs = await readRenderedPairs(page);
    await page.keyboard.press('Escape');
    const tokenPairs = await readTokenPairs(page);
    const pairs = [...renderedPairs, ...tokenPairs];
    results[mode] = pairs.map(({ name, foreground, background }) => ({
      name,
      foreground,
      background,
      ratio: contrastRatio(foreground, background),
    }));
    for (const pair of pairs) {
      expect(
        contrastRatio(pair.foreground, pair.background),
        `${mode} ${pair.name}`,
      ).toBeGreaterThanOrEqual(pair.minimum);
    }
  }

  console.info(`Theme contrast results: ${JSON.stringify(results)}`);
});
