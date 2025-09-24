import { defineConfig, envField, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kynd.no',
  adapter: netlify(),
  integrations: [mdx(), sitemap()],
  env: {
    schema: {
      SLACK_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      SLACK_CHANNEL_ID: envField.string({ context: 'server', access: 'secret' }),
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
