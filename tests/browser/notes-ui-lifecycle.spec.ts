import { expect, test } from '@playwright/test';
import { seedNotes } from './helpers';

test('creates a note on the collection page and opens its details in an accessible modal', async ({
  page,
}) => {
  await seedNotes(page, []);

  const titleField = page.getByRole('textbox', { name: 'Título' });
  await titleField.fill('Nota modal');
  await page.getByRole('textbox', { name: 'Conteúdo' }).fill('Conteúdo da nota');
  await page.getByRole('button', { name: 'Criar nota' }).click();
  await expect(page.getByRole('status')).toContainText('Nota criada com sucesso.');

  const openButton = page.getByRole('button', { name: 'Nota modal', exact: true });
  await expect(openButton).toBeVisible();
  await openButton.click();

  const dialog = page.getByRole('dialog', { name: 'Nota modal' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Conteúdo da nota')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();

  await openButton.click();
  await dialog.getByRole('button', { name: 'Fechar detalhe da nota' }).click();
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();
});

test('preserves a transparent note background when editing and saving', async ({ page }) => {
  await seedNotes(page, []);
  await page.getByRole('textbox', { name: 'Título' }).fill('Nota transparente');
  await page.getByRole('button', { name: 'Criar nota' }).click();

  const openButton = page.getByRole('button', { name: 'Nota transparente', exact: true });
  await openButton.click();
  const dialog = page.getByRole('dialog', { name: 'Nota transparente' });
  await dialog.getByRole('button', { name: 'Editar nota' }).click();

  await expect(page.getByRole('checkbox', { name: 'Fundo transparente' })).toBeChecked();
  await page.getByRole('button', { name: 'Salvar nota' }).click();

  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.detail-card')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('applies a background color selected in the creation form', async ({ page }) => {
  await seedNotes(page, []);
  await page.getByRole('textbox', { name: 'Título' }).fill('Nota colorida');
  await page.locator('input[type="color"]').evaluate((element) => {
    const colorInput = element as HTMLInputElement;
    colorInput.value = '#123456';
    colorInput.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(page.getByRole('checkbox', { name: 'Fundo transparente' })).not.toBeChecked();
  await page.getByRole('button', { name: 'Criar nota' }).click();
  await expect(page.getByTestId('note-card').first()).toHaveCSS('background-color', 'rgb(18, 52, 86)');
});
