export type GitHubRepoData = {
  name: string;
  description: string | null;
  language: string | null;
  languages: Record<string, number>;
  license: { name: string; spdx_id: string } | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  topics: string[];
  size: number;
  default_branch: string;
  html_url: string;
  clone_url: string;
  homepage: string | null;
};

export type GitHubReadmeData = {
  content: string;
  encoding: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
};

export type GitHubContributor = {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
};

export type GitHubRelease = {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
};

export type GitHubPackageJson = {
  name?: string;
  version?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
  keywords?: string[];
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  license?: string;
};

export type GitHubTreeItem = {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
};

export type GitHubTreeResponse = {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
};

/**
 * Extract owner and repo name from GitHub URL
 */
export function parseGitHubUrl(githubUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') return null;

    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) return null;

    const owner = pathParts[0];
    const repo = pathParts[1];
    if (!owner || !repo) return null;

    return {
      owner,
      repo,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch repository metadata from GitHub API
 */
export async function fetchRepoData(owner: string, repo: string): Promise<GitHubRepoData | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kynd-Web',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch repo data: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching repository data:', error);
    return null;
  }
}

/**
 * Fetch repository languages from GitHub API
 */
export async function fetchRepoLanguages(
  owner: string,
  repo: string,
): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kynd-Web',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch languages: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching repository languages:', error);
    return null;
  }
}

/**
 * Fetch README content from GitHub API
 */
export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'Kynd-Web',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch README: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
}

/**
 * Fetch package.json content from GitHub API
 */
export async function fetchPackageJson(
  owner: string,
  repo: string,
): Promise<GitHubPackageJson | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Kynd-Web',
        },
      },
    );

    if (!response.ok) {
      console.error(`Failed to fetch package.json: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error('Error fetching package.json:', error);
    return null;
  }
}

/**
 * Fetch repository file tree from GitHub API
 */
export async function fetchRepoTree(owner: string, repo: string): Promise<string[] | null> {
  try {
    // First get the default branch
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kynd-Web',
      },
    });

    if (!repoResponse.ok) {
      console.error(`Failed to fetch repo info: ${repoResponse.status} ${repoResponse.statusText}`);
      return null;
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;

    // Then get the tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Kynd-Web',
        },
      },
    );

    if (!treeResponse.ok) {
      console.error(`Failed to fetch tree: ${treeResponse.status} ${treeResponse.statusText}`);
      return null;
    }

    const treeData: GitHubTreeResponse = await treeResponse.json();
    return treeData.tree?.map((item: GitHubTreeItem) => item.path) || [];
  } catch (error) {
    console.error('Error fetching repository tree:', error);
    return null;
  }
}

/**
 * Fetch repository contributors
 */
export async function fetchContributors(
  owner: string,
  repo: string,
): Promise<GitHubContributor[] | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kynd-Web',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch contributors: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return null;
  }
}

/**
 * Fetch latest releases
 */
export async function fetchReleases(owner: string, repo: string): Promise<GitHubRelease[] | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kynd-Web',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch releases: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching releases:', error);
    return null;
  }
}

/**
 * Get language color for GitHub language
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Java: '#ed8b00',
    'C++': '#00599c',
    'C#': '#239120',
    Go: '#00add8',
    Rust: '#000000',
    PHP: '#777bb4',
    Ruby: '#cc342d',
    Swift: '#fa7343',
    Kotlin: '#7f52ff',
    Dart: '#0175c2',
    Scala: '#dc322f',
    Shell: '#89e051',
    PowerShell: '#012456',
    HTML: '#e34c26',
    CSS: '#1572b6',
    SCSS: '#cf649a',
    Less: '#1d365d',
    Vue: '#4fc08d',
    React: '#61dafb',
    Angular: '#dd0031',
    Svelte: '#ff3e00',
    Astro: '#ff5d01',
    'Node.js': '#339933',
    Dockerfile: '#2496ed',
    YAML: '#cb171e',
    JSON: '#000000',
    Markdown: '#083fa1',
    SQL: '#336791',
    R: '#276dc3',
    MATLAB: '#e16737',
    Assembly: '#6e4c13',
    C: '#a8b9cc',
    'Objective-C': '#438eff',
    Perl: '#39457e',
    Lua: '#000080',
    Haskell: '#5e5086',
    Clojure: '#5881d8',
    Elixir: '#6e4a7e',
    Erlang: '#a90533',
    'F#': '#b845fc',
    OCaml: '#3be133',
    Racket: '#3c5caa',
    Scheme: '#1e4aec',
    Tcl: '#e4cc98',
    'Vim script': '#199f4b',
    TeX: '#3d6117',
    Makefile: '#427819',
    CMake: '#064f8c',
    Batchfile: '#c1f12e',
    Groovy: '#4298b8',
    D: '#ba595e',
    Nim: '#ffc200',
    Crystal: '#000100',
    Julia: '#a270ba',
    Fortran: '#4d41b1',
    Pascal: '#e3f171',
    Ada: '#02f88c',
    COBOL: '#005ca5',
    Lisp: '#4fb0d6',
    Prolog: '#74283c',
    Smalltalk: '#596706',
    Logo: '#6d5acf',
    ActionScript: '#882b0f',
    AutoHotkey: '#6594b9',
    AutoIt: '#1c3552',
    BlitzBasic: '#00ffae',
    Boo: '#d4bec1',
    Ceylon: '#dfa535',
    Chapel: '#8dc63f',
    Clean: '#3f85af',
    CoffeeScript: '#244776',
    ColdFusion: '#ed2cd6',
    'Common Lisp': '#3fb68b',
    Delphi: '#b30000',
    Eiffel: '#946d57',
    Elm: '#60b5cc',
    Factor: '#636746',
    Fantom: '#14253c',
    Forth: '#341708',
    Frege: '#00cafe',
    'Game Maker Language': '#71b417',
    Genie: '#fb855d',
    Gosu: '#82937f',
    Haxe: '#df7900',
    Io: '#a9188d',
    J: '#9e0202',
    Jasmin: '#d3641b',
    Jolie: '#843179',
    Lasso: '#999999',
    LiveScript: '#499886',
    Mercury: '#ff2b2b',
    Mirah: '#c7a938',
    'Modula-3': '#223388',
    NetLogo: '#ff6375',
    Nix: '#7e7eff',
    Nu: '#c9df40',
    'Objective-C++': '#6866fb',
    Opa: '#3be133',
    'OpenEdge ABL': '#5ce600',
    Ox: '#ffa500',
    Pike: '#005390',
    PogoScript: '#d80074',
    Pony: '#f2a4d1',
    PureScript: '#1d222d',
    Rebol: '#358a5b',
    Red: '#f50000',
    Ring: '#0e80d0',
    SAS: '#b34936',
    Self: '#0579aa',
    Shen: '#120f14',
    Slash: '#007eff',
    Squirrel: '#800000',
    'Standard ML': '#dc566d',
    SuperCollider: '#46390b',
    SystemVerilog: '#dae1c2',
    Turing: '#cf142b',
    UnrealScript: '#a54c4d',
    Vala: '#fbe5cd',
    Verilog: '#b2b7f8',
    VHDL: '#adb2cb',
    'Visual Basic': '#945db7',
    Volt: '#1f1f1f',
    WebAssembly: '#654ff0',
    Wollok: '#237893',
    X10: '#4b6bef',
    xBase: '#403a40',
    XProc: '#52bca8',
    XQuery: '#5232e7',
    XSLT: '#eb8ceb',
    Yorick: '#70a1ff',
    Zephir: '#118f9e',
    Zig: '#ec915c',
    Zimpl: '#d67711',
  };

  return colors[language] || '#586069';
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Get top languages by percentage
 */
export function getTopLanguages(
  languages: Record<string, number>,
  limit = 5,
): { name: string; bytes: number; percentage: number; color: string }[] {
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

  return Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: (bytes / totalBytes) * 100,
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);
}
