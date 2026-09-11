# ProductCard

> A card for one physical product: photo, name, category, a headline spec and buttons.

**Use it for:** Product listing pages, related-product rows, category pages.

**Reach for something else if** you are selling services. Use ServiceCard.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import ProductCard from '@astro-fleet/shared-ui/src/components/ProductCard.astro';
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
| `name` | The product name. | yes | — |
| `slug` | The URL-safe name, used to build the link. | yes | — |
| `category` | The category label shown on the card. | yes | — |
| `image` | Path to the photo. | no | a placeholder |
| `imageAlt` | What the photo shows. Describe the product, not the word 'image'. | no | the product name |
| `keySpec` | The one number that matters most, as `{ label, value }`. | no | none |
| `categorySlug` | URL-safe category, used when the link is built automatically. | no | derived |
| `detailsHref` | Set this to override the automatic link. | no | built from the slugs |
| `quoteHref` | Where the enquiry button goes. | no | `/contact` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Photos at different sizes or on different backgrounds. A row of mismatched cards looks broken even when each is fine.
- Alt text like 'product image'. Describe it: 'Stainless steel egg grader, side view'.
- Choosing a `keySpec` nobody buys on. Pick the number customers actually ask about first.

---

## Full reference

Card component for a physical product or piece of equipment — image (with placeholder fallback), category badge, key specification, and two action buttons (View Details / Request Quote).

**When to use:** Product catalogues, equipment listing pages, or any e-commerce-style grid. The detail URL is auto-generated from `categorySlug` and `slug`, or you can override with `detailsHref`.

```ts
export interface KeySpec {
  label: string;   // e.g. 'Capacity'
  value: string;   // e.g. '120 units/min'
}

export interface Props {
  name:          string;
  slug:          string;
  category:      string;
  image?:        string;
  imageAlt?:     string;
  keySpec?:      KeySpec;
  categorySlug?: string;
  detailsHref?:  string;     // overrides auto-generated URL
  quoteHref?:    string;     // default: '/contact'
}
```

**Usage:**

```astro
---
import ProductCard from '@astro-fleet/shared-ui/src/components/ProductCard.astro';
---
<ProductCard
  name="Widget A"
  slug="widget-a"
  category="Packaging Machines"
  categorySlug="packaging"
  image="/images/widget-a.webp"
  keySpec={{ label: 'Capacity', value: '120 units/min' }}
  quoteHref="/contact?product=widget-a"
/>
```

**Auto-generated URLs:**
- With `categorySlug`: `/products/packaging/widget-a`
- Without `categorySlug`: `/products/widget-a`
- With `detailsHref`: uses your custom URL

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
