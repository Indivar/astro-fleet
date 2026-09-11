# TeamGrid

> Cards for the people in your company: photo, name, role, short bio and links.

**Use it for:** About pages, team pages. Real faces measurably increase trust.

**Reach for something else if** you have placeholder faces. Stock photos of fake staff are worse than no team section.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import TeamGrid from '@astro-fleet/shared-ui/src/components/TeamGrid.astro';
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
| `members` | The people, each with a name, role and optional photo, bio and links. | yes | — |
| `heading` | Title above the grid. | no | `Our Team` |
| `description` | A line under the heading. | no | none |
| `columns` | `2`, `3` or `4` across. | no | `3` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Stock photography presented as your staff.
- Photos taken in different places and lighting. Consistency matters more than quality here.
- Job titles nobody outside the company understands.

---

## Full reference

A responsive grid of team member cards. Each card shows a photo (or a person-icon placeholder), name, role, optional bio, and social links. Supports 2, 3, or 4 column layouts. Built-in SVG icons for LinkedIn, Twitter, GitHub, and generic website.

**When to use:** About pages, team pages, or leadership sections. Works equally well for a 4-person executive team or a 12-person engineering team.

```ts
export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'github' | 'website';
  url:      string;
}

export interface TeamMember {
  name:     string;
  role:     string;
  bio?:     string;
  image?:   string;     // URL to headshot; falls back to person-icon placeholder
  socials?: SocialLink[];
}

export interface Props {
  members:      TeamMember[];
  heading?:     string;           // default: 'Our Team'
  description?: string;
  columns?:     2 | 3 | 4;       // default: 3
}
```

**Basic usage:**

```astro
---
import TeamGrid from '@astro-fleet/shared-ui/src/components/TeamGrid.astro';
---
<TeamGrid
  heading="Leadership"
  description="The partners who lead our practice areas."
  columns={4}
  members={[
    {
      name: 'Jane Smith',
      role: 'CEO & Co-founder',
      bio: 'Previously VP Engineering at Globex. 15 years in enterprise SaaS.',
      socials: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/janesmith' },
        { platform: 'twitter',  url: 'https://twitter.com/janesmith' },
      ],
    },
    {
      name: 'Alex Chen',
      role: 'CTO',
      bio: 'Open-source contributor. Built infrastructure at three YC companies.',
      socials: [
        { platform: 'github', url: 'https://github.com/alexchen' },
      ],
    },
  ]}
/>
```

**Without bios (compact layout):**

```astro
<TeamGrid
  heading="The Kitchen Team"
  columns={4}
  members={[
    { name: 'Elena Marchetti', role: 'Chef & Proprietor' },
    { name: 'Marco Bianchi',   role: 'Sous Chef' },
    { name: 'Sophie Laurent',  role: 'Pastry Chef' },
    { name: 'David Park',      role: 'Sommelier' },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-text-muted`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
