# CTABlock

> A full-width band with a heading and one or two buttons, used to ask for the next step.

**Use it for:** The end of a page, between long sections, anywhere the reader is ready to act.

**Reach for something else if** there is no clear next step. A call to action with nothing behind it wastes the best space on the page.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import CTABlock from '@astro-fleet/shared-ui/src/components/CTABlock.astro';
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
| `heading` | The ask. A verb works better than a noun: 'Book a survey' beats 'Our surveys'. | yes | — |
| `description` | One supporting line. | no | none |
| `primaryButton` | The main action, as `{ text, href }`. | yes | — |
| `secondaryButton` | A quieter alternative, as `{ text, href }`. | no | none |
| `variant` | `dark` for a strong band, `light` to sit quietly in a page. | no | `dark` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Two equally loud buttons. The second one is meant to be the lower-commitment option.
- 'Learn more' as the primary button. Say what happens: 'See prices', 'Book a call'.
- Several dark CTA blocks on one page. They stop registering.

---

## Full reference

A full-width call-to-action section with a heading, optional description, and one or two buttons. Renders on a dark background by default (uses `--color-primary`), with a `light` variant available.

**When to use:** Bottom of every page as the final conversion prompt. Also effective mid-page to break up long content sections with a clear call to action.

```ts
export interface CTAButton {
  text: string;
  href: string;
}

export interface Props {
  heading:          string;
  description?:     string;
  primaryButton:    CTAButton;
  secondaryButton?: CTAButton;
  variant?:         'light' | 'dark';   // default: 'dark'
}
```

**Basic usage:**

```astro
---
import CTABlock from '@astro-fleet/shared-ui/src/components/CTABlock.astro';
---
<CTABlock
  heading="Ready to get started?"
  description="Join thousands of teams already using Acme."
  primaryButton={{ text: 'Start Free Trial', href: '/signup' }}
  secondaryButton={{ text: 'Talk to Sales', href: '/contact' }}
/>
```

**Single button, light variant (for dark page sections):**

```astro
<CTABlock
  heading="Questions?"
  primaryButton={{ text: 'Contact us', href: '/contact' }}
  variant="light"
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--color-cta`, `--cta-radius`, `--font-heading`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
