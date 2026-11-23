import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`ficha monta por completo mesmo sem as fotos externas em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && /\bNG\d+|RuntimeError/.test(message.text())) {
        errors.push(message.text());
      }
    });
    await page.route('https://images.unsplash.com/**', (route) => route.abort());
    await page.goto('/municipes/cid-mariana', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /^Mariana Oliveira/ })).toBeVisible();
    await expect(page.locator('.interaction-card')).toHaveCount(9);
    await expect(
      page.getByRole('button', { name: 'Registrar novo contato com o munícipe' }),
    ).toBeVisible();
    await expect(page.locator('.photo-dialog img')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('ampliar fotos cria o conteúdo do diálogo apenas ao abrir e navega sem erro', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /\bNG\d+|RuntimeError/.test(message.text()))
      errors.push(message.text());
  });
  await page.route('https://images.unsplash.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1000"><rect width="900" height="1000" fill="#dce3ee"/></svg>',
    }),
  );
  await page.goto('/municipes/cid-mariana', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.interaction-card')).toHaveCount(9);
  await expect(page.locator('.photo-dialog img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver todas as fotos do munícipe' }).click();
  const dialog = page.getByRole('dialog', { name: 'Fotos do munícipe' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveCount(1);
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(dialog.locator('figcaption')).toContainText('2 de 4');
  await page.getByRole('button', { name: 'Fechar fotos' }).click();
  await expect(dialog).toBeHidden();
  await expect(dialog.locator('img')).toHaveCount(0);
  await page.locator('#global-citizen-search').fill('joao');
  await page.locator('.citizen-result').first().click();
  await expect(page).toHaveURL(/\/municipes\/cid-joao$/);
  await expect(page.getByRole('heading', { name: 'João Pereira', exact: true })).toBeVisible();
  await expect(page.locator('.interaction-card')).toHaveCount(9);
  expect(errors).toEqual([]);
});

test('filtros e novo contato continuam funcionando com as fotos indisponíveis', async ({
  page,
}) => {
  await page.route('https://images.unsplash.com/**', (route) => route.abort());
  await page.goto('/municipes/cid-mariana', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.interaction-card')).toHaveCount(9);
  await page.getByRole('button', { name: 'Filtrar linha do tempo', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar', exact: true }).fill('iluminacao');
  await expect(page.locator('.interaction-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await page.getByRole('button', { name: 'Registrar novo contato com o munícipe' }).click();
  const dialog = page.getByRole('dialog', { name: 'Novo contato' });
  await dialog.getByLabel('Tipo de contato').selectOption('attendance');
  await dialog.getByLabel('Título', { exact: true }).fill('Retorno de investigação');
  await dialog
    .getByLabel('Descrição')
    .fill('Registro de demonstração para conferir que o histórico permanece interativo.');
  await dialog.getByRole('button', { name: 'Registrar contato', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('.interaction-card')).toHaveCount(10);
  await expect(page.locator('.interaction-card').first()).toContainText('Retorno de investigação');
});
