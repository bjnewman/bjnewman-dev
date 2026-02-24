import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bjnewman.dev',
  integrations: [react(), sitemap()],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        // Fix @pixi/react ESM import of react-reconciler/constants (missing .js extension)
        'react-reconciler/constants': 'react-reconciler/constants.js',
      },
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  compressHTML: true,
});