# Foundation Handoff Checklist

This document defines completion gates for foundation issues and the delivery contract that downstream component/page work depends on.

## Issue Mapping

- `#31` token foundation:
  - `src/styles/variables.css`
  - `astro.config.mjs`
  - `src/components/BaseHead.astro`
  - `src/styles/button.css`
- `#32` dark mode infrastructure:
  - `src/components/BaseHead.astro`
  - `src/layouts/Base.astro`
  - `src/components/Header.astro`
- `#27` epic completion:
  - Contract and validation gates in this file

## Foundation Contracts for Downstream Issues

- Use semantic tokens (`--color-background`, `--color-surface*`, `--color-border`, `--color-on-primary`) instead of raw palette variables in shared/page styles.
- Theme state is global and root-driven via `html[data-theme]`. Do not add page-local theme state.
- Persisted theme key is `kynd-theme` in `localStorage`.
- `Header` is the canonical location for end-user theme toggle.
- Display/hero typography must use the heading scale tokens (`--fs-heading-l`, `--fs-heading-xl`, `--fs-heading-2xl`) and optional `--font-display`.

## Validation Gates (Definition of Done)

### 1) FOUC safety

- Hard refresh with no saved theme and dark OS setting:
  - First paint should already be dark.
- Hard refresh with saved light theme:
  - First paint should stay light.
- No visible flash where text/background swaps after content is painted.

### 2) Theme persistence and behavior

- Toggle theme from header on desktop, reload page, and verify persistence.
- Toggle theme from mobile drawer, reload page, and verify persistence.
- Ensure both toggles remain synchronized after interaction.

### 3) Token integrity

- Confirm these tokens exist in `variables.css`:
  - `--color-surface`, `--color-surface-low`, `--color-surface-high`
  - `--color-border`, `--color-on-primary`
  - `--fs-heading-xl`, `--fs-heading-2xl`
- Confirm dark overrides are defined under `:root[data-theme='dark']`.
- Confirm shared button styles consume semantic tokens and not raw hex values.

### 4) Regression checks

- Header mobile drawer open/close behavior remains unchanged.
- Existing pages remain buildable and legible in both themes.
- Lint and build pass:
  - `pnpm lint`
  - `pnpm build`

## Epic #27 Closure Checklist

- `#31` and `#32` are complete and merged.
- Semantic token contract is documented and visible to downstream owners.
- Theme initialization + persistence is stable and verified.
- Known downstream dependencies (`#33`, `#34`) can proceed without redefining theme/token infrastructure.
- No orphan foundation tasks remain outside the epic dependency chain.
