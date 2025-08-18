import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Helper function to parse flexible date formats
const parseFlexibleDate = (val: string): Date => {
  // Handle MM-YYYY format (e.g., "12-2023")
  if (/^\d{1,2}-\d{4}$/.test(val)) {
    const parts = val.split('-');
    if (parts.length === 2) {
      const month = parts[0] ?? '1';
      const year = parts[1] ?? '2000';
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
  }

  // Handle MM-YY format (e.g., "12-23")
  if (/^\d{1,2}-\d{2}$/.test(val)) {
    const parts = val.split('-');
    if (parts.length === 2) {
      const month = parts[0] ?? '1';
      const year = parts[1] ?? '2000';
      return new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
    }
  }

  // Handle DD-MM-YYYY format (e.g., "15-12-2023")
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(val)) {
    const parts = val.split('-');
    if (parts.length === 3) {
      const day = parts[0] ?? '1';
      const month = parts[1] ?? '1';
      const year = parts[2] ?? '2000';
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }

  // Handle DD-MM-YY format (e.g., "15-12-23")
  if (/^\d{1,2}-\d{1,2}-\d{2}$/.test(val)) {
    const parts = val.split('-');
    if (parts.length === 3) {
      const day = parts[0] ?? '1';
      const month = parts[1] ?? '1';
      const year = parts[2] ?? '2000';
      return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }

  // Try standard date parsing as fallback
  const date = new Date(val);
  if (!isNaN(date.getTime())) {
    return date;
  }

  throw new Error(
    `Invalid date format. Expected MM-YYYY, MM-YY, DD-MM-YYYY, DD-MM-YY, or standard date format. Got: ${val}`,
  );
};

// Duration calculation function
const calculateDuration = (startDate: Date, endDate?: Date): string => {
  if (!endDate) {
    return 'Pågående';
  }

  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (months === 0) {
    return '1 måned';
  } else if (months === 1) {
    return '1 måned';
  } else if (months < 12) {
    return `${months} måneder`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return years === 1 ? '1 år' : `${years} år`;
    } else {
      const yearText = years === 1 ? '1 år' : `${years} år`;
      const monthText = remainingMonths === 1 ? '1 måned' : `${remainingMonths} måneder`;
      return `${yearText}, ${monthText}`;
    }
  }
};

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
    z
      .object({
        title: z.string(),
        customer: z.string(),
        description: z.string(),
        image: image(),
        fullLogo: image().optional(), // Optional alternate image for list/grid views
        kyndLogo: image().optional(), // Kynd-branded version for hover effects
        startDate: z
          .string()
          .optional()
          .transform((val) => (val ? parseFlexibleDate(val) : undefined)),
        endDate: z
          .string()
          .optional()
          .transform((val) => (val ? parseFlexibleDate(val) : undefined)),
      })
      .transform((data) => ({
        ...data,
        duration: data.startDate
          ? calculateDuration(data.startDate, data.endDate)
          : 'No start date',
      })),
});

export const collections = { blog, employees, projects };
