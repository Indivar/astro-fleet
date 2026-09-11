# SEOHead

> Everything that goes in the invisible `<head>` of a page: the title, the description, social preview tags and structured data.

**Use it for:** Every page. `BaseLayout` includes it for you, so you normally just pass `title` and `description` to the layout.

**Reach for something else if** never. A page without it is invisible to search and looks broken when shared.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import SEOHead from '@astro-fleet/shared-ui/src/components/SEOHead.astro';
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
| `title` | The page title. Aim for 60 characters including your site name. | yes | — |
| `description` | The sentence shown in search results. Aim for 160 characters. | yes | — |
| `keywords` | A list of keywords. Search engines ignore these now; harmless. | no | none |
| `structuredData` | JSON-LD describing the page, so search engines understand what it is. | no | a sensible default |
| `canonicalUrl` | The one true URL, if this page is reachable at several. | no | the current URL |
| `ogImage` | The picture used when the page is shared on social media. | no | `/images/og-default.png` |
| `siteName` | Your site name, for the social preview. | no | from config |
| `ogType` | `website` for most pages, `article` for blog posts. | no | `website` |
| `locale` | Language and region, e.g. `en_GB`. | no | `en_US` |
| `twitterHandle` | Your handle, for the card byline. | no | none |
| `noindex` | Hide the page from search engines. | no | `false` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- The same title and description on every page. Search engines treat that as one page and pick whichever they like.
- A description that repeats the title. It is the advert for the page, so write it for a person.
- Forgetting `ogImage`. A shared link with no picture gets far fewer clicks.
- Leaving `noindex` on after launch. Check it before you go live.

---

## Full reference

Injects all `<head>` SEO tags: title, description, keywords, Open Graph (og:), Twitter Card, canonical URL, and JSON-LD structured data. Place inside `<head>` or use via BaseLayout (which renders it automatically).

**When to use:** Every page. BaseLayout calls this internally, so you only need it directly if building a custom layout.

```ts
export interface Props {
  title:            string;
  description:      string;
  keywords?:        string[];
  structuredData?:  Record<string, unknown>;
  canonicalUrl?:    string;         // auto-derived from Astro.url if omitted
  ogImage?:         string;         // falls back to /images/og-default.png
  siteName?:        string;
  ogType?:          string;         // default: 'website'
  locale?:          string;         // default: 'en_US'
  twitterHandle?:   string;
  noindex?:         boolean;        // default: false
}
```

**With structured data:**

```astro
<SEOHead
  title="Widget A — Packaging Machines"
  description="High-speed packaging machine for consumer goods."
  keywords={['packaging machine', 'widget a', 'manufacturing']}
  siteName="Acme Corp"
  structuredData={{
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Widget A',
    description: 'High-speed packaging machine.',
  }}
/>
```

**CSS variables consumed:** none (pure `<head>` tags)

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
