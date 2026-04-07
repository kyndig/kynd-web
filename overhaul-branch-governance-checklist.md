# Overhaul Branch Governance Checklist

This checklist keeps `overhaul` as the controlled integration branch while preserving `main` as the production/deployment branch.

## Target operating model

- `main`: stable production branch, still used by Netlify production deploys.
- `overhaul`: gated integration branch for ongoing refactor work.
- `feature/*` (or similar): short-lived branches created from `overhaul`.

## 1) Keep production pinned to `main`

- [ ] In Netlify, verify **Production branch** is explicitly `main` (not "default branch").
- [ ] In GitHub Actions, verify production/release workflows trigger on `main` only.
- [ ] In any external tooling (bots, release scripts), verify references to production branch are explicitly `main`.

Why: if tooling follows "default branch" implicitly, changing repository defaults can cause accidental behavior shifts.

## 2) Keep GitHub default branch as `main` (recommended for now)

- [ ] Leave repository default branch as `main`.
- [ ] Use `overhaul` as PR base manually for all refactor work.
- [ ] Save `overhaul` as your preferred compare/base in local workflow templates (if used).

Why: this avoids surprising redirects in automation and team workflows while still giving full control over the `overhaul` lane.

## 3) Protect `overhaul` like an integration branch

In GitHub branch protections/rulesets for `overhaul`:

- [ ] Require pull request before merge.
- [ ] Require at least 1 approval.
- [ ] Dismiss stale approvals when new commits are pushed.
- [ ] Require status checks to pass before merge.
- [ ] Require branch to be up to date before merge.
- [ ] Restrict direct pushes (optional but recommended).
- [ ] Restrict force pushes and branch deletion.
- [ ] Enable conversation resolution requirement before merge.

Why: this enforces review discipline and prevents bypassing quality gates.

## 4) PR conventions for `overhaul`

- [ ] Every working branch is created from latest `overhaul`.
- [ ] Every PR uses `base: overhaul`.
- [ ] Keep PRs focused/small to reduce merge conflicts in long-running refactors.
- [ ] Prefer squash merge for feature branches into `overhaul` to keep history readable.
- [ ] Rebase or merge `overhaul` into feature branches frequently.

### Example local flow

```bash
git checkout overhaul
git pull --ff-only origin overhaul
git checkout -b feature/<short-scope-name>
# ...work...
git push -u origin feature/<short-scope-name>
# Open PR with base = overhaul
```

## 5) Sync strategy between `overhaul` and `main`

- [ ] Define cadence for back-merging/cherry-picking fixes from `main` into `overhaul` (for hotfixes).
- [ ] Define release checkpoints when `overhaul` is merged to `main`.
- [ ] At each checkpoint, run full CI + deploy rehearsal before touching `main`.

Why: long-lived branches drift quickly without explicit synchronization rules.

## 6) CI clarity and DRY guardrails

- [ ] Keep shared CI logic reusable (`workflow_call`, composite actions, or shared scripts) to avoid duplicated pipelines per branch.
- [ ] Separate branch-specific triggers from shared job definitions.
- [ ] Use one source of truth for required checks names across branch protections.

Why: duplicated workflow logic causes branch-specific drift and maintenance overhead.

## 7) Optional future switch (only when ready)

If you later want `overhaul` to become default branch:

- [ ] First audit all workflows/integrations for "default branch" assumptions.
- [ ] Mirror branch protections from `main` to `overhaul`.
- [ ] Confirm Netlify production still explicitly targets `main` (or planned replacement).
- [ ] Announce workflow change to collaborators and update contributing docs.

Only switch after automation is explicit and branch protections are equivalent.
