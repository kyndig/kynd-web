export type Technology = {
  name: string;
  category: 'framework' | 'language' | 'service' | 'database' | 'deployment' | 'tool' | 'api';
  icon?: string;
  color?: string;
  description?: string;
};

export type DetectedTechnologies = {
  frameworks: Technology[];
  languages: Technology[];
  services: Technology[];
  databases: Technology[];
  deployment: Technology[];
  tools: Technology[];
  apis: Technology[];
};

/**
 * Technology definitions with metadata
 */
const TECHNOLOGY_DEFINITIONS: Record<string, Technology> = {
  // Frameworks
  react: { name: 'React', category: 'framework', color: '#61dafb', icon: '⚛️' },
  vue: { name: 'Vue.js', category: 'framework', color: '#4fc08d', icon: '💚' },
  angular: { name: 'Angular', category: 'framework', color: '#dd0031', icon: '🅰️' },
  svelte: { name: 'Svelte', category: 'framework', color: '#ff3e00', icon: '🧡' },
  astro: { name: 'Astro', category: 'framework', color: '#ff5d01', icon: '🚀' },
  next: { name: 'Next.js', category: 'framework', color: '#000000', icon: '▲' },
  nuxt: { name: 'Nuxt.js', category: 'framework', color: '#00dc82', icon: '💚' },
  sveltekit: { name: 'SvelteKit', category: 'framework', color: '#ff3e00', icon: '🧡' },
  remix: { name: 'Remix', category: 'framework', color: '#000000', icon: '🎸' },
  gatsby: { name: 'Gatsby', category: 'framework', color: '#663399', icon: '🌐' },
  fastapi: { name: 'FastAPI', category: 'framework', color: '#009688', icon: '⚡' },
  express: { name: 'Express.js', category: 'framework', color: '#000000', icon: '🚂' },
  koa: { name: 'Koa.js', category: 'framework', color: '#33333d', icon: '🌲' },
  nest: { name: 'NestJS', category: 'framework', color: '#e0234e', icon: '🏗️' },
  django: { name: 'Django', category: 'framework', color: '#092e20', icon: '🎸' },
  flask: { name: 'Flask', category: 'framework', color: '#000000', icon: '🌶️' },
  rails: { name: 'Ruby on Rails', category: 'framework', color: '#cc0000', icon: '💎' },
  spring: { name: 'Spring Boot', category: 'framework', color: '#6db33f', icon: '🍃' },
  laravel: { name: 'Laravel', category: 'framework', color: '#ff2d20', icon: '🔴' },
  symfony: { name: 'Symfony', category: 'framework', color: '#000000', icon: '🎼' },

  // Languages
  typescript: { name: 'TypeScript', category: 'language', color: '#3178c6', icon: '🔷' },
  javascript: { name: 'JavaScript', category: 'language', color: '#f7df1e', icon: '🟨' },
  python: { name: 'Python', category: 'language', color: '#3776ab', icon: '🐍' },
  java: { name: 'Java', category: 'language', color: '#ed8b00', icon: '☕' },
  go: { name: 'Go', category: 'language', color: '#00add8', icon: '🐹' },
  rust: { name: 'Rust', category: 'language', color: '#000000', icon: '🦀' },
  php: { name: 'PHP', category: 'language', color: '#777bb4', icon: '🐘' },
  ruby: { name: 'Ruby', category: 'language', color: '#cc342d', icon: '💎' },
  swift: { name: 'Swift', category: 'language', color: '#fa7343', icon: '🍎' },
  kotlin: { name: 'Kotlin', category: 'language', color: '#7f52ff', icon: '🟣' },
  dart: { name: 'Dart', category: 'language', color: '#0175c2', icon: '🎯' },
  scala: { name: 'Scala', category: 'language', color: '#dc322f', icon: '🔺' },
  csharp: { name: 'C#', category: 'language', color: '#239120', icon: '🟢' },
  cpp: { name: 'C++', category: 'language', color: '#00599c', icon: '🔵' },
  c: { name: 'C', category: 'language', color: '#a8b9cc', icon: '🔵' },

  // Services & APIs
  slack: { name: 'Slack API', category: 'api', color: '#4a154b', icon: '💬' },
  discord: { name: 'Discord API', category: 'api', color: '#5865f2', icon: '🎮' },
  telegram: { name: 'Telegram API', category: 'api', color: '#0088cc', icon: '✈️' },
  github: { name: 'GitHub API', category: 'api', color: '#181717', icon: '🐙' },
  gitlab: { name: 'GitLab API', category: 'api', color: '#fca326', icon: '🦊' },
  bitbucket: { name: 'Bitbucket API', category: 'api', color: '#0052cc', icon: '🪣' },
  stripe: { name: 'Stripe API', category: 'api', color: '#635bff', icon: '💳' },
  paypal: { name: 'PayPal API', category: 'api', color: '#0070ba', icon: '💰' },
  twilio: { name: 'Twilio API', category: 'api', color: '#f22f46', icon: '📱' },
  sendgrid: { name: 'SendGrid API', category: 'api', color: '#1a82e2', icon: '📧' },
  mailgun: { name: 'Mailgun API', category: 'api', color: '#f89b37', icon: '📬' },
  aws: { name: 'AWS', category: 'service', color: '#ff9900', icon: '☁️' },
  'google-cloud': { name: 'Google Cloud', category: 'service', color: '#4285f4', icon: '☁️' },
  azure: { name: 'Azure', category: 'service', color: '#0078d4', icon: '☁️' },
  vercel: { name: 'Vercel', category: 'service', color: '#000000', icon: '▲' },
  netlify: { name: 'Netlify', category: 'service', color: '#00c7b7', icon: '🌐' },
  heroku: { name: 'Heroku', category: 'service', color: '#430098', icon: '🟣' },
  railway: { name: 'Railway', category: 'service', color: '#0b0d0e', icon: '🚂' },
  render: { name: 'Render', category: 'service', color: '#46e3b7', icon: '🎨' },
  fly: { name: 'Fly.io', category: 'service', color: '#8b5cf6', icon: '🪰' },
  digitalocean: { name: 'DigitalOcean', category: 'service', color: '#0080ff', icon: '🌊' },
  linode: { name: 'Linode', category: 'service', color: '#00a95c', icon: '🌲' },

  // Databases
  postgresql: { name: 'PostgreSQL', category: 'database', color: '#336791', icon: '🐘' },
  mysql: { name: 'MySQL', category: 'database', color: '#4479a1', icon: '🐬' },
  mongodb: { name: 'MongoDB', category: 'database', color: '#47a248', icon: '🍃' },
  redis: { name: 'Redis', category: 'database', color: '#dc382d', icon: '🔴' },
  sqlite: { name: 'SQLite', category: 'database', color: '#003b57', icon: '🗃️' },
  elasticsearch: { name: 'Elasticsearch', category: 'database', color: '#005571', icon: '🔍' },
  cassandra: { name: 'Cassandra', category: 'database', color: '#1287b1', icon: '🌊' },
  dynamodb: { name: 'DynamoDB', category: 'database', color: '#3f48cc', icon: '⚡' },
  firebase: { name: 'Firebase', category: 'database', color: '#ffca28', icon: '🔥' },
  supabase: { name: 'Supabase', category: 'database', color: '#3ecf8e', icon: '⚡' },

  // Tools
  docker: { name: 'Docker', category: 'tool', color: '#2496ed', icon: '🐳' },
  kubernetes: { name: 'Kubernetes', category: 'tool', color: '#326ce5', icon: '⚓' },
  terraform: { name: 'Terraform', category: 'tool', color: '#7b42bc', icon: '🏗️' },
  ansible: { name: 'Ansible', category: 'tool', color: '#ee0000', icon: '🔧' },
  jenkins: { name: 'Jenkins', category: 'tool', color: '#d24939', icon: '🤖' },
  'github-actions': { name: 'GitHub Actions', category: 'tool', color: '#2088ff', icon: '⚡' },
  'gitlab-ci': { name: 'GitLab CI', category: 'tool', color: '#fca326', icon: '🦊' },
  circleci: { name: 'CircleCI', category: 'tool', color: '#343434', icon: '⭕' },
  'travis-ci': { name: 'Travis CI', category: 'tool', color: '#3eaaaf', icon: '🔧' },
  webpack: { name: 'Webpack', category: 'tool', color: '#8dd6f9', icon: '📦' },
  vite: { name: 'Vite', category: 'tool', color: '#646cff', icon: '⚡' },
  rollup: { name: 'Rollup', category: 'tool', color: '#ec4a3f', icon: '📦' },
  esbuild: { name: 'esbuild', category: 'tool', color: '#ffcf00', icon: '⚡' },
  parcel: { name: 'Parcel', category: 'tool', color: '#f8c291', icon: '📦' },
  babel: { name: 'Babel', category: 'tool', color: '#f9dc3e', icon: '🔧' },
  'typescript-compiler': {
    name: 'TypeScript Compiler',
    category: 'tool',
    color: '#3178c6',
    icon: '🔷',
  },
  eslint: { name: 'ESLint', category: 'tool', color: '#4b32c3', icon: '🔍' },
  prettier: { name: 'Prettier', category: 'tool', color: '#f7b93e', icon: '💅' },
  jest: { name: 'Jest', category: 'tool', color: '#c21325', icon: '🎭' },
  vitest: { name: 'Vitest', category: 'tool', color: '#6e9f18', icon: '⚡' },
  cypress: { name: 'Cypress', category: 'tool', color: '#17202c', icon: '🌲' },
  playwright: { name: 'Playwright', category: 'tool', color: '#2ead33', icon: '🎭' },
  storybook: { name: 'Storybook', category: 'tool', color: '#ff4785', icon: '📚' },
  raycast: { name: 'Raycast', category: 'tool', color: '#ff6363', icon: '⚡' },
};

/**
 * Package.json dependency patterns that map to technologies
 */
const PACKAGE_PATTERNS: Record<string, string[]> = {
  // Frameworks
  react: ['react', '@types/react'],
  vue: ['vue', '@vue/cli'],
  angular: ['@angular/core', '@angular/cli'],
  svelte: ['svelte', 'svelte-preprocess'],
  astro: ['astro'],
  next: ['next'],
  nuxt: ['nuxt'],
  sveltekit: ['@sveltejs/kit'],
  remix: ['@remix-run/react'],
  gatsby: ['gatsby'],
  fastapi: ['fastapi'],
  express: ['express'],
  koa: ['koa'],
  nest: ['@nestjs/core'],
  django: ['django'],
  flask: ['flask'],
  rails: ['rails'],
  spring: ['spring-boot-starter'],
  laravel: ['laravel/framework'],
  symfony: ['symfony/framework-bundle'],

  // Services & APIs
  slack: ['@slack/bolt', '@slack/web-api', 'slack'],
  discord: ['discord.js', 'discord.py'],
  telegram: ['telegraf', 'python-telegram-bot'],
  github: ['@octokit/rest', '@octokit/core'],
  gitlab: ['@gitlab/api'],
  bitbucket: ['@bitbucket/api'],
  stripe: ['stripe', '@stripe/stripe-js'],
  paypal: ['@paypal/checkout-server-sdk'],
  twilio: ['twilio'],
  sendgrid: ['@sendgrid/mail'],
  mailgun: ['mailgun-js'],
  aws: ['aws-sdk', '@aws-sdk/client-s3'],
  'google-cloud': ['@google-cloud/storage'],
  azure: ['@azure/storage-blob'],
  vercel: ['@vercel/node'],
  netlify: ['@netlify/functions'],
  heroku: ['heroku'],
  railway: ['@railway/cli'],
  render: ['@render/cli'],
  fly: ['@fly/cli'],
  digitalocean: ['@digitalocean/api'],
  linode: ['@linode/api'],

  // Databases
  postgresql: ['pg', 'postgresql', 'postgres'],
  mysql: ['mysql2', 'mysql'],
  mongodb: ['mongodb', 'mongoose'],
  redis: ['redis', 'ioredis'],
  sqlite: ['sqlite3', 'better-sqlite3'],
  elasticsearch: ['@elastic/elasticsearch'],
  cassandra: ['cassandra-driver'],
  dynamodb: ['@aws-sdk/client-dynamodb'],
  firebase: ['firebase', '@firebase/app'],
  supabase: ['@supabase/supabase-js'],

  // Tools
  docker: ['docker'],
  kubernetes: ['@kubernetes/client-node'],
  terraform: ['@terraform-cdk'],
  ansible: ['ansible'],
  jenkins: ['jenkins'],
  'github-actions': ['@actions/core'],
  'gitlab-ci': ['@gitlab/ci'],
  circleci: ['@circleci/cli'],
  'travis-ci': ['@travis-ci/cli'],
  webpack: ['webpack', 'webpack-cli'],
  vite: ['vite'],
  rollup: ['rollup'],
  esbuild: ['esbuild'],
  parcel: ['parcel'],
  babel: ['@babel/core', '@babel/cli'],
  'typescript-compiler': ['typescript'],
  eslint: ['eslint'],
  prettier: ['prettier'],
  jest: ['jest'],
  vitest: ['vitest'],
  cypress: ['cypress'],
  playwright: ['@playwright/test'],
  storybook: ['@storybook/react'],
  raycast: ['@raycast/api'],
};

/**
 * File patterns that indicate technology usage
 */
const FILE_PATTERNS: Record<string, (string | RegExp)[]> = {
  docker: ['Dockerfile', 'docker-compose.yml', '.dockerignore'],
  kubernetes: ['k8s/', 'kubernetes/', /\.yaml$/, /\.yml$/],
  terraform: [/\.tf$/, /\.tfvars$/],
  ansible: ['ansible.cfg', 'playbook.yml', 'inventory'],
  jenkins: ['Jenkinsfile'],
  'github-actions': ['.github/workflows/'],
  'gitlab-ci': ['.gitlab-ci.yml'],
  circleci: ['.circleci/config.yml'],
  'travis-ci': ['.travis.yml'],
  webpack: ['webpack.config.js', 'webpack.config.ts'],
  vite: ['vite.config.js', 'vite.config.ts'],
  rollup: ['rollup.config.js', 'rollup.config.ts'],
  esbuild: ['esbuild.config.js', 'esbuild.config.ts'],
  parcel: ['parcel.config.js', 'parcel.config.ts'],
  babel: ['.babelrc', 'babel.config.js'],
  'typescript-compiler': ['tsconfig.json'],
  eslint: ['.eslintrc.js', '.eslintrc.json', 'eslint.config.js'],
  prettier: ['.prettierrc', 'prettier.config.js'],
  jest: ['jest.config.js', 'jest.config.ts'],
  vitest: ['vitest.config.js', 'vitest.config.ts'],
  cypress: ['cypress.config.js', 'cypress/'],
  playwright: ['playwright.config.js', 'playwright/'],
  storybook: ['.storybook/', 'storybook/'],
  raycast: ['raycast/'],
};

/**
 * Detect technologies from package.json dependencies
 */
export function detectTechnologiesFromPackageJson(
  packageJson: Record<string, unknown>,
): Technology[] {
  const detected: Technology[] = [];
  const dependencies = {
    ...((packageJson.dependencies as Record<string, string>) || {}),
    ...((packageJson.devDependencies as Record<string, string>) || {}),
    ...((packageJson.peerDependencies as Record<string, string>) || {}),
  };

  for (const [techKey, patterns] of Object.entries(PACKAGE_PATTERNS)) {
    for (const pattern of patterns) {
      if (dependencies[pattern]) {
        const tech = TECHNOLOGY_DEFINITIONS[techKey];
        if (tech && !detected.find((t) => t.name === tech.name)) {
          detected.push(tech);
        }
        break;
      }
    }
  }

  return detected;
}

/**
 * Detect technologies from file structure
 */
export function detectTechnologiesFromFiles(fileList: string[]): Technology[] {
  const detected: Technology[] = [];

  for (const [techKey, patterns] of Object.entries(FILE_PATTERNS)) {
    for (const pattern of patterns) {
      if (
        fileList.some((file) => {
          if (typeof pattern === 'string') {
            return file.includes(pattern);
          } else {
            return pattern.test(file);
          }
        })
      ) {
        const tech = TECHNOLOGY_DEFINITIONS[techKey];
        if (tech && !detected.find((t) => t.name === tech.name)) {
          detected.push(tech);
        }
        break;
      }
    }
  }

  return detected;
}

/**
 * Detect technologies from README content
 */
export function detectTechnologiesFromReadme(readmeContent: string): Technology[] {
  const detected: Technology[] = [];
  const content = readmeContent.toLowerCase();

  for (const [techKey, tech] of Object.entries(TECHNOLOGY_DEFINITIONS)) {
    const techName = tech.name.toLowerCase();
    if (content.includes(techName) || content.includes(techKey)) {
      if (!detected.find((t) => t.name === tech.name)) {
        detected.push(tech);
      }
    }
  }

  return detected;
}

/**
 * Organize technologies by category
 */
export function organizeTechnologies(technologies: Technology[]): DetectedTechnologies {
  return {
    frameworks: technologies.filter((t) => t.category === 'framework'),
    languages: technologies.filter((t) => t.category === 'language'),
    services: technologies.filter((t) => t.category === 'service'),
    databases: technologies.filter((t) => t.category === 'database'),
    deployment: technologies.filter((t) => t.category === 'deployment'),
    tools: technologies.filter((t) => t.category === 'tool'),
    apis: technologies.filter((t) => t.category === 'api'),
  };
}

/**
 * Get technology icon URL or emoji
 */
export function getTechnologyIcon(tech: Technology): string {
  if (tech.icon) {
    // Return emoji if it's an emoji
    if (
      tech.icon.match(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u,
      )
    ) {
      return tech.icon;
    }
    // Otherwise return as text (could be extended to use actual icon URLs)
    return tech.icon;
  }
  return '🔧'; // Default icon
}

/**
 * Get technology color with fallback
 */
export function getTechnologyColor(tech: Technology): string {
  return tech.color || '#586069';
}
