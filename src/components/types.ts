import type { HTMLAttributes } from 'astro/types';

export type LinkVariant =
  | 'light-primary'
  | 'light-secondary'
  | 'dark-primary'
  | 'dark-secondary'
  | 'green-primary'
  | 'green-secondary';

export type LinkProps = HTMLAttributes<'a'> & {
  href: string;
  class?: string;
  variant?: LinkVariant;
  label?: string;
};

// Backward-compatible aliases while migrating usages
export type ReadMoreVariant = LinkVariant;
export type ReadMoreProps = LinkProps;
