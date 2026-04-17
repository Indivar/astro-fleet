import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const insights = defineCollection({
  loader: glob({ pattern: '*/index.mdoc', base: './src/content/insights' }),
  schema: z.object({
    title: z.string().min(5).max(120),
    publishedAt: z.coerce.date(),
    summary: z.string().min(20).max(200),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { insights };
