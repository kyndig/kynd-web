import postcssGlobalData from '@csstools/postcss-global-data';
import postcssNesting from 'postcss-nesting';
import postcssCustomMedia from 'postcss-custom-media';

export default {
  plugins: [
    postcssGlobalData({
      files: ['./src/styles/variables.css'],
    }),
    postcssNesting(),
    postcssCustomMedia(),
  ],
};
