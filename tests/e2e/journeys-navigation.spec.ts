import { expect, test } from '@playwright/test';

test('header navigation reaches core pages', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.getByRole('link', { name: 'Tjenester' }).first().click();
  await expect(page).toHaveURL(/\/tjenester$/);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Prosjekter' }).first().click();
  await expect(page).toHaveURL(/\/prosjekter$/);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Om Kynd' }).first().click();
  await expect(page).toHaveURL(/\/om-kynd$/);
});

test('footer links resolve to live destinations', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const footer = page.locator('footer');
  await footer.getByRole('link', { name: 'Ta en prat' }).click();
  await expect(page).toHaveURL(/\/kontakt$/);
});

test('home conversion CTA reaches contact page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const contactCtaLink = page
    .locator('a[href="/kontakt"]')
    .filter({ hasNot: page.locator('header a, footer a') })
    .first();

  await contactCtaLink.click();
  await expect(page).toHaveURL(/\/kontakt$/);
});

test('projects overview routes to detail page', async ({ page }) => {
  await page.goto('/prosjekter', { waitUntil: 'domcontentloaded' });

  const detailLink = page.locator('a[href^="/prosjekter/"]').first();
  await detailLink.click();
  await expect(page).toHaveURL(/\/prosjekter\/[^/]+$/);
});

test('employees overview routes to detail page', async ({ page }) => {
  await page.goto('/folka', { waitUntil: 'domcontentloaded' });

  const detailLink = page.locator('a[href^="/folka/"]').first();
  await detailLink.click();
  await expect(page).toHaveURL(/\/folka\/[^/]+$/);
});

test('project category filters activate from query params', async ({ page }) => {
  await page.goto('/prosjekter', { waitUntil: 'domcontentloaded' });

  const firstCardTags = await page
    .locator('[data-project-tags]')
    .first()
    .getAttribute('data-project-tags');
  const tagList = firstCardTags ? (JSON.parse(firstCardTags) as string[]) : [];
  const firstTag = tagList[0];

  if (!firstTag) {
    test.skip(true, 'No project tag available for category filtering.');
    return;
  }

  await page.goto(`/prosjekter?kategori=${encodeURIComponent(firstTag)}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator(`[data-category-value="${firstTag}"]`)).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('handbook navigation links set hash targets', async ({ page }) => {
  await page.goto('/bok', { waitUntil: 'domcontentloaded' });

  const handbookAnchor = page.locator('#nav-menu a[href^="#"]').first();
  await handbookAnchor.click();
  await expect(page).toHaveURL(/\/bok#.+/);
});
