# SEO Recipes

Optional SEO enhancements that aren't baked into the starter because they're either opinionated, add dependencies, or only pay off for certain site shapes. Pick what you need.

For the always-on SEO that's already wired in (canonical URLs, robots directives, OG/Twitter cards, JSON-LD `WebSite` + `Organization` graph, sitemaps, RSS on Meridian, immutable asset caching), see `packages/shared-ui/src/components/SEOHead.astro` and `docs/adding-a-cms.md`.

## 1. Per-page Open Graph images

**When to add:** content sites, blogs, docs — anywhere each page deserves its own social card.

**What you get:** dynamic 1200×630 JPEG rendered at build time from the page's title and metadata. Share to LinkedIn/Twitter/Slack and the card unfurls with a per-page image instead of a single default.

**Why JPEG:** LinkedIn, Slack, and some older scrapers don't reliably render WebP/AVIF in unfurls.

Install:

```bash
bun add satori satori-html sharp
```

Create `src/pages/og/[...slug].jpg.ts`:

```ts
import type { APIRoute } from 'astro';
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const fontBuf = await readFile('./public/fonts/inter-bold.ttf');

export const GET: APIRoute = async ({ params }) => {
  const title = decodeURIComponent(params.slug ?? 'Untitled');

  const markup = html(`
    <div style="display:flex;flex-direction:column;justify-content:space-between;
                width:1200px;height:630px;padding:80px;background:#0a0f14;color:#fff;
                font-family:Inter">
      <div style="font-size:28px;opacity:.6">yoursite.com</div>
      <div style="font-size:72px;font-weight:700;line-height:1.1">${title}</div>
    </div>
  `);

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: fontBuf, weight: 700, style: 'normal' }],
  });

  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();

  return new Response(jpg, {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
```

Wire it from your page:

```astro
<BaseLayout
  title={entry.data.title}
  ogImage={`/og/${entry.id}.jpg`}
  ogImageAlt={entry.data.title}
/>
```

## 2. Git-based sitemap lastmod

**Problem:** file `mtime` resets on CI runners, so `@astrojs/sitemap`'s default `lastmod` always reads as "now." Search engines learn to ignore it.

**Fix:** derive `lastmod` from git's last-commit date for each source file. Use `execFileSync` with an argv array rather than `execSync` with a template string — the path comes from the sitemap serializer and shelling it out risks command injection on filenames with unusual characters.

```ts
// astro.config.mjs
import sitemap from '@astrojs/sitemap';
import { execFileSync } from 'node:child_process';

function gitLastMod(relPath) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', relPath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return iso || undefined;
  } catch {
    return undefined;
  }
}

export default defineConfig({
  // ...
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url.includes('/insights/')) {
          const slug = item.url.split('/insights/')[1].replace(/\/$/, '');
          const lm = gitLastMod(`src/content/insights/${slug}/index.mdoc`);
          if (lm) item.lastmod = lm;
        }
        return item;
      },
    }),
  ],
});
```

## 3. `llms.txt` — machine-readable site summary

**When to add:** any content site that wants AI assistants (ChatGPT, Claude, Perplexity) to understand its structure.

Serve `/llms.txt` as a static route that lists the high-value URLs with short descriptions. Minimum viable version:

```ts
// src/pages/llms.txt.ts
import { getCollection } from 'astro:content';

export async function GET() {
  const insights = await getCollection('insights');
  const lines = [
    '# Meridian Advisory',
    '',
    '> Independent strategy and transformation advisory for regulated institutions.',
    '',
    '## Insights',
    '',
    ...insights.map((e) => `- [${e.data.title}](/insights/${e.id}/): ${e.data.summary}`),
  ].join('\n');
  return new Response(lines, { headers: { 'Content-Type': 'text/plain' } });
}
```

## 4. Markdown alternates

**Use case:** AI crawlers (Perplexity in particular) prefer raw markdown over HTML. Expose a `.md` version of each article.

```ts
// src/pages/insights/[slug].md.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('insights');
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props;
  const body = `# ${entry.data.title}\n\n${entry.data.summary}\n\n${entry.body}`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
```

Advertise on the HTML page:

```astro
<link rel="alternate" type="text/markdown" href={`/insights/${entry.id}.md`} />
```

## 5. IndexNow — ping Bing and Yandex on deploy

**When to add:** high-frequency publishing; reduces indexing lag from days to minutes.

1. Generate a key (`openssl rand -hex 16`).
2. Serve it as `public/<key>.txt` containing the same key (for host verification).
3. Add a post-deploy step that POSTs your updated URLs to `https://api.indexnow.org/indexnow`:

```ts
// scripts/indexnow.ts
const KEY = process.env.INDEXNOW_KEY!;
const HOST = 'www.meridian-advisory.com';

const urls = [
  `https://${HOST}/`,
  `https://${HOST}/insights/`,
  // ...or read from the built sitemap
];

await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
```

Wire into your deploy workflow (after `wrangler pages deploy`).

## 6. FuzzyRedirect on 404

**When to add:** after a URL migration, or for content-heavy sites where typos are common.

Fetch the sitemap client-side on the 404 page, compute Levenshtein distance between the requested URL and each known URL, and either auto-redirect on 85%+ similarity or render suggestions.

The `@jdevalk/astro-seo-graph` package ships a `FuzzyRedirect.astro` component — easiest path if you're already using it. Otherwise, ~40 lines of plain JS on the 404 page.

## 7. View transitions

**When to add:** want smooth page transitions and a bit of a perf bump from pre-cached navigation.

```astro
---
// BaseLayout.astro or the site's root layout
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter defaultStrategy="viewport" />
  <!-- ... -->
</head>
```

Not baked into the starter because it's a meaningful UX opinion — some sites want full page reloads for analytics / form reset reasons.

## 8. Schema endpoints + schemamap

**When to add:** you're emitting a lot of rich JSON-LD and want agents to find it in one place.

Expose a combined graph per collection at `/schema/insights.json`, then list all endpoints at `/schemamap.xml`, then reference the schemamap from `robots.txt`:

```
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://www.meridian-advisory.com/sitemap-index.xml
Schemamap: https://www.meridian-advisory.com/schemamap.xml
```

## 9. NLWeb discovery

Emerging standard for conversational AI agents. One line in head:

```astro
<link rel="nlweb" href="/.well-known/nlweb.json" />
```

Serve a small JSON descriptor at that path. Low effort, future-proof.

## 10. Build-time validation

Catch SEO regressions before they ship. Add a post-build script that walks `dist/**/*.html` and asserts:

- Every page has exactly one `<h1>`
- No two pages share a `<title>`
- Every `<img>` has an `alt`
- Every internal link resolves
- Title length 30–65, description 70–200

Keep it out of `astro check` (which is type-only) and wire it into CI as a separate step. The [`lychee`](https://github.com/lycheeverse/lychee-action) GitHub Action handles internal + external link validation in ~1 line of YAML.

---

## When you hit the ceiling

If you end up implementing more than three of these, consider [`@jdevalk/astro-seo-graph`](https://github.com/jdevalk/seo-graph). It bundles the `Seo` component, schema endpoints, schemamap, IndexNow, llms.txt, FuzzyRedirect, build-time validation, and markdown alternates as one typed package. Tradeoff: you adopt his opinionated API surface in return for not maintaining the plumbing yourself.
