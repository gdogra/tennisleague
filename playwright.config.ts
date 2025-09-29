import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },
  webServer: {
    command: 'npm run preview -- --port=4173 --strictPort',
    url: 'http://localhost:4173',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});

