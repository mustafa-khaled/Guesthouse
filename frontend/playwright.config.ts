import { defineConfig, devices } from '@playwright/test';

const e2eEnv = {
  MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/guesthouse_e2e',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-at-least-32-characters',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-at-least-32-characters',
  NODE_ENV: 'development',
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.CI
    ? [
        {
          command: 'pnpm --filter ./backend dev',
          url: 'http://localhost:5000/health/ready',
          cwd: '..',
          name: 'Backend',
          reuseExistingServer: false,
          timeout: 120000,
          env: e2eEnv,
        },
        {
          command: 'pnpm dev',
          url: 'http://localhost:3001',
          name: 'Frontend',
          reuseExistingServer: false,
          timeout: 120000,
          env: {
            NEXT_PUBLIC_API_URL: apiUrl,
            BACKEND_URL: process.env.BACKEND_URL ?? apiUrl,
          },
        },
      ]
    : undefined,
});
