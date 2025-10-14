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
  TypeScript: { name: 'TypeScript', category: 'language', icon: '🔷', color: '#3178c6' },
  JavaScript: { name: 'JavaScript', category: 'language', icon: '🟨', color: '#f7df1e' },
  Python: { name: 'Python', category: 'language', icon: '🐍', color: '#3776ab' },
  CSS: { name: 'CSS', category: 'language', icon: '🎨', color: '#1572b6' },
  HTML: { name: 'HTML', category: 'language', icon: '🌐', color: '#e34c26' },
  Shell: { name: 'Shell', category: 'language', icon: '🐚', color: '#89e051' },

  // Frameworks
  Astro: { name: 'Astro', category: 'framework', icon: '🚀', color: '#ff5d01' },
  React: { name: 'React', category: 'framework', icon: '⚛️', color: '#61dafb' },
  Vue: { name: 'Vue.js', category: 'framework', icon: '💚', color: '#4fc08d' },

  // Tools
  Docker: { name: 'Docker', category: 'tool', icon: '🐳', color: '#2496ed' },
  GitHub: { name: 'GitHub', category: 'tool', icon: '🐙', color: '#181717' },
};

/**
 * Package.json dependency patterns for frameworks only
 * Only frameworks actually used at Kyndig
 */
const FRAMEWORK_PACKAGES: Record<string, Technology> = {
  react: { name: 'React', category: 'framework', icon: '⚛️', color: '#61dafb' },
  vue: { name: 'Vue.js', category: 'framework', icon: '💚', color: '#4fc08d' },
  astro: { name: 'Astro', category: 'framework', icon: '🚀', color: '#ff5d01' },
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

  // 2. Check for common frameworks in package.json
  if (packageJson) {
    const dependencies = {
      ...((packageJson.dependencies as Record<string, string>) || {}),
      ...((packageJson.devDependencies as Record<string, string>) || {}),
    };

    // Only check for frameworks we actually use
    const frameworkPackages = ['react', 'vue', 'astro'];
    for (const [packageName] of Object.entries(dependencies)) {
      if (frameworkPackages.includes(packageName)) {
        const tech = FRAMEWORK_PACKAGES[packageName];
        if (tech && !detected.find((t) => t.name === tech.name)) {
          detected.push(tech);
        }
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
