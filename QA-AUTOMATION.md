# QA Automation

This document describes the automated quality layers used in `kynd-web`, what each layer catches, and how to extend them without introducing brittle tests.

## QA Layers

### 1. Static checks (`pnpm check`)

Runs:

- `astro check`
- `tsc`
- `eslint`
- `prettier --check`

Purpose:

- catch type errors, lint violations, and formatting drift before runtime tests
- keep accessibility linting from `eslint-plugin-astro` and `jsx-a11y` enforced

### 2. Browser + accessibility checks (`pnpm test:e2e`)

Uses Playwright (`playwright.config.ts`) and includes:

- focused contrast regression checks
- route-level axe scans for key pages
- keyboard/control flows in shared shell components (skip link, theme toggle, mobile drawer)
- journey smoke coverage for navigation and conversion paths

Purpose:

- catch rendered accessibility regressions and broken interactive behavior
- verify that high-value journeys still reach meaningful destinations

### 3. Internal dead-link checks (`pnpm check:links:internal`)

Runs a local static server over `dist` and crawls internal links with Linkinator.

Purpose:

- fail fast in PRs when route, anchor, or asset links inside the site no longer resolve
- avoid false positives from non-local URLs and Netlify image proxy URLs

### 4. External link drift checks (`check:links:external`)

Executed by `.github/workflows/external-link-check.yml` on a schedule and on manual dispatch.

Purpose:

- monitor third-party URL drift without blocking pull-request merges
- keep signal high while avoiding flaky CI from external outages

## CI Behavior

`CI` workflow (`.github/workflows/ci.yml`) runs the blocking QA sequence:

1. install dependencies
2. issue hygiene tests
3. `pnpm check`
4. `pnpm build`
5. Playwright browser install
6. `pnpm test:e2e:ci`
7. `pnpm check:links:internal`

`External Link Check` workflow is non-blocking and intended for visibility/reporting.

## How to Extend Tests

### Add a new accessibility scan

1. Add route or scenario coverage under `tests/e2e/`.
2. Reuse `tests/e2e/helpers/accessibility.ts`.
3. Keep assertions scoped and explicit (avoid giant one-test-does-everything files).

### Add a new user journey smoke test

1. Prefer stable selectors (`role`, explicit IDs, durable data attributes).
2. Validate an outcome (URL/state/content), not only a click.
3. Keep flow tests short and deterministic.

### Add link-check rules

If a crawler false positive appears:

1. confirm whether it is a real broken path
2. if not, add a targeted skip pattern with rationale
3. avoid broad skip regexes that hide legitimate regressions

## Non-goals

- These checks do not replace manual exploratory testing.
- Automated checks can validate proxies for usability, but not qualitative user comprehension.
- External links are monitored, not used as PR merge blockers.

## Local Validation Before Push

Run the same layers that PR CI expects:

```bash
pnpm check
pnpm build
pnpm test:e2e
pnpm check:links:internal
```
