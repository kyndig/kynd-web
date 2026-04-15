# Kynd Web

Kynd Web is built with [Astro](https://astro.build/) and hosted on [Netlify](https://www.netlify.com/).  
The project uses GitHub App authentication to automatically fetch content from GitHub Labs repositories.

## Getting Started

### 1. Install Dependencies

Use a current [Node.js](https://nodejs.org/) release (this repo’s CI uses Node 24). Enable [Corepack](https://nodejs.org/api/corepack.html) once so the `pnpm` version matches `package.json` (`packageManager` field):

```bash
corepack enable
pnpm install
```

If `corepack: command not found` (common with Homebrew Node, which does not ship a `corepack` binary on `PATH`), install the CLI once, then enable:

```bash
npm install -g corepack
corepack enable
```

### 2. Run Locally

Start the development server:

```bash
pnpm dev
```

Open [localhost:4321](http://localhost:4321) in your browser.

## Build and Deploy

### Build Locally

```bash
pnpm build
```

### Netlify

Netlify automatically builds new deploys on merge to `main`.  
Environment variables for GitHub App and Slack are set in Netlify under  
`Site configuration → Environment variables`.

## GitHub App Authentication

Kynd-web fetches information about Labs repositories directly from GitHub via a GitHub App.  
This requires a private key handled via the environment variable:

```bash
GITHUB_APP_PRIVATE_KEY_B64=<base64-encoded PKCS#8 key>
```

This variable must be set in:

- `.env` (locally)
- GitHub Actions Secrets (`GITHUB_APP_PRIVATE_KEY_B64`)
- Netlify Environment Variables (`GITHUB_APP_PRIVATE_KEY_B64`)

## Technologies

- **Astro** – static generation and islands architecture
- **astro-icon** – icon system
- **TypeScript** – type support and stable code
- **Netlify** – hosting and CDN
- **GitHub App + Octokit** – data fetching for Labs overview
- **Slack Web API** – contact form integration

## Linting and Testing

Run type and lint checks:

```bash
pnpm check
```

Automatic fix for linting and formatting:

```bash
pnpm check:fix
```

Run ESLint only:

```bash
pnpm lint
```

## QA Automation

The repository has layered QA checks so regressions are caught early without making PR CI flaky:

- **Static quality**: `pnpm check`
- **Browser + accessibility checks**: `pnpm test:e2e`
- **Internal dead-link checks**: `pnpm check:links:internal`
- **External link drift checks**: scheduled workflow (`External Link Check`)

Quick local loop:

```bash
pnpm check
pnpm test:e2e
pnpm check:links:internal
```

See [QA-AUTOMATION.md](QA-AUTOMATION.md) for scope, CI behavior, and how to extend tests.

Made with 🫶 by [kynd](https://kynd.no)
