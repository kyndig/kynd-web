import { expect, test } from '@playwright/test';

type Rgb = [number, number, number];

function parseRgb(value: string): Rgb {
  const match = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if (!match) {
    throw new Error(`Unexpected color format: ${value}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function channelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function contrastRatio(foreground: Rgb, background: Rgb): number {
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test('dark ContactCTA heading keeps AA contrast against accent badge background', async ({ page }) => {
  const baseUrls = [process.env.BASE_URL, 'http://localhost:4321', 'http://localhost:5173'].filter(
    (url): url is string => Boolean(url),
  );

  let resolvedUrl: string | undefined;
  for (const baseUrl of baseUrls) {
    const response = await page.goto(`${baseUrl}/tjenester`, { waitUntil: 'domcontentloaded' });
    if (response?.ok()) {
      resolvedUrl = baseUrl;
      break;
    }
  }

  expect(resolvedUrl, 'Expected a running local dev server. Set BASE_URL if needed.').toBeTruthy();

  const heading = page.locator('.contact-cta.dark h2');
  await expect(heading).toBeVisible();

  const styles = await heading.evaluate((node) => {
    const computed = window.getComputedStyle(node);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
    };
  });

  const ratio = contrastRatio(parseRgb(styles.color), parseRgb(styles.backgroundColor));

  // Guard against regressions like white text on bright accent.
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});
