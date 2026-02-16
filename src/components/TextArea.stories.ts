import TextAreaComponent from './TextArea.astro';

export default {
  component: TextAreaComponent,
};

export const TextArea = {
  args: {
    id: 'textarea',
    label: 'Label',
    name: 'textarea',
    placeholder: 'Placeholder',
  },
};
