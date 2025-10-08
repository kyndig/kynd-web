import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseDate } from './utils/dateHelpers';

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

const handbook = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/handbook' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
  }),
});

export const collections = { blog, employees, projects, handbook };
