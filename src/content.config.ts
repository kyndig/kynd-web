import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseDate } from './utils/dateHelpers';
import { fetchLabsRepositories } from './utils/labsDataFetcher';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const employees = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/employees' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      image: image(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      customer: z.string(),
      description: z.string(),
      image: image(),
      fullLogo: image().optional(), // Optional alternate image for list/grid views
      kyndLogo: image().optional(), // Kynd-branded version for hover effects
      startDate: z
        .string()
        .optional()
        .transform((val) => (val ? parseDate(val) : undefined)),
      endDate: z
        .string()
        .optional()
        .transform((val) => (val ? parseDate(val) : undefined)),
    }),
});

const labs = defineCollection({
  loader: async () => {
    try {
      const repos = await fetchLabsRepositories();
      return repos.map((repo) => ({
        id: repo.id,
        title: repo.title,
        description: repo.description,
        readme: repo.readme,
        readmeHtml: repo.readmeHtml,
        githubUrl: repo.githubUrl,
        isPrivate: repo.isPrivate,
        category: repo.category,
        status: repo.status,
        technologies: repo.technologies,
        repoData: repo.repoData,
        contributors: repo.contributors,
        languages: repo.languages,
        startDate: parseDate(repo.repoData.createdAt),
      }));
    } catch (error) {
      console.error('Error loading labs collection:', error);
      return [];
    }
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    readme: z.string(),
    readmeHtml: z.string(),
    githubUrl: z.string().url(),
    isPrivate: z.boolean(),
    category: z.string(),
    status: z.enum(['active', 'completed', 'experimental']),
    technologies: z.object({
      frameworks: z.array(
        z.object({
          name: z.string(),
          category: z.enum([
            'framework',
            'language',
            'service',
            'database',
            'deployment',
            'tool',
            'api',
          ]),
          icon: z.string().optional(),
          color: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
      languages: z.array(
        z.object({
          name: z.string(),
          category: z.enum([
            'framework',
            'language',
            'service',
            'database',
            'deployment',
            'tool',
            'api',
          ]),
          icon: z.string().optional(),
          color: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
      services: z.array(
        z.object({
          name: z.string(),
          category: z.enum([
            'framework',
            'language',
            'service',
            'database',
            'deployment',
            'tool',
            'api',
          ]),
          icon: z.string().optional(),
          color: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
      databases: z.array(
        z.object({
          name: z.string(),
          category: z.enum([
            'framework',
            'language',
            'service',
            'database',
            'deployment',
            'tool',
            'api',
          ]),
          icon: z.string().optional(),
          color: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
      deployment: z.array(
        z.object({
          name: z.string(),
          category: z.enum([
            'framework',
            'language',
            'service',
            'database',
            'deployment',
            'tool',
            'api',
          ]),
          icon: z.string().optional(),
          color: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
      tools: z.array(
        z.object({
          name: z.string(),
          category: z.enum([
            'framework',
            'language',
            'service',
            'database',
            'deployment',
            'tool',
            'api',
          ]),
          icon: z.string().optional(),
          color: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
      apis: z.array(
        z.object({
          name: z.string(),
          category: z.enum([
            'framework',
            'language',
            'service',
            'database',
            'deployment',
            'tool',
            'api',
          ]),
          icon: z.string().optional(),
          color: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
    }),
    repoData: z.object({
      name: z.string(),
      fullName: z.string(),
      description: z.string().nullable(),
      language: z.string().nullable(),
      stargazersCount: z.number(),
      forksCount: z.number(),
      openIssuesCount: z.number(),
      updatedAt: z.string(),
      createdAt: z.string(),
      topics: z.array(z.string()),
      defaultBranch: z.string(),
      homepage: z.string().nullable(),
    }),
    contributors: z.array(
      z.object({
        login: z.string(),
        avatarUrl: z.string(),
        contributions: z.number(),
      }),
    ),
    languages: z.record(z.number()),
    startDate: z.date().optional(),
  }),
});

const handbook = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/handbook' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
  }),
});

export const collections = { blog, employees, projects, handbook, labs };
