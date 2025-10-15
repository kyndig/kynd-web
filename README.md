# Kynd Web

Kynd Web is built with [Astro](https://astro.build/) and hosted on [Netlify](https://www.netlify.com/).  
The project uses GitHub App authentication to automatically fetch content from GitHub Labs repositories.

---

## Getting Started

### 1. Install Dependencies

Make sure you have Node.js and `pnpm` installed:

```bash
pnpm install
```

### 2. Run Locally

Start the development server:

```bash
pnpm dev
```

Open [localhost:4321](http://localhost:4321) in your browser.

---

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

```
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

---

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

---

Made with 🫶 by [kynd](https://kynd.no)
