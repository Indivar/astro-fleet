# FeatureGrid

> A grid of small cards, each with an icon, a title and a line of text.

**Use it for:** 'What you get' sections, benefit lists, anything that reads better as scannable blocks than as prose.

**Reach for something else if** each item needs a link of its own. Use ServiceCard for that.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import FeatureGrid from '@astro-fleet/shared-ui/src/components/FeatureGrid.astro';
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
| `features` | The cards, each with `title`, `description` and an optional `icon` (inline SVG as a string). | yes | — |
| `heading` | Title above the grid. | no | none |
| `description` | A line under the heading. | no | none |
| `columns` | `2`, `3` or `4` across on a wide screen. They stack on a phone whatever you choose. | no | `3` |
| `align` | `left` or `center` for the text inside each card. | no | `left` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Six items in a 4-column grid, leaving two stranded on the second row. Match the count to the columns.
- Icons that all look the same. If you cannot find a distinct icon for each, leave them all out.
- A paragraph per card. One or two lines; the grid is for scanning.

---

## Full reference

A flexible grid of feature cards with optional icons, titles, and descriptions. More versatile than ServiceCard — supports 2, 3, or 4 columns, left or centre alignment, and inline SVG icons passed as strings.

**When to use:** Feature overview sections, "Why choose us" blocks, benefit lists. Use FeatureGrid when you need a simple grid without links. Use ServiceCard when each item needs a clickable call-to-action.

```ts
export interface Feature {
  icon?:       string;    // raw SVG string, injected via set:html
  title:       string;
  description: string;
}

export interface Props {
  features:     Feature[];
  heading?:     string;
  description?: string;
  columns?:     2 | 3 | 4;            // default: 3
  align?:       'left' | 'center';    // default: 'left'
}
```

**Basic usage (no icons):**

```astro
---
import FeatureGrid from '@astro-fleet/shared-ui/src/components/FeatureGrid.astro';
---
<FeatureGrid
  heading="Why teams choose us"
  columns={3}
  features={[
    { title: 'Fast Builds',  description: 'Turborepo caches every site independently. Rebuilds take seconds.' },
    { title: 'Type-Safe',    description: 'Every component exports a Props interface. TypeScript catches errors at build time.' },
    { title: 'Zero JS',      description: 'Static HTML by default. Add interactivity only where you choose.' },
  ]}
/>
```

**With SVG icons:**

```astro
<FeatureGrid
  columns={4}
  align="center"
  features={[
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      title: 'Lightning Fast',
      description: 'Sub-second page loads with zero client-side JavaScript.',
    },
    // ... more features
  ]}
/>
```

**Tip:** Copy SVG icons from [Lucide](https://lucide.dev/) or [Heroicons](https://heroicons.com/) and pass them as the `icon` string. The component wraps them in a styled container that uses `--color-accent`.

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-text-muted`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
