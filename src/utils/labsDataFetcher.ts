import { getAuthenticatedOctokit } from './githubAuth';
import { detectTechnologiesFromGitHub } from './githubTechnologyDetection';
import type { DetectedTechnologies } from './githubTechnologyDetection';
import type { Octokit } from '@octokit/rest';

export type LabRepoData = {
  id: string;
  title: string;
  description: string;
  readme: string;
  githubUrl: string;
  isPrivate: boolean;
  category: string;
  repoStatus: 'active' | 'completed' | 'experimental';
  technologies: DetectedTechnologies;
  repoData: {
    name: string;
    fullName: string;
    description: string | null;
    language: string | null;
    stargazersCount: number;
    forksCount: number;
    openIssuesCount: number;
    updatedAt: string;
    createdAt: string;
    topics: string[];
    defaultBranch: string;
    homepage: string | null;
  };
  contributors: {
    login: string;
    avatarUrl: string;
    contributions: number;
  }[];
  languages: Record<string, number>;
};

type GitHubRepo = {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  topics: string[];
  archived: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  default_branch: string;
  homepage: string | null;
};

/**
 * Fetch all repositories from kyndig organization with specific topic
 */
export async function fetchLabsRepositories(topic = 'labs'): Promise<LabRepoData[]> {
  const octokit = await getAuthenticatedOctokit();

  try {
    // Fetch repositories with the specified topic
    const { data: repos } = await octokit.request('GET /search/repositories', {
      q: `org:kyndig topic:${topic}`,
      sort: 'updated',
      order: 'desc',
      per_page: 100,
    });

    console.log(`Found ${repos.items.length} repositories with topic: ${topic}`);

    // Process each repository
    const labRepos: LabRepoData[] = [];

    for (const repo of repos.items) {
      try {
        const labData = await fetchLabRepositoryData(octokit, repo as GitHubRepo);
        if (labData) {
          labRepos.push(labData);
        }
      } catch (error) {
        console.error(`Error processing repository ${repo.full_name}:`, error);
      }
    }

    return labRepos;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
}

/**
 * Fetch detailed data for a single repository
 */
async function fetchLabRepositoryData(
  octokit: Octokit,
  repo: GitHubRepo,
): Promise<LabRepoData | null> {
  const [owner, repoName] = repo.full_name.split('/');

  if (!owner || !repoName) {
    console.error(`Invalid repository name: ${repo.full_name}`);
    return null;
  }

  try {
    // Fetch additional data in parallel
    const [readmeResult, languagesResult, contributorsResult, packageJsonResult] =
      await Promise.allSettled([
        fetchReadme(octokit, owner, repoName),
        octokit.request('GET /repos/{owner}/{repo}/languages', { owner, repo: repoName }),
        octokit.request('GET /repos/{owner}/{repo}/contributors', { owner, repo: repoName }),
        fetchPackageJson(octokit, owner, repoName),
      ]);

    const readme = readmeResult.status === 'fulfilled' ? readmeResult.value : '';
    const languages =
      languagesResult.status === 'fulfilled' ? languagesResult.value.data || {} : {};
    const contributors =
      contributorsResult.status === 'fulfilled' ? contributorsResult.value.data || [] : [];
    const packageJson = packageJsonResult.status === 'fulfilled' ? packageJsonResult.value : null;

    // Log package.json data for debugging (remove in production)
    if (packageJson) {
      console.log(`Package.json for ${repo.full_name}:`, {
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
      });
    }

    // Detect technologies using GitHub's native data
    const technologies = detectTechnologiesFromGitHub(languages, packageJson || undefined);

    // Determine category from topics
    const category = determineCategory(repo.topics);

    // Determine status
    const status = determineStatus(repo);

    return {
      id: repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      title: repo.name,
      description: repo.description || '',
      readme,
      githubUrl: repo.html_url,
      isPrivate: repo.private,
      category,
      repoStatus: status,
      technologies,
      repoData: {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: null, // Will be populated from languages data if needed
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        openIssuesCount: repo.open_issues_count,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        topics: repo.topics,
        defaultBranch: repo.default_branch,
        homepage: repo.homepage,
      },
      contributors: contributors
        .filter((c) => c.login !== undefined && c.avatar_url !== undefined)
        .map((c) => ({
          login: c.login as string,
          avatarUrl: c.avatar_url as string,
          contributions: c.contributions,
        })),
      languages,
    };
  } catch (error) {
    console.error(`Error fetching data for ${repo.full_name}:`, error);
    return null;
  }
}

/**
 * Fetch README content from repository
 */
async function fetchReadme(octokit: Octokit, owner: string, repo: string): Promise<string> {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/readme', {
      owner,
      repo,
      mediaType: {
        format: 'raw',
      },
    });

    // Handle the response based on the media type
    if (typeof data === 'string') {
      return data;
    } else if (data && typeof data === 'object' && 'content' in data) {
      // If it's a file object, decode the content
      return Buffer.from(data.content as string, 'base64').toString('utf-8');
    }

    return '';
  } catch {
    console.log(`No README found for ${owner}/${repo}`);
    return '';
  }
}

/**
 * Fetch package.json content from repository
 */
async function fetchPackageJson(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: 'package.json',
    });

    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Determine category from repository topics
 */
function determineCategory(topics: string[]): string {
  const categoryMap: Record<string, string> = {
    'raycast-extension': 'Raycast Extensions',
    'slack-bot': 'Slack Bots',
    'web-service': 'Web Services',
    tool: 'Tools',
    library: 'Libraries',
    api: 'APIs',
  };

  for (const topic of topics) {
    if (categoryMap[topic]) {
      return categoryMap[topic];
    }
  }

  return 'Labs';
}

/**
 * Determine status from repository data
 */
function determineStatus(repo: GitHubRepo): 'active' | 'completed' | 'experimental' {
  if (repo.archived) {
    return 'completed';
  }

  if (repo.topics?.includes('experimental')) {
    return 'experimental';
  }

  return 'active';
}
