# TestimonialSlider

> A carousel of customer quotes with names, companies and star ratings.

**Use it for:** Home pages, service pages, near a call to action.

**Reach for something else if** the quotes are not real and attributable. Never invent one, and never publish one without permission.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import TestimonialSlider from '@astro-fleet/shared-ui/src/components/TestimonialSlider.astro';
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
| `testimonials` | The quotes, each with the text, the person, their company and an optional rating. | yes | — |
| `heading` | Title above the slider. | no | `What Our Clients Say` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Anonymous quotes. 'A happy customer' persuades nobody; a name and a company does.
- Five stars on everything. A four alongside a specific reason reads as more honest.
- Quotes that praise without saying anything. 'Great to work with' is filler; 'they cut our quote turnaround from three days to one' is evidence.

---

## Full reference

Horizontally scrollable testimonial cards with optional star ratings, client attribution, and CSS dot navigation. Uses `scroll-snap` for touch-friendly scrolling and a small inline script for dot clicks.

**When to use:** Social proof sections, typically between feature sections and the final CTA. Works best with 3–6 testimonials.

```ts
export interface Testimonial {
  clientName: string;
  company:    string;
  role?:      string;
  quote:      string;
  rating?:    number;   // 1–5, renders filled/empty star icons
}

export interface Props {
  testimonials: Testimonial[];
  heading?:     string;   // default: 'What Our Clients Say'
}
```

**Usage:**

```astro
---
import TestimonialSlider from '@astro-fleet/shared-ui/src/components/TestimonialSlider.astro';
---
<TestimonialSlider
  heading="What our customers say"
  testimonials={[
    {
      clientName: 'Sarah Johnson',
      company:    'Globex Corp',
      role:       'Head of Digital',
      quote:      'We migrated six sites to Astro Fleet in a weekend. The shared component library saved us weeks of duplicate work.',
      rating:     5,
    },
    {
      clientName: 'Michael Torres',
      company:    'Initech',
      quote:      'The design token system is brilliant. We rebranded three sites by changing one config file.',
      rating:     5,
    },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--font-heading`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
