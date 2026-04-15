import { expect, test } from '@playwright/test';
import { assertNoAxeViolations } from './helpers/accessibility';

test('skip link reaches main content landmark', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', { name: 'Hopp til hovedinnhold' });
  await expect(skipLink).toBeVisible();
  await skipLink.click();
  await expect(page).toHaveURL(/#main-content$/);
});

test('theme toggle persists in local storage and keeps control state in sync', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const html = page.locator('html');
  const toggle = page.locator('[data-theme-toggle]').first();

  const initialTheme = await html.getAttribute('data-theme');
  const nextTheme = initialTheme === 'dark' ? 'light' : 'dark';

  await toggle.click();

  await expect(html).toHaveAttribute('data-theme', nextTheme);
  await expect(toggle).toHaveAttribute('aria-pressed', nextTheme === 'dark' ? 'true' : 'false');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(html).toHaveAttribute('data-theme', nextTheme);
  await expect(toggle).toHaveAttribute('aria-pressed', nextTheme === 'dark' ? 'true' : 'false');
});

test.describe('mobile navigation drawer', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('opens and closes via escape key', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const menuToggle = page.locator('#mobile-menu-toggle');
    const drawerMenu = page.locator('#drawer-menu');

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(drawerMenu).toHaveClass(/open/);
    await assertNoAxeViolations(page, { include: ['#drawer-menu'] });

    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(drawerMenu).not.toHaveClass(/open/);
  });
});
