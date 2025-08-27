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
