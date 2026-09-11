# ComparisonTable

> A grid comparing options down the side against features across the top, with ticks and crosses.

**Use it for:** Pricing plans, 'us vs them', product variants, before and after.

**Reach for something else if** you are comparing more than about four things. On a phone a wide table becomes a scroll bar nobody uses.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import ComparisonTable from '@astro-fleet/shared-ui/src/components/ComparisonTable.astro';
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
| `columns` | The things being compared, one per column. | yes | — |
| `rows` | The features, one per row. Each cell can be `true`, `false`, or any text. | yes | — |
| `heading` | Title above the table. | no | none |
| `description` | A line under the heading. | no | none |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Putting a tick in every row of your own column. A table where one option wins everything reads as marketing, not information.
- Using text where a tick would do, and a tick where the detail matters. '5 GB' tells the reader more than a tick.
- More than four columns. Test it on a phone before you commit.

---

## Full reference

A feature comparison grid with checkmarks, crosses, or custom text in each cell. Supports highlighting a recommended column. Horizontally scrollable on mobile so it works with many columns.

**When to use:** Pricing tier comparison, product vs. competitor, or any feature matrix where users need to evaluate options side by side.

```ts
export interface ComparisonColumn {
  name:         string;
  highlighted?: boolean;   // adds a subtle accent background
}

export interface ComparisonRow {
  feature: string;
  values:  (boolean | string)[];   // true = ✓, false = ✗, string = custom text
}

export interface Props {
  columns:      ComparisonColumn[];
  rows:         ComparisonRow[];
  heading?:     string;
  description?: string;
}
```

**Basic usage:**

```astro
---
import ComparisonTable from '@astro-fleet/shared-ui/src/components/ComparisonTable.astro';
---
<ComparisonTable
  heading="Compare plans"
  columns={[
    { name: 'Starter' },
    { name: 'Pro', highlighted: true },
    { name: 'Enterprise' },
  ]}
  rows={[
    { feature: 'Unlimited users',   values: [false, true, true] },
    { feature: 'API access',        values: ['REST only', 'REST + GraphQL', 'REST + GraphQL'] },
    { feature: 'SSO',               values: [false, false, true] },
    { feature: 'Dedicated support', values: [false, false, true] },
    { feature: 'SLA',               values: ['—', '99.9%', '99.99%'] },
  ]}
/>
```

**Competitor comparison (product vs. alternatives):**

```astro
<ComparisonTable
  heading="How we compare"
  description="An honest look at where we stand."
  columns={[
    { name: 'Us', highlighted: true },
    { name: 'Competitor A' },
    { name: 'Competitor B' },
  ]}
  rows={[
    { feature: 'Self-hosted option',     values: [true, false, true] },
    { feature: 'Open source',            values: [true, false, false] },
    { feature: 'Warehouse-native',       values: [true, false, false] },
    { feature: 'Free tier',              values: ['50M events', '10M events', 'None'] },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-text`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
