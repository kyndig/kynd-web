import { test } from '@playwright/test';
import { assertNoAxeViolations } from './helpers/accessibility';

const routeCases = [
  '/',
  '/tjenester',
  '/kontakt',
  '/prosjekter',
  '/om-kynd',
  '/bli-en-av-oss',
  '/prosjekter/cognite',
  '/folka/axel',
];

for (const route of routeCases) {
  test(`axe: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await assertNoAxeViolations(page);
  });
}
