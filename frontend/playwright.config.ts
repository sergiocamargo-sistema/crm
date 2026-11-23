import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['PREVIEW_URL'] ?? 'http://127.0.0.1:4300',
    viewport: { width: 1440, height: 1000 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    launchOptions: {
      executablePath: process.env['CHROME_PATH'] ?? '/opt/google/chrome/chrome',
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
