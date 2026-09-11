# PricingTable

> Side-by-side plan cards with a price, a feature list and a button on each.

**Use it for:** Any page where you publish prices.

**Reach for something else if** you quote every job individually. A table of 'Contact us' three times helps nobody; use FeatureGrid and one CTABlock.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import PricingTable from '@astro-fleet/shared-ui/src/components/PricingTable.astro';
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
| `tiers` | The plans, each with a name, price, feature list and button. | yes | — |
| `heading` | Title above the table. | no | `Simple, transparent pricing` |
| `description` | A line under the heading. | no | none |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Four or more tiers. Three is the number people can actually compare.
- Marking the most expensive tier as 'Most popular' when it is not. If you are going to highlight one, highlight the one you want most people to buy.
- Feature lists of different lengths across tiers, so the buttons do not line up. Pad the shorter lists.

---

## Full reference

A responsive row of pricing tier cards with feature checklists, optional "Most popular" badges, and individual CTAs. The highlighted tier gets a coloured border and subtle shadow to draw the eye.

**When to use:** Pricing pages, feature comparison sections, or any page where users choose between service tiers.

```ts
export interface PricingFeature {
  text:     string;
  included: boolean;   // true = ✓ checkmark, false = ✗ with strikethrough
}

export interface PricingTier {
  name:         string;
  price:        string;          // e.g. '$49', 'Free', 'Custom'
  period?:      string;          // e.g. 'mo', 'year', 'user/mo'
  description?: string;
  features:     PricingFeature[];
  ctaText?:     string;          // default: 'Get started'
  ctaHref?:     string;
  highlighted?: boolean;         // adds accent border + shadow
  badge?:       string;          // floating label, e.g. 'Most popular'
}

export interface Props {
  tiers:        PricingTier[];
  heading?:     string;          // default: 'Simple, transparent pricing'
  description?: string;
}
```

**Three-tier pricing:**

```astro
---
import PricingTable from '@astro-fleet/shared-ui/src/components/PricingTable.astro';
---
<PricingTable
  heading="Choose your plan"
  description="All plans include unlimited sites and email support."
  tiers={[
    {
      name: 'Hobby',
      price: 'Free',
      description: 'For personal projects and experiments.',
      features: [
        { text: '3 sites',             included: true },
        { text: 'Community support',   included: true },
        { text: 'Custom domain',       included: false },
        { text: 'Analytics',           included: false },
      ],
      ctaText: 'Start free',
      ctaHref: '/signup',
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'mo',
      badge: 'Most popular',
      highlighted: true,
      description: 'For growing teams and agencies.',
      features: [
        { text: 'Unlimited sites',     included: true },
        { text: 'Priority support',    included: true },
        { text: 'Custom domain',       included: true },
        { text: 'Analytics dashboard', included: true },
      ],
      ctaText: 'Start trial',
      ctaHref: '/signup?plan=pro',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organisations with specific requirements.',
      features: [
        { text: 'Everything in Pro',   included: true },
        { text: 'SSO / SAML',          included: true },
        { text: 'Dedicated support',   included: true },
        { text: 'SLA guarantee',       included: true },
      ],
      ctaText: 'Contact sales',
      ctaHref: '/contact',
    },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
