import { expect, test } from '@playwright/test';
import { makeNotes, seedNotes } from './helpers';

test('announces another editing tab and supports explicit overwrite and reload', async ({
  context,
}) => {
  const firstPage = await context.newPage();
  await seedNotes(firstPage, makeNotes(2));
  const secondPage = await context.newPage();
  await firstPage.goto('/notes/note-0000/edit');
  await secondPage.goto('/notes/note-0000/edit');
  await expect(
    secondPage.getByText('Esta nota já está aberta para edição em outra aba.'),
  ).toBeVisible();

  await firstPage.getByLabel('Título').fill('Versão salva primeiro');
  await firstPage.getByRole('button', { name: 'Salvar nota' }).click();
  await secondPage.getByLabel('Título').fill('Versão sobrescrita explicitamente');
  await secondPage.getByRole('button', { name: 'Salvar nota' }).click();
  await expect(secondPage.getByText('Esta nota foi alterada em outra aba.')).toBeVisible();
  await secondPage.getByRole('button', { name: 'Salvar meu rascunho como versão atual' }).click();
  await expect(
    secondPage.getByRole('heading', { name: 'Versão sobrescrita explicitamente' }),
  ).toBeVisible();

  await firstPage.goto('/notes/note-0001/edit');
  await secondPage.goto('/notes/note-0001/edit');
  await firstPage.getByLabel('Título').fill('Versão atual para recarregar');
  await firstPage.getByRole('button', { name: 'Salvar nota' }).click();
  await secondPage.getByLabel('Título').fill('Rascunho que será descartado');
  await secondPage.getByRole('button', { name: 'Salvar nota' }).click();
  await expect(secondPage.getByText('Esta nota foi alterada em outra aba.')).toBeVisible();
  await secondPage.getByRole('button', { name: 'Descartar meu rascunho e recarregar' }).click();
  await expect(secondPage.getByLabel('Título')).toHaveValue('Versão atual para recarregar');
});
