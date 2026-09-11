# ServiceCard

> A card for one service: title, description and a link through to the detail page.

**Use it for:** Service listings, 'what we do' sections.

**Reach for something else if** the item has no page to link to. Use FeatureGrid instead.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import ServiceCard from '@astro-fleet/shared-ui/src/components/ServiceCard.astro';
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
| `title` | The service name. | yes | — |
| `description` | A line or two on what it is. | yes | — |
| `href` | The page it links to. | yes | — |
| `linkText` | The link wording. | no | `Learn More` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- 'Learn More' on every card. Say where it goes: 'See SEO packages'.
- Descriptions of wildly different lengths, leaving cards ragged.
- Linking every card to `/contact`. If a service is worth a card it is worth a page.

---

## Full reference

Card for a service offering — icon slot, title, description, and an arrow link. The icon slot accepts any SVG; a wrench icon is used as fallback if no slot content is provided. Cards have a hover state that highlights the border with `--color-accent`.

**When to use:** Services pages, feature overviews, or any grid where each card links to a detail page or contact form.

```ts
export interface Props {
  title:       string;
  description: string;
  href:        string;
  linkText?:   string;   // default: 'Learn More'
}
```

**Basic usage:**

```astro
---
import ServiceCard from '@astro-fleet/shared-ui/src/components/ServiceCard.astro';
---
<ServiceCard
  title="Cloud Hosting"
  description="Scalable infrastructure on Cloudflare, Vercel, or AWS."
  href="/services/hosting/"
  linkText="Explore Hosting"
/>
```

**With custom icon:**

```astro
<ServiceCard title="Analytics" description="Privacy-first analytics." href="/services/analytics/">
  <svg slot="icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
</ServiceCard>
```

**CSS variables consumed:** `--color-accent`, `--font-heading`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
