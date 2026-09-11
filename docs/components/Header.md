# Header

> The sticky bar at the top: logo, navigation with dropdowns, optional search and language controls, and a call-to-action button.

**Use it for:** Every page. Configured once in your site config.

**Reach for something else if** never; but resist adding items. Seven top-level links is about the limit before people stop reading them.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import Header from '@astro-fleet/shared-ui/src/components/Header.astro';
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
| `navigation` | The menu, each item with a `label` and `href`, and optional `children` for a dropdown. | yes | — |
| `siteName` | Your company name. Used as the text logo if you have no image. | yes | — |
| `logoSrc` | Path to a logo image. Leave it out and the site name is used as text. | no | text logo |
| `logoAlt` | Alt text for the logo image. | no | `Company Logo` |
| `ctaText` | The button label. | no | `Get Started` |
| `ctaHref` | Where the button goes. | no | `/contact` |
| `search` | Show the search box. Needs the search index in your build first. | no | `false` |
| `searchPlaceholder` | The grey hint text. Name three things this site really covers. | no | `Search this site` |
| `showLanguages` | Show the language switcher. Needs translation set up; see docs/i18n.md. | no | `false` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Turning on `search` without adding `search-index.mjs` to the build. The box appears and finds nothing, which is worse than no box.
- 'Search…' as the placeholder. Naming three real things teaches people what this site has.
- Dropdowns three levels deep. Nobody finds level three.

---

## Full reference

Sticky top navigation bar with desktop dropdown menus, a CTA button, and a zero-JavaScript mobile menu (CSS checkbox toggle). Highlights the current page in the nav automatically.

**When to use:** Like Footer, you typically don't use this directly — `BaseLayout` handles it. Import standalone for custom layouts.

```ts
export interface MenuItem {
  label:     string;
  href:      string;
  children?: MenuItem[];   // renders a dropdown submenu
}

export interface Props {
  navigation: MenuItem[];
  logoSrc?:   string;      // path to logo image; undefined = text logo
  logoAlt?:   string;      // default: 'Company Logo'
  siteName:   string;      // used as alt text and text logo fallback
  ctaText?:   string;      // default: 'Get Started'
  ctaHref?:   string;      // default: '/contact'
}
```

**Navigation with dropdowns:**

```astro
const navigation = [
  { label: 'Product', href: '/product/', children: [
    { label: 'Features',    href: '/product/features/' },
    { label: 'Integrations', href: '/product/integrations/' },
    { label: 'Pricing',     href: '/pricing/' },
  ]},
  { label: 'About', href: '/about/' },
  { label: 'Blog',  href: '/blog/'  },
  { label: 'Contact', href: '/contact/' },
];
```

**Tip:** Define your navigation in `src/lib/site-config.ts` and import it everywhere. This ensures the header, mobile menu, and any breadcrumbs stay in sync.

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--cta-radius`, `--font-heading`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
