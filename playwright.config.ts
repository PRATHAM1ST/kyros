import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 90000,
  expect: {timeout: 20000},
  workers: 1,
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
