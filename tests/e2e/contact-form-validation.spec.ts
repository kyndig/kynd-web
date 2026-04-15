import { expect, test } from '@playwright/test';
import { assertNoAxeViolations } from './helpers/accessibility';

test('contact form surfaces validation errors in aria-live region', async ({ page }) => {
  await page.goto('/kontakt', { waitUntil: 'domcontentloaded' });

  const form = page.locator('.contact-form');
  const errorRegion = page.locator('.form-error');

  await page.evaluate(() => {
    const formElement = document.querySelector<HTMLFormElement>('.contact-form');
    if (formElement) {
      formElement.noValidate = true;
    }
  });

  await form.getByRole('button', { name: 'Send' }).click();

  await expect(errorRegion).toBeVisible();
  await expect(errorRegion).toContainText('Ugyldig e-post');
  await assertNoAxeViolations(page, { include: ['.contact-form'] });
});
