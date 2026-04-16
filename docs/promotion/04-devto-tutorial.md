# Dev.to tutorial post

Publish on **Dev.to** (or Hashnode). Use tags: `astro`, `webdev`, `typescript`, `monorepo`, `opensource`.

---

**Title:** How to manage multiple client websites from one Astro monorepo

**Cover image:** Use the social preview image from the GitHub repo, or a composite screenshot of the three demo sites.

---

If you're an agency, freelancer, or company running more than a couple of websites, you've hit the maintenance multiplier problem: every improvement has to be replicated across every site. A header fix becomes six PRs. A design refresh becomes a month-long project.

This article walks through how we solved it with a shared-component monorepo — and how you can use the same approach. We've open-sourced the entire setup as **[Astro Fleet](https://github.com/Indivar/astro-fleet)**.

## The problem

We maintain websites for multiple brands. Each site started as its own repo with its own copy of common components: header, footer, contact form, CTA block, SEO tags.

Within six months:
- The header in Site A had a mobile fix that Sites B–F didn't
- Site C had an improved footer layout that nobody propagated
- Three sites had slightly different versions of the same contact form
- Updating the company colour palette meant editing CSS in six places

Sound familiar?

## The solution: shared components in a monorepo

The idea is simple: components that appear on every site live in one place. Each site imports them and brands them with its own design tokens.

```
astro-fleet/
├── packages/
│   ├── config/        ← design token presets (colours, fonts, spacing)
│   └── shared-ui/     ← 22 components + 3 layouts
├── sites/
│   ├── client-a.com/  ← pages, site config, deploys independently
│   ├── client-b.com/  ← different brand, same components
│   └── client-c.com/
└── turbo.json         ← Turborepo orchestrates builds
```

**Key principle:** components are brand-agnostic. They read CSS custom properties (`--color-primary`, `--font-heading`, etc.) instead of hardcoding colours. The design preset sets those variables. Same component, different look.

## Step 1: Clone and explore

```bash
git clone https://github.com/Indivar/astro-fleet.git
cd astro-fleet
bun install
bun run dev    # → starter site at localhost:4321
```

The starter site is a clean template using the Corporate preset. Open it in your browser — you'll see a working site with header, hero, service cards, CTA, and footer.

## Step 2: Create your first site

```bash
./scripts/new-site.sh acme.com saas
bun install
bun run dev --filter=acme.com
```

This scaffolds a new site at `sites/acme.com/` with the SaaS preset applied. The scaffolder:

1. Copies the starter template
2. Updates `astro.config.mjs` with your domain
3. Applies the design preset (SaaS: dark theme, Sora font, emerald accents)
4. Sets the site name in `site-config.ts`

Open `http://localhost:4322` and you'll see the same page structure — but with a completely different visual identity.

## Step 3: Customise the site identity

Every site has one file that controls its identity: `src/lib/site-config.ts`.

```typescript
export const SITE_NAME = 'Acme Analytics';
export const TAGLINE = 'Product analytics for modern teams';

export const navigation: MenuItem[] = [
  { label: 'Product', href: '/services/', children: [
    { label: 'Event Pipeline',   href: '/services/' },
    { label: 'Session Replay',   href: '/services/' },
  ]},
  { label: 'Pricing', href: '/services/' },
  { label: 'Docs',    href: '/about/'    },
  { label: 'Sign in', href: '/contact/'  },
];

export const footerColumns: FooterColumn[] = [
  // ... your footer structure
];

export const contactInfo: ContactInfo = {
  email: 'hello@acme.com',
  phone: '+1 (555) 000-0000',
};
```

Edit this one file and the header, footer, mobile menu, and breadcrumbs all update across the entire site.

## Step 4: Build pages with shared components

Pages import components from the shared library and pass content via props:

```astro
---
import BaseLayout from '@astro-fleet/shared-ui/src/layouts/BaseLayout.astro';
import FAQ from '@astro-fleet/shared-ui/src/components/FAQ.astro';
import PricingTable from '@astro-fleet/shared-ui/src/components/PricingTable.astro';
import CTABlock from '@astro-fleet/shared-ui/src/components/CTABlock.astro';
import { SAAS } from '@astro-fleet/config/tokens';
import { SITE_NAME, navigation, footerColumns } from '../lib/site-config';
---

<BaseLayout title="Pricing" siteName={SITE_NAME} navigation={navigation}
  footerColumns={footerColumns} designTokens={SAAS}>

  <PricingTable
    heading="Simple pricing"
    tiers={[
      { name: 'Free', price: '$0', period: 'mo',
        features: [{ text: '10K events', included: true }],
        ctaHref: '/signup' },
      { name: 'Pro', price: '$49', period: 'mo', highlighted: true,
        badge: 'Popular',
        features: [{ text: 'Unlimited events', included: true }],
        ctaHref: '/signup' },
    ]}
  />

  <FAQ items={[
    { question: 'Can I switch plans?', answer: 'Yes, anytime.' },
  ]} />

  <CTABlock heading="Start free today"
    primaryButton={{ text: 'Sign up', href: '/signup' }} />

</BaseLayout>
```

Every component adapts to your preset automatically. No CSS to write for branding.

## The design token system

Tokens are TypeScript objects that define a site's visual identity:

```typescript
export const SAAS: DesignTokens = {
  colorPrimary:   '#0a0f14',
  colorSecondary: '#1a1f2e',
  colorAccent:    '#34d399',
  colorBackground:'#0d1117',
  colorText:      '#e6edf3',
  colorCta:       '#10b981',
  fontHeading:    'Sora',
  fontBody:       'Inter, system-ui, sans-serif',
};
```

These get converted to CSS custom properties by `BaseLayout` and injected into `:root`. Every component reads `var(--color-primary)`, `var(--font-heading)`, etc. — so switching from Corporate to SaaS is a one-line change in your page's import.

Three presets ship out of the box. Creating your own is just defining a new object that conforms to the `DesignTokens` interface.

## What ships in the component library

22 components, each with typed Props, scoped styles, and zero third-party dependencies:

**Page structure:** Header, Footer, BaseLayout, IndustryLayout, ProductLayout, Breadcrumb, SEOHead

**Content sections:** HeroSlider, StatsBar, FeatureGrid, ServiceCard, ProductCard, Timeline, TeamGrid, TestimonialSlider, LogoCloud, TrustBar

**Conversion:** CTABlock, PricingTable, ComparisonTable, ContactForm, Newsletter, FAQ

**Utility:** Banner, SectionDivider

Only 2 of 22 use any JavaScript (the carousel sliders). Everything else is pure HTML + CSS.

## Deploying independently

Each site builds independently via Turborepo:

```bash
bun run build --filter=acme.com
wrangler pages deploy sites/acme.com/dist --project-name=acme
```

Turborepo caches builds, so if only one site changed, only that site rebuilds. A full fleet of 10 sites builds in seconds.

## See it in action

We built three demo sites to show the range:

| Preset | Demo | What it looks like |
|--------|------|--------------------|
| Corporate | [astro-fleet-meridian.pages.dev](https://astro-fleet-meridian.pages.dev) | Consulting firm — editorial hero, stats strip, numbered practice areas |
| SaaS | [astro-fleet-flux.pages.dev](https://astro-fleet-flux.pages.dev) | Dev tool — dark theme, code mockup, pricing tiers, comparison table |
| Warm | [astro-fleet-olive.pages.dev](https://astro-fleet-olive.pages.dev) | Restaurant — warm gradients, serif type, dotted-leader menu |

Click through to the About and Contact pages — each site uses a different combination of the shared components.

## Getting started

```bash
git clone https://github.com/Indivar/astro-fleet.git
cd astro-fleet
bun install
./scripts/new-site.sh yourdomain.com saas
bun install
bun run dev --filter=yourdomain.com
```

Full documentation: [Components Reference](https://github.com/Indivar/astro-fleet/blob/main/docs/components.md) · [Getting Started Guide](https://github.com/Indivar/astro-fleet/blob/main/docs/getting-started.md) · [Design Tokens](https://github.com/Indivar/astro-fleet/blob/main/docs/design-tokens.md)

**Repo:** [github.com/Indivar/astro-fleet](https://github.com/Indivar/astro-fleet) — MIT licensed, contributions welcome.

---

*We use this in production to run [vairi.com](https://www.vairi.com), [claspt.app](https://www.claspt.app), and [stakteck.com](https://www.stakteck.com). If you ship a site with Astro Fleet, open a PR adding it to the "Built with" section — we'd love to feature it.*
