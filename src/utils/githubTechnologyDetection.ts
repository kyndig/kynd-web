export type Technology = {
  name: string;
  category: 'framework' | 'language' | 'tool';
  icon: string; // Iconify icon name
  color: string;
};

export type DetectedTechnologies = {
  frameworks: Technology[];
  languages: Technology[];
  tools: Technology[];
};

/**
 * Simple mapping of GitHub languages to technologies
 * Only the technologies actually used at Kyndig
 */
const SIMPLE_TECHNOLOGIES: Record<string, Technology> = {
  // Languages
  TypeScript: {
    name: 'TypeScript',
    category: 'language',
    icon: 'logos:typescript-icon',
    color: '#3178c6',
  },
  JavaScript: {
    name: 'JavaScript',
    category: 'language',
    icon: 'logos:javascript',
    color: '#f7df1e',
  },
  Python: { name: 'Python', category: 'language', icon: 'logos:python', color: '#3776ab' },
  CSS: { name: 'CSS', category: 'language', icon: 'logos:css-3', color: '#1572b6' },
  HTML: { name: 'HTML', category: 'language', icon: 'logos:html-5', color: '#e34c26' },
  Shell: { name: 'Shell', category: 'language', icon: 'simple-icons:gnubash', color: '#89e051' },

  // Frameworks
  Astro: { name: 'Astro', category: 'framework', icon: 'logos:astro-icon', color: '#ff5d01' },
  React: { name: 'React', category: 'framework', icon: 'logos:react', color: '#61dafb' },
  Vue: { name: 'Vue.js', category: 'framework', icon: 'logos:vue', color: '#4fc08d' },

  // Tools
  Docker: { name: 'Docker', category: 'tool', icon: 'logos:docker-icon', color: '#2496ed' },
  GitHub: { name: 'GitHub', category: 'tool', icon: 'logos:github-icon', color: '#181717' },
};

/**
 * Package.json dependency patterns for frameworks
 * Frameworks commonly used at Kyndig
 */
const FRAMEWORK_PACKAGES: Record<string, Technology> = {
  react: { name: 'React', category: 'framework', icon: 'logos:react', color: '#61dafb' },
  vue: { name: 'Vue.js', category: 'framework', icon: 'logos:vue', color: '#4fc08d' },
  astro: { name: 'Astro', category: 'framework', icon: 'logos:astro-icon', color: '#ff5d01' },
  next: { name: 'Next.js', category: 'framework', icon: 'logos:nextjs-icon', color: '#000000' },
  svelte: { name: 'Svelte', category: 'framework', icon: 'logos:svelte-icon', color: '#ff3e00' },
  '@sveltejs/kit': {
    name: 'SvelteKit',
    category: 'framework',
    icon: 'logos:svelte-icon',
    color: '#ff3e00',
  },
};

/**
 * Backend and database tools
 */
const BACKEND_PACKAGES: Record<string, Technology> = {
  '@supabase/supabase-js': {
    name: 'Supabase',
    category: 'tool',
    icon: 'logos:supabase-icon',
    color: '#3ecf8e',
  },
  pg: { name: 'PostgreSQL', category: 'tool', icon: 'logos:postgresql', color: '#336791' },
  postgres: { name: 'PostgreSQL', category: 'tool', icon: 'logos:postgresql', color: '#336791' },
  redis: { name: 'Redis', category: 'tool', icon: 'logos:redis', color: '#dc382d' },
  ioredis: { name: 'Redis', category: 'tool', icon: 'logos:redis', color: '#dc382d' },
};

/**
 * Development tools and utilities
 */
const DEV_TOOLS: Record<string, Technology> = {
  eslint: { name: 'ESLint', category: 'tool', icon: 'logos:eslint', color: '#4b32c3' },
  prettier: { name: 'Prettier', category: 'tool', icon: 'logos:prettier', color: '#f7b93e' },
  typescript: {
    name: 'TypeScript',
    category: 'tool',
    icon: 'logos:typescript-icon',
    color: '#3178c6',
  },
  '@types/node': {
    name: 'TypeScript',
    category: 'tool',
    icon: 'logos:typescript-icon',
    color: '#3178c6',
  },
};

/**
 * Simple GitHub technology detection
 * Only uses GitHub's language data + package.json frameworks
 */
export function detectTechnologiesFromGitHub(
  languages: Record<string, number>,
  packageJson?: Record<string, unknown>,
): DetectedTechnologies {
  const detected: Technology[] = [];

  // 1. Use GitHub's language detection (most reliable)
  for (const [language] of Object.entries(languages)) {
    const tech = SIMPLE_TECHNOLOGIES[language];
    if (tech && !detected.find((t) => t.name === tech.name)) {
      detected.push(tech);
    }
  }

  // 2. Check for frameworks, backend tools, and dev tools in package.json
  if (packageJson) {
    const dependencies = {
      ...((packageJson.dependencies as Record<string, string>) || {}),
      ...((packageJson.devDependencies as Record<string, string>) || {}),
    };

    // Check all package types
    const allPackages = { ...FRAMEWORK_PACKAGES, ...BACKEND_PACKAGES, ...DEV_TOOLS };

    for (const [packageName] of Object.entries(dependencies)) {
      const tech = allPackages[packageName];
      if (tech && !detected.find((t) => t.name === tech.name)) {
        detected.push(tech);
      }
    }
  }

  return {
    frameworks: detected.filter((t) => t.category === 'framework'),
    languages: detected.filter((t) => t.category === 'language'),
    tools: detected.filter((t) => t.category === 'tool'),
  };
}

/**
 * Get technology icon (returns Iconify icon name)
 */
export function getTechnologyIcon(tech: Technology): string {
  return tech.icon;
}

/**
 * Get technology color
 */
export function getTechnologyColor(tech: Technology): string {
  return tech.color;
}
