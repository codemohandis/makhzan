/**
 * E2E tests for Spec 09 — Role Elevation
 * Covers all manual DoD items from .claude/specs/feature-specs/09-role-elevation.md
 *
 * Prerequisites:
 *   1. Fill in .env.test.local with TEST_ADMIN_* and TEST_MANAGER_* credentials.
 *   2. Run `npm run dev` (or let Playwright start it via webServer config).
 *   3. Your test Supabase project must have at least one admin and one manager user.
 */

import { test, expect } from '@playwright/test';

// Serial mode prevents race conditions between tests that mutate DB state
// (e.g. the role-badge test briefly promotes the manager user to admin).
test.describe.configure({ mode: 'serial' });

const USERS_URL = '/dashboard/users';

// ── 1. Unauthenticated redirect ───────────────────────────────────────────────

test.describe('Unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('GET /dashboard/users redirects to /login', async ({ page }) => {
    await page.goto(USERS_URL);
    await expect(page).toHaveURL(/\/login/);
  });
});

// ── 2. Manager redirect ───────────────────────────────────────────────────────

test.describe('Manager session', () => {
  test.use({ storageState: '.playwright/manager.json' });

  test('GET /dashboard/users redirects to /dashboard', async ({ page }) => {
    await page.goto(USERS_URL);
    // Should land on /dashboard, not /dashboard/users
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

// ── 3–7. Admin tests ──────────────────────────────────────────────────────────

test.describe('Admin session', () => {
  test.use({ storageState: '.playwright/admin.json' });

  test('users table is visible with role badges', async ({ page }) => {
    await page.goto(USERS_URL);
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toContainText('Role');
    // At least one role badge should be present.
    await expect(page.locator('span.rounded-full').first()).toBeVisible();
  });

  test('role badge updates without page reload after change', async ({ page }) => {
    await page.goto(USERS_URL);

    // Target: a row that is NOT "you" and is currently a Manager.
    const managerRow = page.locator('tbody tr')
      .filter({ hasNot: page.locator('span:has-text("(you)")') })
      .filter({ has: page.locator('span.rounded-full:has-text("Manager")') })
      .first();

    const rowCount = await managerRow.count();
    if (rowCount === 0) {
      test.skip(true, 'No non-self manager found in test DB — seed one first');
      return;
    }

    // Accept the confirm dialog automatically.
    page.once('dialog', (d) => d.accept());
    await managerRow.locator('select').selectOption('admin');

    // Badge should update to "Admin" without a full reload.
    await expect(managerRow.locator('span.rounded-full')).toHaveText('Admin', { timeout: 5_000 });

    // Restore: change back to Manager.
    page.once('dialog', (d) => d.accept());
    await managerRow.locator('select').selectOption('manager');
    await expect(managerRow.locator('span.rounded-full')).toHaveText('Manager', { timeout: 5_000 });
  });

  test('shows correct warning when admin demotes themselves', async ({ page }) => {
    await page.goto(USERS_URL);

    const selfRow = page.locator('tbody tr')
      .filter({ has: page.locator('span:has-text("(you)")') });

    const selfCount = await selfRow.count();
    if (selfCount === 0) {
      test.skip(true, 'Could not identify the current user row');
      return;
    }

    // The current user must be Admin for this test to be meaningful.
    const selfBadge = selfRow.locator('span.rounded-full');
    const selfRole = await selfBadge.textContent();
    if (selfRole?.trim() !== 'Admin') {
      test.skip(true, 'Current user is not an admin — skipping self-demotion test');
      return;
    }

    let dialogMessage = '';
    page.once('dialog', (d) => {
      dialogMessage = d.message();
      d.dismiss(); // Don't actually demote.
    });

    await selfRow.locator('select').selectOption('manager');

    // Count admin users to determine which warning to expect.
    const adminBadgeCount = await page.locator('span.rounded-full:has-text("Admin")').count();

    if (adminBadgeCount === 1) {
      // Self is the last admin — must see the last-admin-specific warning.
      expect(dialogMessage).toContain('last admin');
    } else {
      // Multiple admins — must see the general self-demotion warning.
      expect(dialogMessage).toContain('demoting yourself');
    }
  });

  test('no horizontal overflow with lang="ur" (RTL)', async ({ page }) => {
    await page.goto(USERS_URL);
    await expect(page.locator('table')).toBeVisible();

    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'ur');
      document.documentElement.setAttribute('dir', 'rtl');
    });

    // Horizontal overflow is the most common RTL layout break.
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 2); // 2px tolerance for borders
  });

  test('no horizontal overflow with lang="fa" (RTL)', async ({ page }) => {
    await page.goto(USERS_URL);
    await expect(page.locator('table')).toBeVisible();

    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'fa');
      document.documentElement.setAttribute('dir', 'rtl');
    });

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });
});
