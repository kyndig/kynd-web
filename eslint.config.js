import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-strict'],
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'astro/no-set-html-directive': 'error',
      'astro/no-set-text-directive': 'error',
      'astro/prefer-class-list-directive': 'error',
      'astro/prefer-object-class-list': 'error',
      'astro/prefer-split-class-list': 'error',
      'astro/jsx-a11y/no-redundant-roles': [
        'error',
        {
          ol: ['list'],
          ul: ['list'],
        },
      ],
    },
  },
  {
    files: ['src/pages/labs/[[]id].astro'],
    rules: {
      'astro/no-set-html-directive': 'off',
    },
  },
];
