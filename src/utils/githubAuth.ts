import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';

let octokitInstance: Octokit | null = null;

/**
 * Get authenticated Octokit instance for GitHub App
 * Uses caching to avoid recreating the instance on every call
 */
export async function getAuthenticatedOctokit(): Promise<Octokit> {
  if (octokitInstance) {
    return octokitInstance;
  }

  // Support both Astro's import.meta.env and Node.js process.env
  const appId = import.meta.env?.GITHUB_APP_ID || process.env.GITHUB_APP_ID;
  const installationId =
    import.meta.env?.GITHUB_APP_INSTALLATION_ID || process.env.GITHUB_APP_INSTALLATION_ID;
  const privateKey = import.meta.env?.GITHUB_APP_PRIVATE_KEY || process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !installationId || !privateKey) {
    throw new Error(
      'Missing GitHub App credentials. Please set GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, and GITHUB_APP_PRIVATE_KEY environment variables.',
    );
  }

  console.log('Creating GitHub App auth with:', {
    appId: appId,
    installationId: installationId,
    privateKeyLength: privateKey.length,
    privateKeyStart: privateKey.substring(0, 30),
  });

  const app = new App({
    appId: parseInt(appId),
    privateKey,
  });

  try {
    octokitInstance = (await app.getInstallationOctokit(parseInt(installationId))) as Octokit;
    console.log('Successfully created Octokit instance');
  } catch (error) {
    console.error('Failed to create Octokit instance:', error);
    throw error;
  }

  // Test the authentication immediately
  try {
    // Use the request method directly
    await octokitInstance.request('GET /app');
    console.log('✅ GitHub App authentication successful!');
  } catch (error) {
    console.error('GitHub App authentication test failed:', error);
    throw error;
  }

  return octokitInstance;
}

/**
 * Test GitHub App authentication
 */
export async function testGitHubAuth(): Promise<boolean> {
  try {
    const octokit = await getAuthenticatedOctokit();
    const { data } = await octokit.request('GET /app');
    console.log(`GitHub App authenticated: ${data?.name || 'Unknown'}`);
    return true;
  } catch (error) {
    console.error('GitHub App authentication failed:', error);
    return false;
  }
}
