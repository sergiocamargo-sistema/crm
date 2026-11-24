import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const modules = [
  'Munícipes',
  'Tarefas',
  'Solicitações',
  'Conversas',
  'Projetos de lei',
  'Leis',
  'Relatórios',
  'Configurações',
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'O que você precisa fazer hoje?' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

test('home mantém os oito acessos atuais e guarda conversas fora da home', async ({ page }) => {
  await expect(page.locator('.module-label')).toHaveText(modules);
  await expect(page.locator('.module-tile app-icon')).toHaveCount(8);
  await expect(page.locator('app-conversation-panel')).toHaveCount(0);
  await expect(page.getByText('Espaço de trabalho', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Munícipes', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Em breve' })).toContainText('Munícipes');
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: 'Conversas', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Em breve' })).toContainText('Conversas');
  await expect(page.locator('app-conversation-panel')).toHaveCount(0);
});

test('marca e guia visual compartilham os ativos e permitem uso por teclado', async ({ page }) => {
  await expect(
    page.getByRole('link', { name: 'Sérgio Camargo · Início', exact: true }),
  ).toBeVisible();
  const logo = page.locator('app-header .brand-logo');
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(
    true,
  );
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--brand-blue').trim(),
    ),
  ).toBe('#064ea0');
  await page.goto('/design-system/index.html');
  await expect(page.getByRole('heading', { name: 'Design system do gabinete.' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const report = await new AxeBuilder({ page }).analyze();
    expect(
      report.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })),
    ).toEqual([]);
  }
  expect(
    await page
      .locator('.brand-specimen img')
      .evaluateAll((images: HTMLImageElement[]) =>
        images.every((img) => img.complete && img.naturalWidth > 0),
      ),
  ).toBe(true);
  const open = page.getByRole('button', { name: 'Ver diálogo', exact: true });
  await open.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const modalReport = await new AxeBuilder({ page }).analyze();
  expect(modalReport.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(open).toBeFocused();
  await page.getByRole('button', { name: 'Salvar cadastro', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Botão primário');
});

test('busca global por nome, telefone, estado vazio e resumo sem chamadas de API', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname.startsWith('/api/'))
      requests.push(request.url());
  });
  const search = page.getByRole('searchbox', { name: 'Buscar munícipe', exact: true });
  await search.fill('joao');
  const results = page.getByRole('region', { name: 'Resultados da busca de munícipes' });
  await expect(results).toBeVisible();
  await expect(page.locator('.citizen-result')).toHaveCount(1);
  await expect(results).toContainText('João Pereira');
  await search.fill('11900000004');
  await expect(results).toContainText('Carlos Eduardo');
  await search.fill('nao-existe-xyz');
  await expect(results).toContainText('Nenhum munícipe encontrado');
  await search.fill('mariana');
  await results.getByRole('button', { name: /Mariana Oliveira/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Mariana Oliveira');
  await expect(page.getByRole('dialog')).toContainText('Jardim das Flores');
  await page.getByRole('button', { name: 'Fechar resumo do munícipe' }).click();
  await expect(search).toBeFocused();
  await page.getByRole('button', { name: 'Limpar busca' }).click();
  await expect(search).toHaveValue('');
  await expect(results).toBeHidden();
  expect(requests).toEqual([]);
});

test('atalho, setas, Enter e Escape permitem usar a busca pelo teclado', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Buscar munícipe', exact: true });
  await page.keyboard.press('Control+k');
  await expect(search).toBeFocused();
  await search.fill('Mariana');
  await search.press('Escape');
  await expect(page.locator('#citizen-search-results')).toBeHidden();
  await search.press('ArrowDown');
  await expect(page.locator('.citizen-result').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('Mariana Oliveira');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(search).toBeFocused();
});

test('botões quadrados em duas colunas no celular, quatro no desktop e busca sempre acessível', async ({
  page,
}) => {
  for (const width of [320, 390, 600, 768, 1024, 1440, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const geometry = await page.locator('.module-tile').evaluateAll((tiles) =>
      tiles.map((tile) => {
        const box = tile.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }),
    );
    const columns = geometry.filter((tile) => Math.abs(tile.y - geometry[0].y) < 1).length;
    expect(columns).toBe(width <= 600 ? 2 : 4);
    for (const tile of geometry) expect(Math.abs(tile.width - tile.height)).toBeLessThan(1.1);
    if (width <= 600) {
      await expect(page.getByRole('button', { name: 'Abrir busca de munícipe' })).toBeVisible();
      await expect(page.locator('#global-citizen-search')).toBeHidden();
    } else {
      await expect(
        page.getByRole('searchbox', { name: 'Buscar munícipe', exact: true }),
      ).toBeVisible();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.module-tile').last().scrollIntoViewIfNeeded();
  expect(
    await page
      .getByRole('button', { name: 'Abrir busca de munícipe' })
      .evaluate((element) => element.getBoundingClientRect().top),
  ).toBeLessThan(80);
  await page.getByRole('button', { name: 'Abrir busca de munícipe' }).click();
  await page.getByRole('searchbox', { name: 'Buscar munícipe', exact: true }).fill('Luciana');
  await expect(page.locator('.citizen-result')).toContainText('Luciana Alves');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('axe em desktop, celular, resultados e resumo de munícipe', async ({ page }, testInfo) => {
  const reports = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const report = await new AxeBuilder({ page }).analyze();
    reports.push({ state: `home-${width}`, violations: report.violations });
    expect(
      report.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })),
    ).toEqual([]);
  }
  await page.getByRole('button', { name: 'Abrir busca de munícipe' }).click();
  await page.getByRole('searchbox', { name: 'Buscar munícipe', exact: true }).fill('Mariana');
  const results = await new AxeBuilder({ page }).analyze();
  reports.push({ state: 'resultados', violations: results.violations });
  expect(
    results.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
  ).toEqual([]);
  await page.locator('.citizen-result').first().click();
  const modal = await new AxeBuilder({ page }).analyze();
  reports.push({ state: 'resumo', violations: modal.violations });
  await testInfo.attach('axe-report', {
    body: JSON.stringify(reports, null, 2),
    contentType: 'application/json',
  });
  expect(modal.violations).toEqual([]);
});

test('busca expandida respeita os dois paddings com barra de rolagem', async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.style.scrollbarGutter = 'stable';
  });
  for (const width of [320, 346, 360, 361, 390, 600]) {
    await page.setViewportSize({ width, height: 640 });
    await page.getByRole('button', { name: 'Abrir busca de munícipe' }).click();
    await expect(page.locator('#global-citizen-search')).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const header = document.querySelector<HTMLElement>('.topbar-inner')!;
          const field = document.querySelector<HTMLElement>('#citizen-search-panel')!;
          const headerBox = header.getBoundingClientRect();
          const fieldBox = field.getBoundingClientRect();
          const padding = getComputedStyle(header);
          return Math.max(
            Math.abs(fieldBox.left - headerBox.left - parseFloat(padding.paddingLeft)),
            Math.abs(headerBox.right - fieldBox.right - parseFloat(padding.paddingRight)),
          );
        }),
      )
      .toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    if (width === 361) {
      await page.locator('#global-citizen-search').fill('joao');
      await expect(page.locator('.citizen-result')).toContainText('João Pereira');
      const edges = await page.evaluate(() => {
        const field = document.querySelector('#citizen-search-panel')!.getBoundingClientRect();
        const results = document.querySelector('#citizen-search-results')!.getBoundingClientRect();
        return [Math.abs(field.left - results.left), Math.abs(field.right - results.right)];
      });
      expect(Math.max(...edges)).toBeLessThan(1);
    }
    await page.getByRole('button', { name: 'Fechar busca', exact: true }).click();
    await expect(page.locator('#global-citizen-search')).toBeHidden();
  }
});

test.describe('busca por toque no celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('expande com animação, foca no toque e preserva a busca ao fechar', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Abrir busca de munícipe' });
    const input = page.locator('#global-citizen-search');
    const panel = page.locator('#citizen-search-panel');
    await expect(input).toBeHidden();
    // Pausa a transição no meio para conferir expansão real, sem sleeps.
    await trigger.evaluate((button) => {
      button.addEventListener(
        'click',
        () => {
          const element = document.querySelector('#citizen-search-panel')!;
          for (const animation of element.getAnimations()) {
            if (
              animation instanceof CSSTransition &&
              animation.transitionProperty === 'inline-size'
            ) {
              animation.pause();
              animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
            }
          }
        },
        { once: true },
      );
    });
    await trigger.tap();
    await expect(input).toBeFocused();
    const intermediateWidth = await panel.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(intermediateWidth).toBeGreaterThan(44);
    expect(intermediateWidth).toBeLessThan(358);
    await panel.evaluate((element) =>
      element.getAnimations().forEach((animation) => animation.finish()),
    );
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await input.fill('joao');
    await expect(page.locator('.citizen-result')).toContainText('João Pereira');
    await page.getByRole('button', { name: 'Fechar busca', exact: true }).tap();
    await expect(input).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.tap();
    await expect(input).toBeFocused();
    expect(
      await input.evaluate((element: HTMLInputElement) => [
        element.selectionStart,
        element.selectionEnd,
      ]),
    ).toEqual([0, 4]);
    await input.fill('Mariana');
    await page.locator('.citizen-result').first().tap();
    await expect(page.getByRole('dialog')).toContainText('Mariana Oliveira');
    await page.getByRole('button', { name: 'Fechar resumo do munícipe' }).tap();
    await expect(input).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.tap();
    await input.press('Escape');
    await expect(input).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('respeita movimento reduzido e mantém foco ao trocar para desktop', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const trigger = page.getByRole('button', { name: 'Abrir busca de munícipe' });
    const input = page.locator('#global-citizen-search');
    const panel = page.locator('#citizen-search-panel');
    await trigger.tap();
    await expect(input).toBeFocused();
    expect(await panel.evaluate((element) => element.getAnimations().length)).toBe(0);
    expect(await panel.evaluate((element) => element.getBoundingClientRect().width)).toBe(358);
    await input.fill('Mariana');
    await page.setViewportSize({ width: 900, height: 844 });
    await expect(trigger).toBeHidden();
    await expect(panel).not.toHaveAttribute('popover');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Mariana');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(input).toBeFocused();
    await page.getByRole('button', { name: 'Munícipes', exact: true }).tap();
    await expect(input).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
