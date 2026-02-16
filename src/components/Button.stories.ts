import ButtonComponent from './Button.astro';

export default {
  component: ButtonComponent,
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Click me',
  },
};

export const Tertiary = {
  args: {
    variant: 'tertiary',
    children: 'Click me',
  },
};
