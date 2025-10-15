import { defineConfig, envField, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';

// https://astro.build/config
export default defineConfig({
  site: 'https://kynd.no',
  adapter: netlify(),
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  env: {
    schema: {
      SLACK_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      SLACK_CHANNEL_ID: envField.string({ context: 'server', access: 'secret' }),
      GITHUB_APP_ID: envField.string({ context: 'server', access: 'secret' }),
      GITHUB_APP_INSTALLATION_ID: envField.string({ context: 'server', access: 'secret' }),
      GITHUB_APP_PRIVATE_KEY_B64: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  prefetch: {
    prefetchAll: true,
  },
  server: {
    open: true,
  },
  image: {
    responsiveStyles: true,
  },
  experimental: {
    preserveScriptOrder: true,
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Montserrat',
        cssVariable: '--font',
        fallbacks: ['sans-serif'],
        styles: ['normal'],
        subsets: ['latin'],
        weights: ['400', '500', '600'],
      },
    ],
  },
});
