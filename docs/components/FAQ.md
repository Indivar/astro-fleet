# FAQ

> An accordion of questions that open when clicked. No JavaScript at all.

**Use it for:** FAQ pages, and the bottom of pricing, product and contact pages to head off the questions that generate support email.

**Reach for something else if** you have two questions. Just write them as headings and paragraphs.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import FAQ from '@astro-fleet/shared-ui/src/components/FAQ.astro';
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
| `items` | The questions, each with a `question` and an `answer`. | yes | — |
| `heading` | Title above the list. | no | `Frequently Asked Questions` |
| `description` | A line under the heading. | no | none |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Questions nobody asks. Take them from your inbox, not your imagination.
- Answers that dodge. If the honest answer is 'it depends on the site', say that and give the range.
- Hiding important information in an accordion. Anything a buyer needs in order to decide belongs on the page, open.

---

## Full reference

An accessible accordion built with native `<details>/<summary>` elements. **Pure CSS, zero JavaScript.** Works without JS enabled (progressive enhancement), animates the chevron on open, and supports any number of items.

**When to use:** FAQ pages, product pages (common objections), pricing pages (billing questions), contact pages (before the form to reduce support volume).

```ts
export interface FAQItem {
  question: string;
  answer:   string;
}

export interface Props {
  items:        FAQItem[];
  heading?:     string;     // default: 'Frequently Asked Questions'
  description?: string;
}
```

**Basic usage:**

```astro
---
import FAQ from '@astro-fleet/shared-ui/src/components/FAQ.astro';
---
<FAQ
  heading="Common Questions"
  items={[
    {
      question: 'How do I add a new site to the monorepo?',
      answer: 'Run ./scripts/new-site.sh yourdomain.com [preset] from the repo root, then bun install. The scaffolder copies the starter template and applies your chosen design preset.',
    },
    {
      question: 'Can I use a custom colour palette?',
      answer: 'Yes. Create a new DesignTokens object in packages/config/src/tokens.ts (or in your site\'s config) and pass it to BaseLayout via the designTokens prop. All components read from CSS custom properties, so they adapt automatically.',
    },
    {
      question: 'Do components require client-side JavaScript?',
      answer: 'Almost none. 20 of 24 components are pure CSS. HeroSlider and TestimonialSlider carry a small inline script for carousel navigation, and SiteSearch and Analytics load nothing until the visitor uses them.',
    },
  ]}
/>
```

**Without heading (inline within a page section):**

```astro
<FAQ items={faqItems} heading="" />
```

**Tip:** For SEO, consider adding FAQPage structured data in your page's `<SEOHead>` component. The FAQ component handles the visual accordion; the structured data is a separate concern you add at the page level.

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
