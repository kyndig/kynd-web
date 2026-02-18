# CHANGELOG

All notable changes on the `overhaul` branch.

## [Unreleased]

### PR Bundle: Overhaul Foundation (ready for small PRs to `main`)

This bundle prepares the repository for the larger marketing/IA rewrite described in `OVERHAUL.md`, while keeping current routes and design tokens stable.

#### Build and CI reliability

- `5d68eee` Add pnpm build allow-list
  - Added `pnpm.onlyBuiltDependencies` in `package.json` for `@parcel/watcher`, `esbuild`, and `sharp`.
  - Prevents interactive build-script approval issues and keeps CI/local installs predictable.

#### Layout primitives and reuse

- `492f2b0` Add layout primitives
  - Added `src/components/layout/FullBleed.astro`.
  - Added `src/components/layout/Split.astro` as shared two-column primitive.

- `f3518a7` Support custom split columns for handbook
  - Extended `Split` with `columns` prop.
  - Migrated handbook page layout to `Split` while preserving sidebar/content proportions.

#### Navigation and conversion path

- `d0d76fa` Update navigation links
  - Reintroduced `Folka` in header navigation.
  - Added `Kontakt` entry pointing to `/#kontakt`.

#### Page-level refactors (atomic and route-safe)

- `66ab80c` Extract projects grid component
  - Moved projects grid markup/styles into `src/components/projects/ProjectGrid.astro`.
  - Simplified `src/pages/prosjekter/index.astro` to composition-only.

- `5de58b1` Adopt Split layout on home and about
  - Refactored sections in `src/pages/index.astro` and `src/pages/om-oss.astro` to use `Split`.
  - Added `id="kontakt"` on homepage contact section to support anchor navigation.

#### UX polish

- `4a8c746` Polish tokens and anchors
  - Added missing `--color-text-muted` token in `src/styles/variables.css`.
  - Updated global anchor offset in `src/styles/main.css` to account for sticky header.

## Expected PR path to `main`

To keep PRs small and manageable:

1. **PR A (Infra + primitives)**  
   `5d68eee`, `492f2b0`
2. **PR B (Navigation + route-safe page refactors)**  
   `d0d76fa`, `66ab80c`, `5de58b1`, `f3518a7`
3. **PR C (Polish and follow-up fixes)**  
   `4a8c746`

After these, the branch is ready for content/IA-focused PR slices aligned with `OVERHAUL.md`:

- Forside positioning rewrite
- Tjenester (for/not-for fit)
- Hvordan vi jobber
- Om Kynd + Join/Kultur separation
- Kontakt conversion flow
