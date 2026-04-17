import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Keystatic admin needs server-rendered routes, so it's only included in dev.
// Run `bun run dev --filter=meridian-advisory.com` and visit /keystatic to edit.
// For production editing, switch output to 'server' with an adapter — see docs/adding-a-cms.md.
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  site: 'https://www.meridian-advisory.com',
  integrations: [
    react(),
    markdoc(),
    ...(isDev ? [keystatic()] : []),
    sitemap(),
  ],
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
