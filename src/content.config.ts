import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseDate } from './utils/dateHelpers';
import { fetchLabsRepositories } from './utils/labsDataFetcher';
import type { Loader } from 'astro/loaders';

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

export function labsLoader(): Loader {
  return {
    name: 'labs-loader',
    async load({ renderMarkdown, store }) {
      const repos = await fetchLabsRepositories();

      store.clear();

      for (const repo of repos) {
        store.set({
          id: repo.id,
          data: {
            title: repo.title,
            description: repo.description,
            readme: repo.readme,
            readmeHtml: repo.readme ? await renderMarkdown(repo.readme) : null,
            githubUrl: repo.githubUrl,
            isPrivate: repo.isPrivate,
            category: repo.category,
            repoStatus: repo.repoStatus,
            technologies: repo.technologies,
            repoData: repo.repoData,
            contributors: repo.contributors,
            languages: repo.languages,
            startDate: parseDate(repo.repoData.createdAt),
          },
        });
      }
    },
  };
}

const labs = defineCollection({
  loader: labsLoader(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    readme: z.string(),
    readmeHtml: z.any().nullable(),
    githubUrl: z.string().url(),
    isPrivate: z.boolean(),
    category: z.string(),
    status: z.enum(['active', 'completed', 'experimental']),
    technologies: z.object({
      frameworks: z.array(z.any()),
      languages: z.array(z.any()),
      tools: z.array(z.any()),
    }),
    repoData: z.any(),
    contributors: z.array(z.any()),
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
