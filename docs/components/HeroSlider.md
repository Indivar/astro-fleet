# HeroSlider

> A rotating set of full-width panels at the top of a page, with dots to move between them.

**Use it for:** A home page with two or three genuinely different audiences or offers.

**Reach for something else if** you have one message. A static hero converts better than a carousel almost every time, and most people never see slide two.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import HeroSlider from '@astro-fleet/shared-ui/src/components/HeroSlider.astro';
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
| `slides` | The panels, each with a heading, text and buttons. | yes | — |
| `autoplay` | Milliseconds between slides. `0` means it only moves when the visitor moves it. | no | `5000` |
| `variant` | `light`, `dark` or `gradient`. | no | `light` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Five slides. Two or three is the useful maximum.
- Autoplay so fast nobody can finish reading. If in doubt use `0` and let people click.
- Putting your only call to action on slide three.

---

## Full reference

A content carousel for hero sections with smooth CSS opacity transitions, dot navigation, and optional auto-advance. Uses a small inline script (same pattern as TestimonialSlider) for slide control. Supports light, dark, and gradient backgrounds.

**When to use:** Home pages with multiple value propositions, feature announcements, or product showcases that benefit from sequential storytelling. If you only have one hero message, use a static hero section instead.

```ts
export interface Slide {
  eyebrow?:         string;                           // small text above heading
  heading:          string;
  description:      string;
  primaryButton?:   { text: string; href: string };
  secondaryButton?: { text: string; href: string };
  image?:           string;                           // displayed on the right
  imageAlt?:        string;
}

export interface Props {
  slides:    Slide[];
  autoplay?: number;      // milliseconds; 0 = manual only; default: 5000
  variant?:  'light' | 'dark' | 'gradient';   // default: 'light'
}
```

**Basic usage (two slides, auto-advance):**

```astro
---
import HeroSlider from '@astro-fleet/shared-ui/src/components/HeroSlider.astro';
---
<HeroSlider
  variant="gradient"
  autoplay={6000}
  slides={[
    {
      eyebrow: 'Just shipped',
      heading: 'The fastest way to build multi-site',
      description: 'Shared components, typed tokens, one-command deploys.',
      primaryButton: { text: 'Get Started', href: '/contact/' },
      secondaryButton: { text: 'View Demos', href: '#demos' },
    },
    {
      heading: 'Three presets, infinite possibilities',
      description: 'Corporate, SaaS, Warm — or create your own design system.',
      primaryButton: { text: 'Explore Presets', href: '/services/' },
      image: '/images/presets-preview.png',
      imageAlt: 'Three preset previews side by side',
    },
  ]}
/>
```

**Manual-only (no auto-advance):**

```astro
<HeroSlider autoplay={0} variant="dark" slides={slides} />
```

**Accessibility:** The slider uses `role="tablist"` for dots, `aria-selected` to indicate the active slide, and `aria-hidden` on inactive slides. The auto-advance pauses implicitly when the user clicks a dot (timer resets).

**CSS variables consumed:** `--color-primary`, `--color-secondary`, `--color-accent`, `--color-cta`, `--cta-radius`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
