import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/** Minimal .env file parser — avoids adding dotenv as a dependency. */
function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    // Only set if not already in environment (shell env takes precedence).
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function signInAndSave(
  baseURL: string,
  email: string,
  password: string,
  storagePath: string,
  label: string
): Promise<void> {
  console.log(`[global-setup] Signing in as ${label} (${email})…`);
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard — confirms login succeeded.
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

  await page.context().storageState({ path: storagePath });
  await browser.close();
  console.log(`[global-setup] Saved ${label} session → ${storagePath}`);
}

export default async function globalSetup(): Promise<void> {
  // Load test credentials from .env.test.local (gitignored).
  loadEnvFile(path.resolve('.env.test.local'));

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
  const stateDir = path.resolve('.playwright');
  fs.mkdirSync(stateDir, { recursive: true });

  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;
  const managerEmail = process.env.TEST_MANAGER_EMAIL;
  const managerPassword = process.env.TEST_MANAGER_PASSWORD;

  if (!adminEmail || !adminPassword || !managerEmail || !managerPassword) {
    throw new Error(
      '[global-setup] Missing test credentials.\n' +
        'Copy .env.test.local.example to .env.test.local and fill in:\n' +
        '  TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_MANAGER_EMAIL, TEST_MANAGER_PASSWORD'
    );
  }

  await signInAndSave(baseURL, adminEmail, adminPassword, path.join(stateDir, 'admin.json'), 'admin');
  await signInAndSave(baseURL, managerEmail, managerPassword, path.join(stateDir, 'manager.json'), 'manager');
}
