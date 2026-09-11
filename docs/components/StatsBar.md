# StatsBar

> A horizontal strip of numbers: years in business, projects delivered, that sort of thing.

**Use it for:** Under a hero, or on an About page, where a few real numbers do more than a paragraph.

**Reach for something else if** the numbers are not real. Invented statistics are the fastest way to lose a careful reader.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import StatsBar from '@astro-fleet/shared-ui/src/components/StatsBar.astro';
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
| `items` | The numbers, each with a `value` and a `label`. | yes | — |
| `dark` | Dark background using your primary colour. | no | `true` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Numbers you cannot substantiate.
- Passing a year as a value. Some formatters turn 1960 into '1,960'.
- Five or more stats. Three or four land; more is wallpaper.

---

## Full reference

A horizontal strip of key metrics or numbers — the kind of social-proof section you see on consulting firm and SaaS home pages. Supports dark (on `--color-primary`) and light (bordered, on page background) variants.

**When to use:** Below the hero to establish credibility, above a CTA to reinforce value, or on about pages to quantify the company's track record.

```ts
export interface StatItem {
  value: string;    // the big number, e.g. '450+', '$2.4B', '99.9%'
  label: string;    // descriptor below the number
  unit?: string;    // small text after the value, e.g. 'ms', '%', 'Years'
}

export interface Props {
  items: StatItem[];
  dark?: boolean;      // dark background using --color-primary; default: true
}
```

**Dark variant (below hero):**

```astro
---
import StatsBar from '@astro-fleet/shared-ui/src/components/StatsBar.astro';
---
<StatsBar
  items={[
    { value: '32',    unit: 'Years', label: 'In business' },
    { value: '450+',  label: 'Engagements completed' },
    { value: '14',    label: 'Offices worldwide' },
    { value: '£180B', label: 'Transaction value advised' },
  ]}
/>
```

**Light variant (mid-page):**

```astro
<StatsBar
  dark={false}
  items={[
    { value: '99.9', unit: '%',  label: 'Uptime SLA' },
    { value: '< 50', unit: 'ms', label: 'Avg response time' },
    { value: '10M+', label: 'Events processed daily' },
  ]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-background`, `--color-text-muted`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
