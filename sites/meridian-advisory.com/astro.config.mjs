import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.meridian-advisory.com',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-heading',
      weights: [400, 500, 600, 700, 800, 900],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700],
    },
  ],
});
