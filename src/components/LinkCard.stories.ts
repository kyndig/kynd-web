import LinkCardComponent from './LinkCard.astro';

export default {
  component: LinkCardComponent,
};

export const Default = {
  args: {
    variant: 'default',
    heading: 'Link Card',
    href: '/',
  },
};

export const Green = {
  args: {
    variant: 'green',
    heading: 'Link Card',
    href: '/',
  },
};

export const Black = {
  args: {
    variant: 'black',
    heading: 'Link Card',
    href: '/',
  },
};
