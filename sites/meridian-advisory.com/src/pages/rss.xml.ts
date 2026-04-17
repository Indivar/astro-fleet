import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, TAGLINE } from '../lib/site-config';

export async function GET(context: APIContext) {
  const entries = (await getCollection('insights')).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );

  return rss({
    title: `${SITE_NAME} — Insights`,
    description: TAGLINE,
    site: context.site ?? 'https://www.meridian-advisory.com',
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      pubDate: entry.data.publishedAt,
      author: entry.data.author,
      link: `/insights/${entry.id}/`,
      categories: entry.data.tags,
    })),
    customData: '<language>en-gb</language>',
    trailingSlash: true,
  });
}
