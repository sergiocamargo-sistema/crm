import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const initialHeading = 'Caixa de atendimento.';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: initialHeading, exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

test('busca, filtros, rascunhos e resposta simulada sem chamadas externas', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname.startsWith('/api/'))
      externalRequests.push(request.url());
  });
  const search = page.getByRole('searchbox', { name: 'Buscar conversa ou protocolo' });
  await search.fill('joao');
  await expect(page.locator('.conversation-row')).toHaveCount(1);
  await expect(page.locator('.conversation-row')).toContainText('João Pereira');
  await search.fill('2026-0148');
  await expect(page.locator('.conversation-row')).toHaveCount(1);
  await search.fill('inexistente-xyz');
  await expect(page.getByText('Nenhuma conversa encontrada')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page.locator('.conversation-row')).toHaveCount(8);
  await page
    .locator('.queue-filters')
    .getByRole('button', { name: /Minhas/ })
    .click();
  await expect(page.locator('.conversation-row')).toHaveCount(2);
  const reply = page.getByRole('textbox', { name: 'Escrever resposta', exact: true });
  await reply.fill('Rascunho da Mariana');
  await page.locator('.conversation-row').filter({ hasText: 'Beatriz Costa' }).click();
  await reply.fill('Rascunho da Beatriz');
  await page.locator('.conversation-row').filter({ hasText: 'Mariana Oliveira' }).click();
  await expect(reply).toHaveValue('Rascunho da Mariana');
  await page.getByRole('button', { name: 'Usar sugestão' }).click();
  await expect(reply).toHaveValue(/Mariana, estamos verificando/);
  await reply.press('Control+Enter');
  await expect(page.locator('.message-row--outgoing')).toHaveCount(2);
  await expect(reply).toHaveValue('');
  await expect(
    page.getByText('Resposta registrada na demonstração.', { exact: true }),
  ).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test('assumir, anexar, registrar nota e transferir preservam o contexto', async ({ page }) => {
  await page.locator('.conversation-row').filter({ hasText: 'João Pereira' }).click();
  await expect(page.getByRole('textbox', { name: 'Escrever resposta', exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Assumir conversa', exact: true }).click();
  await expect(page.locator('app-inbox-summary .metric').first()).toContainText('2');
  await page.getByRole('button', { name: 'Nota interna', exact: true }).click();
  const note = page.getByRole('textbox', { name: 'Escrever nota interna' });
  await note.fill('Confirmar o endereço antes do encaminhamento.');
  await page.getByRole('button', { name: 'Adicionar nota', exact: true }).click();
  await expect(page.locator('.message-row--note')).toContainText('Confirmar o endereço');
  await expect(page.getByRole('button', { name: 'Nota interna', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Responder', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'orientacao.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('Documento fictício'),
  });
  await expect(page.locator('.pending-attachments')).toContainText('orientacao.pdf');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(page.locator('.message-attachment')).toContainText('orientacao.pdf');
  await page.getByRole('button', { name: 'Transferir conversa', exact: true }).click();
  await expect(page.getByLabel('Novo responsável')).toBeFocused();
  await page.getByLabel('Novo responsável').selectOption('beatriz-lima');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Transferir conversa', exact: true })
    .click();
  await expect(page.locator('.assume-panel')).toContainText('Beatriz Lima');
  await expect(page.getByRole('textbox', { name: 'Escrever resposta', exact: true })).toHaveCount(
    0,
  );
  await expect(page.locator('.message-row--note')).toHaveCount(1);
});

test('encerrar não conclui o protocolo e a desconexão permite notas', async ({ page }) => {
  await page.getByRole('button', { name: 'Encerrar conversa', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Encerrar conversa', exact: true })
    .click();
  await expect(page.locator('.conversation-status')).toContainText('Conversa encerrada');
  await expect(page.locator('.desktop-context .case-card')).toContainText('Em andamento');
  await page.getByRole('button', { name: 'Reabrir conversa', exact: true }).click();
  await page.getByRole('button', { name: 'WhatsApp conectado' }).click();
  await page.getByRole('button', { name: 'Simular desconexão' }).click();
  await expect(page.locator('.connection-alert')).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Escrever resposta', exact: true })
    .fill('Uma resposta offline');
  await expect(page.getByRole('button', { name: 'Enviar', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Nota interna', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Escrever nota interna' })
    .fill('Nota mantida mesmo com o canal offline.');
  await page.getByRole('button', { name: 'Adicionar nota', exact: true }).click();
  await expect(page.locator('.message-row--note')).toContainText('canal offline');
  await page.getByRole('button', { name: 'Reconectar', exact: true }).click();
  await expect(page.locator('.connection-alert')).toHaveCount(0);
});

test('notificações, disponibilidade e modais funcionam por teclado', async ({ page }) => {
  await page.getByRole('button', { name: 'Abrir notificações' }).click();
  await expect(page.locator('#notifications-popover')).toBeVisible();
  await page.getByRole('button', { name: 'Marcar todas como lidas' }).click();
  await expect(page.locator('.popover-heading')).toContainText('0 novas');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Disponibilidade: disponível', exact: true }).click();
  await page.getByRole('button', { name: /Pausar atendimento/ }).click();
  await expect(page.getByRole('button', { name: 'Disponibilidade: pausada' })).toBeVisible();
  await page.locator('.conversation-row').filter({ hasText: 'João Pereira' }).click();
  await page.getByRole('button', { name: 'Assumir conversa', exact: true }).click();
  await expect(page.locator('.toast--error')).toContainText('Altere sua disponibilidade');
  await page.getByRole('button', { name: 'Ajuda sobre a demonstração' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ajuda sobre a demonstração' })).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('searchbox', { name: 'Buscar conversa ou protocolo' })).toBeFocused();
});

test('layout em sete larguras, celular e retorno à fila sem perder rascunho', async ({ page }) => {
  for (const width of [1536, 1440, 1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('.search-wrap')).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/home-mobile-list.png', fullPage: true });
  await page.locator('.conversation-row').filter({ hasText: 'Mariana Oliveira' }).click();
  await page
    .getByRole('textbox', { name: 'Escrever resposta', exact: true })
    .fill('Rascunho no celular');
  await page.getByRole('button', { name: 'Ver contexto do munícipe' }).click();
  await expect(page.getByRole('dialog')).toContainText('Mariana Oliveira');
  await page.getByRole('button', { name: 'Fechar janela', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar para as conversas' }).click();
  await expect(page.locator('.conversation-row').first()).toBeVisible();
  await page.locator('.conversation-row').filter({ hasText: 'Mariana Oliveira' }).click();
  await expect(page.getByRole('textbox', { name: 'Escrever resposta', exact: true })).toHaveValue(
    'Rascunho no celular',
  );
  await page.screenshot({ path: 'artifacts/home-mobile-conversation.png', fullPage: true });
  await page.getByRole('button', { name: 'Voltar para as conversas' }).click();
  await page.getByRole('button', { name: 'Abrir navegação' }).click();
  await expect(page.getByRole('dialog', { name: 'Navegação do gabinete' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir navegação' })).toBeFocused();
});

test('acessibilidade AA em desktop, celular e contexto em modal', async ({ page }, testInfo) => {
  const reports = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const results = await new AxeBuilder({ page }).analyze();
    reports.push({ width, violations: results.violations });
    expect(
      results.violations,
      JSON.stringify(
        results.violations.map((item) => ({
          id: item.id,
          nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
        })),
        null,
        2,
      ),
    ).toEqual([]);
  }
  await page.locator('.conversation-row').filter({ hasText: 'Mariana Oliveira' }).click();
  await page.getByRole('button', { name: 'Ver contexto do munícipe' }).click();
  const modal = await new AxeBuilder({ page }).analyze();
  reports.push({ width: 390, violations: modal.violations });
  await testInfo.attach('axe-report', {
    body: JSON.stringify(reports, null, 2),
    contentType: 'application/json',
  });
  expect(modal.violations).toEqual([]);
});
