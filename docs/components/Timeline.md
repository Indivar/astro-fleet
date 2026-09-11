# Timeline

> A vertical list of dated events running down the page.

**Use it for:** Company history, project stages, a changelog, a process with real dates.

**Reach for something else if** the steps have no order in time. Use FeatureGrid.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import Timeline from '@astro-fleet/shared-ui/src/components/Timeline.astro';
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
| `events` | The entries, each with a date, title and description. | yes | — |
| `heading` | Title above the timeline. | no | none |
| `description` | A line under the heading. | no | none |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Inventing milestones to pad the story. Four real ones beat ten vague ones.
- Stopping three years ago, which reads as a company that stopped.
- Dates in an ambiguous format. Write the month in words.

---

## Full reference

A vertical timeline for company history, product milestones, or changelogs. Items alternate left and right on desktop (creating a visually balanced layout) and stack vertically on mobile. Each event card includes a date, title, optional badge, and description.

**When to use:** About pages (company history), changelog pages, case study timelines, or onboarding wizards.

```ts
export interface TimelineEvent {
  date:        string;     // displayed as-is, e.g. '2024', 'March 2024', 'Q1 2024'
  title:       string;
  description: string;
  badge?:      string;     // small label, e.g. 'v1.0', 'Milestone', 'Beta'
}

export interface Props {
  events:       TimelineEvent[];
  heading?:     string;
  description?: string;
}
```

**Company history:**

```astro
---
import Timeline from '@astro-fleet/shared-ui/src/components/Timeline.astro';
---
<Timeline
  heading="Our Journey"
  events={[
    {
      date: '2020',
      title: 'Founded in a garage',
      description: 'Two engineers tired of copy-pasting components between client sites.',
    },
    {
      date: '2022',
      title: 'First enterprise client',
      description: 'Deployed a fleet of 12 sites for a Fortune 500 retail group.',
      badge: 'Milestone',
    },
    {
      date: '2024',
      title: 'Open-source launch',
      description: 'Released Astro Fleet on GitHub with three design presets and full documentation.',
      badge: 'v1.0',
    },
  ]}
/>
```

**Product changelog:**

```astro
<Timeline
  heading="Changelog"
  events={[
    { date: 'April 2024', title: 'Session Replay GA',           description: 'Full console, network, and React tree capture.', badge: 'New' },
    { date: 'March 2024', title: 'Warehouse sync for BigQuery', description: 'One-click sync to BigQuery with reverse ETL.' },
    { date: 'Feb 2024',   title: 'Team plan launched',          description: 'Unlimited seats, 1B events, SQL workbench.' },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-background`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
