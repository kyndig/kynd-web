import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';

let octokitInstance: Octokit | null = null;

/**
 * Get authenticated Octokit instance for GitHub App
 * Uses caching to avoid recreating the instance on every call
 */
export async function getAuthenticatedOctokit(): Promise<Octokit> {
  if (octokitInstance) return octokitInstance;

  // Read from Astro's env (if SSR) or process.env (if Node)
  const appId = import.meta.env?.GITHUB_APP_ID || process.env.GITHUB_APP_ID;
  const installationId =
    import.meta.env?.GITHUB_APP_INSTALLATION_ID || process.env.GITHUB_APP_INSTALLATION_ID;

  const privateKey = import.meta.env?.GITHUB_APP_PRIVATE_KEY || process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !installationId || !privateKey) {
    throw new Error(
      'Missing GitHub App credentials. Please set GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, and GITHUB_APP_PRIVATE_KEY.',
    );
  }

  console.log('Creating GitHub App auth with:', {
    appId,
    installationId,
    privateKeyLength: privateKey.length,
    privateKeyStart: privateKey.substring(0, 30),
  });

  const app = new App({
    appId: parseInt(appId),
    privateKey, // PKCS#8 key
  });

  try {
    octokitInstance = (await app.getInstallationOctokit(parseInt(installationId))) as Octokit;
    console.log('✅ Successfully created Octokit instance');
  } catch (error) {
    console.error('❌ Failed to create Octokit instance:', error);
    throw error;
  }

  // Optional: verify authentication
  try {
    await octokitInstance.request('GET /app');
    console.log('✅ GitHub App authentication verified.');
  } catch (error) {
    console.error('❌ GitHub App authentication test failed:', error);
    throw error;
  }

  return octokitInstance;
}

/**
 * Simple test helper for local debugging
 */
export async function testGitHubAuth(): Promise<boolean> {
  try {
    const octokit = await getAuthenticatedOctokit();
    const { data } = await octokit.request('GET /app');
    console.log(`GitHub App authenticated as: ${data?.name || 'Unknown App'}`);
    return true;
  } catch (error) {
    console.error('GitHub App authentication failed:', error);
    return false;
  }
}
