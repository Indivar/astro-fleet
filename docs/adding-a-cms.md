# Adding a CMS

The starter ships with a working CMS example in the **Meridian** demo site so you can see the pattern before wiring it up elsewhere. This guide covers how that example is structured, how to add a CMS to any other site in your fleet, the monorepo access-control caveat you need to understand before you roll it out for clients, and when to reach for a different CMS instead.

## What's in the example

Meridian uses **[Keystatic](https://keystatic.com)** — a git-based CMS that stores content as markdown files in the repo. There is no external database and no monthly SaaS bill per client site. Editors log into an admin UI; the admin commits the changes directly back to your repo; Astro rebuilds the affected site.

Files to look at in `sites/meridian-advisory.com/`:

| File | Purpose |
|------|---------|
| `keystatic.config.ts` | Defines the `insights` collection — fields, validation, storage location |
| `src/content.config.ts` | Astro content-collection schema (Zod) that reads what Keystatic writes |
| `src/content/insights/*/index.mdoc` | The actual content entries, committed to git |
| `src/pages/insights/index.astro` | Lists all entries |
| `src/pages/insights/[...slug].astro` | Renders each entry |
| `astro.config.mjs` | Registers `@keystatic/astro`, `@astrojs/react`, `@astrojs/markdoc` (gated to dev) |

**Try it:**

```bash
bun install
bun run dev --filter=meridian-advisory.com
```

Then open `http://localhost:4321/keystatic` — you'll see the admin UI. Edit an entry, save, and watch the markdown file update on disk.

## How it works

1. **Keystatic's admin route is enabled only in dev.** The integration registers server-side routes that can't be prerendered. To keep `output: 'static'` (which is what Cloudflare Pages deploys), the integration is gated with `process.env.NODE_ENV !== 'production'` in `astro.config.mjs`. Production builds are pure static HTML.
2. **Content is markdown (`.mdoc`).** Keystatic writes Markdoc files on save. `@astrojs/markdoc` lets Astro's content collection API read them at build time.
3. **The content schema lives in two places.** Keystatic's `keystatic.config.ts` validates what editors can type. Astro's `src/content.config.ts` validates what the build can render. Keep them in sync.
4. **Editing flow:** run dev, edit in `/keystatic`, commit the changed files, push. Your normal CI + deploy takes it from there.

## Adding Keystatic to another site in your fleet

Using the Meridian setup as the reference, here's what to replicate in any other site:

### 1. Install

```bash
cd sites/<yoursite>
bun add @keystatic/core @keystatic/astro @astrojs/react @astrojs/markdoc react react-dom
bun add -D @types/react @types/react-dom
```

### 2. Configure the integrations

Edit `sites/<yoursite>/astro.config.mjs`:

```js
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  // ...existing config
  integrations: [
    react(),
    markdoc(),
    ...(isDev ? [keystatic()] : []),
    sitemap(),
  ],
});
```

### 3. Define your collections

Create `sites/<yoursite>/keystatic.config.ts`:

```ts
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        publishedAt: fields.date({ label: 'Published at' }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});
```

### 4. Mirror the collection in Astro

Create `sites/<yoursite>/src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '*/index.mdoc', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    summary: z.string(),
  }),
});

export const collections = { posts };
```

### 5. Render the content

See `sites/meridian-advisory.com/src/pages/insights/` for a full working list + detail pattern. The short version:

```astro
---
import { getCollection, render } from 'astro:content';
const posts = await getCollection('posts');
---
<ul>
  {posts.map((p) => (
    <li><a href={`/posts/${p.id}/`}>{p.data.title}</a></li>
  ))}
</ul>
```

### 6. Run dev and edit

```bash
bun run dev --filter=<yoursite>
# open http://localhost:4321/keystatic
```

## Access control — the monorepo caveat

**Read this before you give clients a login.**

Keystatic's auth is binary: can you push to this GitHub repo, yes or no? It doesn't do row-level permissions.

In a **single-repo multi-site monorepo**, that means:

- ✅ **Good fit:** your agency team edits on behalf of clients, or trusted in-house editors edit their own sites.
- ❌ **Bad fit:** multiple external clients, each of whom must **not** be able to see or edit other clients' sites.

If you need strict client isolation, the options are:

1. **Separate repos per client** — lose the shared-components benefit of the monorepo.
2. **Use a CMS with real multi-tenant auth** — see alternatives below.
3. **Keep editing in-house** — clients request changes, your team makes them in dev and pushes.

For a single-agency setup with in-house editors, option 3 is usually fine and is what Meridian's example assumes.

## Production editing (optional)

The starter's default is **dev-only editing** — editors run the site locally, hit `/keystatic`, commit, push. That's the cleanest fit for a `output: 'static'` Cloudflare Pages deploy.

If you want editors to log in on a deployed URL (e.g. `meridian-advisory.com/keystatic`) without running dev locally, you have two paths:

### Path A — deploy a dynamic admin

1. Change `output: 'static'` to `output: 'server'` in `astro.config.mjs`.
2. Add an adapter — `@astrojs/cloudflare`, `@astrojs/node`, or whichever target you deploy to.
3. Add `export const prerender = true` to every page **except** the admin routes. Or flip prerender globally and opt in to SSR only on `/keystatic` and `/api/keystatic`.
4. Switch Keystatic storage from `{ kind: 'local' }` to `{ kind: 'github', repo: 'owner/name' }` and set up a GitHub OAuth app.

This is a meaningful amount of extra plumbing. It's worth it if your editors don't have a dev environment. It's overkill if they do.

### Path B — run Keystatic admin separately

Keep the site fully static. Expose the admin only from a separate deployment (a single "admin" site in the monorepo that pulls content paths from every sibling site). This is the cleanest architecture for "one editor, many sites" but not covered by the starter example.

## When Keystatic is the wrong choice

Keystatic is a great default for git-based editing of small-to-medium content sets. Reach for something else when:

| You need… | Consider |
|-----------|----------|
| **Multi-tenant auth** — clients must not see each other's content | [Sanity](https://www.sanity.io), [Directus](https://directus.io), [Strapi](https://strapi.io) |
| **Real-time collaboration** — multiple editors in the same doc at once | [Sanity](https://www.sanity.io), [Storyblok](https://www.storyblok.com) |
| **Non-technical editing of large catalogs** — thousands of products, heavy media | [Directus](https://directus.io), [Payload](https://payloadcms.com), [Sanity](https://www.sanity.io) |
| **Zero-config, free, git-based** — like Keystatic but even simpler | [Decap CMS](https://decapcms.org) |
| **A native-app-feeling CMS that ships with its own UI** | [TinaCMS](https://tina.io) |

For most agency starter use cases — blog posts, case studies, team pages, service descriptions — Keystatic is the right default. Swap it when your editor concurrency or content volume outgrows what git can comfortably handle.

## Reference

- [Keystatic documentation](https://keystatic.com/docs)
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [@astrojs/markdoc](https://docs.astro.build/en/guides/integrations-guide/markdoc/)
