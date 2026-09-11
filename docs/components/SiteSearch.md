# SiteSearch

> Search across every page of the site, using an index built at publish time. No server needed.

**Use it for:** Sites past about twenty pages, documentation, product catalogues.

**Reach for something else if** the site is small enough to navigate. Six pages do not need search.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import SiteSearch from '@astro-fleet/shared-ui/src/components/SiteSearch.astro';
---
```

**2. Use it** in the page body. The reference below has a complete example you can paste.

**3. Rebuild** and look at the page:

```bash
bun run --filter your-site.com dev
```

---

## Settings

| Setting | What it does | Required? | Default |
|---|---|---|---|
| `(see the reference below)` | Turned on with `search` on `Header` or `BaseLayout`, plus the index step in your build. | — | — |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Turning on the box without adding `search-index.mjs` to the build script. The box appears and finds nothing.
- Forgetting to rebuild after adding pages. The index is made at build time, so new pages are missing until the next build.
- A placeholder that says 'Search'. Name three things this site covers.

---

## Full reference

Search across every page of a site, with no server and no search service.

The index is built from the HTML that actually shipped, so a page whose copy
changed cannot then be missing from search, and a page that never rendered
cannot appear in it. It is fetched on first use and never on load, so search
costs nothing on the critical path.

Deliberately not a search library. A dependency that ships a WebAssembly
runtime and its own index format earns its size at a few thousand pages. On a
forty-page marketing site it would be most of the JavaScript on the page.

**Two steps. Both are required, and the order matters.**

1. Add the index generator to the site's build, after `astro build`:

   ```json
   {
     "scripts": {
       "build": "astro build && node ../../packages/shared-ui/scripts/search-index.mjs"
     }
   }
   ```

2. Turn it on in the layout:

   ```astro
   <BaseLayout
     search
     searchPlaceholder="Pricing, integrations, security"
     ...
   >
   ```

A search box without step 1 returns nothing at all, silently, which is why it
is off by default.

**Props**

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `search` | `boolean` | `false` | Shows the search control in the header |
| `searchPlaceholder` | `string` | `'Search this site'` | Name three things the site actually covers. A generic placeholder teaches nobody what to type |

Both props are on `BaseLayout` and passed through to `Header`, which renders
`SiteSearch` between the navigation and the CTA. The starter has search on
with its index step in the build; the demo sites show it on Meridian only. The
trigger button carries `aria-label` because its text label is hidden below
700px, where only the icon shows.

**Generator options**

| Flag | Default | Notes |
|------|---------|-------|
| `--dist <dir>` | `dist` | Where the build is |
| `--public <dir>` | `public` | Dev copy, so `astro dev` can serve it. Gitignore this file |
| `--exclude a,b` | `/lab/` | Extra path prefixes to leave out |
| `--body <n>` | `1200` | Characters of body text kept per page |

Pages carrying `<meta name="robots" content="noindex">` and the 404 are skipped:
if it is not for search engines it is not for the reader either.

**Keyboard.** `/` or Cmd/Ctrl-K opens it, arrows move through results, Enter
follows the highlighted one, Escape closes and returns focus to the control
that opened it.

**Styling.** Every rule in the component is wrapped in `:where()`, so it scores
zero specificity and your own stylesheet always wins without `!important`. Set
these on `.srch` to restyle the panel:

```css
.srch {
  --search-bg:     #fff;
  --search-bg-2:   #f6f7f9;   /* hovered and selected rows */
  --search-ink:    #111;
  --search-ink-3:  #555;      /* snippets */
  --search-ink-4:  #888;      /* placeholder, result count */
  --search-rule:   #ddd;
  --search-accent: #0066cc;   /* icons, rails, selected marker */
  --search-mono:   ui-monospace, monospace;
  --search-scrim:  rgb(15 23 42 / 0.45);
}
```

Sizes are literal pixels rather than tokens from the type scale. Search chrome
is interface, and a display-scale token here will set a result title at 49px.

**Size.** The index is roughly 1.8 KB gzipped per page: 18 KB for a
thirty-three page site, 12 KB for eight pages.

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
