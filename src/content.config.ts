import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseDate } from './utils/dateHelpers';
import type { Loader } from 'astro/loaders';

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
      contributions: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
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

/** Empty loader: GitHub-backed labs fetch is disabled until secrets and product are ready. */
export function labsLoader(): Loader {
  return {
    name: 'labs-loader',
    async load({ store }) {
      store.clear();
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

export const collections = { employees, projects, handbook, labs };
