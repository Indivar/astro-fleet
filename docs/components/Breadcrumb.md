# Breadcrumb

> The 'Home > Services > Web design' trail near the top of a page.

**Use it for:** Any page more than one level deep. It also emits the structured data Google uses to show that trail in search results.

**Reach for something else if** the page is top level. A breadcrumb reading just 'Home' is noise.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import Breadcrumb from '@astro-fleet/shared-ui/src/components/Breadcrumb.astro';
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
| `items` | The trail, in order, each with a `label` and an `href`. The last one is the current page and should have no link. | yes | — |
| `baseUrl` | Your full site address, e.g. `https://acme.com`. Used to build absolute URLs in the structured data. | no | relative URLs |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Leaving the current page as a link to itself.
- Skipping `baseUrl`. Google wants absolute URLs in breadcrumb structured data; without it you get the visual trail but not the search-result one.
- Inventing a trail that does not match the URL. If the page lives at `/services/seo/`, the trail should be Home > Services > SEO.

---

## Full reference

Renders an accessible breadcrumb trail with automatic `BreadcrumbList` JSON-LD structured data for search engines. The last item is rendered as plain text (not a link) to indicate the current page.

**When to use:** Every inner page (services, about, contact, product detail). Place it inside a `.container` div, right after `BaseLayout` opens.

```ts
export interface BreadcrumbItem {
  label: string;
  href?: string;   // omit for the current (last) item
}

export interface Props {
  items:    BreadcrumbItem[];
  baseUrl?: string;   // prepended to hrefs in JSON-LD (e.g. 'https://acme.com')
}
```

**Usage:**

```astro
---
import Breadcrumb from '@astro-fleet/shared-ui/src/components/Breadcrumb.astro';
---
<div class="container">
  <Breadcrumb
    items={[
      { label: 'Home',     href: '/' },
      { label: 'Products', href: '/products/' },
      { label: 'Widget A' },
    ]}
    baseUrl="https://acme.com"
  />
</div>
```

**Tip:** When deploying to a custom domain, always set `baseUrl` so the JSON-LD structured data contains full URLs that Google can use.

**CSS variables consumed:** `--color-accent`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
