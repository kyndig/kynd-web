import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export async function assertNoAxeViolations(
  page: Page,
  {
    include,
  }: {
    include?: string[];
  } = {},
) {
  const builder = new AxeBuilder({ page });

  for (const selector of include || []) {
    builder.include(selector);
  }

  const results = await builder.analyze();
  expect(results.violations, formatViolations(results.violations)).toEqual([]);
}

function formatViolations(
  violations: Array<{
    id: string;
    impact?: string | null;
    nodes: Array<{ target: string[]; failureSummary?: string | null }>;
  }>,
) {
  if (violations.length === 0) {
    return 'No accessibility violations found.';
  }

  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(' > ')).join(', ');
      const summaries = violation.nodes
        .map((node) => node.failureSummary)
        .filter(Boolean)
        .join(' | ');
      return `${violation.id} (${violation.impact ?? 'no-impact'}): ${targets}${summaries ? ` => ${summaries}` : ''}`;
    })
    .join('\n');
}
