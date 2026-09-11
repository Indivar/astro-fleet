# LogoCloud

> A quiet row of customer or partner logos.

**Use it for:** Social proof near the top of a home page, or under a hero.

**Reach for something else if** you do not have permission to use the logos. Ask first; this one gets companies into real trouble.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import LogoCloud from '@astro-fleet/shared-ui/src/components/LogoCloud.astro';
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
| `logos` | The logos, each with `src`, `alt` and an optional `href`. | yes | — |
| `heading` | The small label above them. | no | `Trusted by` |
| `grayscale` | Drain the colour until hovered, so the row does not shout. | no | `true` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Using logos you have no permission for.
- Implying a relationship you do not have. 'Trusted by' means they are customers. If they are integrations, say 'Works with'.
- Three logos stretched across the full width. Wait until you have six.

---

## Full reference

A strip of partner or client logos for social proof. Accepts image URLs or renders text fallbacks when logo images aren't available. Logos are desaturated (grayscale) by default and colourise on hover.

**When to use:** Below the hero section to establish trust, on pricing pages to show recognisable customers, or in case study sections.

```ts
export interface LogoItem {
  name:   string;     // alt text for the image, or rendered as text if no image
  image?: string;     // URL to the logo image (SVG recommended)
  url?:   string;     // optional link (opens in new tab)
}

export interface Props {
  logos:      LogoItem[];
  heading?:   string;       // small label above the logos; default: 'Trusted by'
  grayscale?: boolean;      // desaturate logos by default; default: true
}
```

**With images:**

```astro
---
import LogoCloud from '@astro-fleet/shared-ui/src/components/LogoCloud.astro';
---
<LogoCloud
  heading="Trusted by teams at"
  logos={[
    { name: 'Stripe',   image: '/logos/stripe.svg', url: 'https://stripe.com' },
    { name: 'Vercel',   image: '/logos/vercel.svg', url: 'https://vercel.com' },
    { name: 'Supabase', image: '/logos/supabase.svg' },
  ]}
/>
```

**Text-only fallback (no logo images yet):**

```astro
<LogoCloud
  heading="Our partners"
  logos={[
    { name: 'Linear' },
    { name: 'Retool' },
    { name: 'Vercel' },
    { name: 'Railway' },
  ]}
/>
```

**Tip:** Use SVG logos at a consistent height (32px recommended). The component caps images at `height: 32px; max-width: 120px` and uses `object-fit: contain` so different aspect ratios work fine.

**CSS variables consumed:** `--color-primary`, `--color-text-muted`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
