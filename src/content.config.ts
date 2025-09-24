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

const labs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/labs' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image().optional(),
      category: z.string().optional(), // e.g., "Raycast Extensions", "Web Services", "Tools"
      githubUrl: z.string().url().optional(),
      demoUrl: z.string().url().optional(),
      status: z.enum(['active', 'completed', 'experimental']).optional(),
      startDate: z
        .string()
        .optional()
        .transform((val) => (val ? parseDate(val) : undefined)),
    }),
});

export const collections = { blog, employees, projects, labs };
