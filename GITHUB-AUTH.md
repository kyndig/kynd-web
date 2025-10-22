# Github Auth Flow and Setup

This document describes the authentication flow between our repository, GitHub Actions, and Netlify deployment. The GitHub App private key is securely shared across these environments using base64-encoded environment variables, enabling automated deployments and GitHub API access.

## Why this hassle

- GitHub generates keys in RSA (PKCS#1) format.
- Modern Node versions (20+, 22+, 24+) require PKCS#8.
- Conversion + base64 makes the key safe to use as an environment variable both locally and in CI/CD.

## Local setup

When you download the `.pem` key from the GitHub App:

1. Convert from RSA (PKCS#1) to PKCS#8 format:

```bash
openssl pkcs8 -topk8 -inform PEM -outform PEM \
  -in your-original-github-app-key.pem \
  -out github-app-key-pkcs8.pem -nocrypt
```

2. Change encoding to Base-64:

```bash
base64 github-app-key-pkcs8.pem | pbcopy
```

3. Add to `.env`

```text
GITHUB_APP_PRIVATE_KEY_B64=<paste the base64 string here>
```

Upon `pnpm build` the terminal should output `privateKeyStart: '-----BEGIN PRIVATE KEY-----'` (not `-----BEGIN RSA PRIVATE KEY-----`)

## Github Actions

In the repo, set `Settings ➡︎ Secrets and Variables ➡︎ Actions` create or update

```text
GH_APP_PRIVATE_KEY_B64=<same base64 value>
```

## Netlify

In `Netlify → Site configuration → Environment Variables`, create or update

```text
GITHUB_APP_PRIVATE_KEY_B64=<same base64 value>
```

Remember to check the "Contains secret value" checkbox.
Afterwards, run a Redeploy site.
Check in the Netlify logs that it shows:

```text
privateKeyStart: '-----BEGIN PRIVATE KEY-----'
```
