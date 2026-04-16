# Components Reference

Astro Fleet ships **22 components** and **3 layouts** in `packages/shared-ui/`. Every component is self-contained: typed Props, scoped styles, CSS custom properties for theming, and zero third-party dependencies. Import them using the `@astro-fleet/shared-ui` workspace alias.

```astro
---
import ComponentName from '@astro-fleet/shared-ui/src/components/ComponentName.astro';
---
```

## Quick reference

| Component | Purpose | JS? |
|-----------|---------|-----|
| [Banner](#banner) | Top-of-page announcement or cookie bar (dismissible, 4 variants) | No |
| [Breadcrumb](#breadcrumb) | Navigation trail with JSON-LD structured data | No |
| [ComparisonTable](#comparisontable) | Feature comparison grid with ✓/✗ and custom text | No |
| [ContactForm](#contactform) | Enquiry form with validation, optional WhatsApp CTA | No |
| [CTABlock](#ctablock) | Full-width call-to-action with heading, description, and buttons | No |
| [FAQ](#faq) | Accordion via `<details>/<summary>` — pure CSS, accessible | No |
| [FeatureGrid](#featuregrid) | Icon + title + description cards (2/3/4 columns) | No |
| [Footer](#footer) | Multi-column footer with contact info, social icons, bottom bar | No |
| [Header](#header) | Sticky nav with dropdowns, CTA button, zero-JS mobile menu | No |
| [HeroSlider](#heroslider) | Content carousel with dot navigation and auto-advance | Minimal |
| [LogoCloud](#logocloud) | Partner/client logos for social proof (grayscale hover) | No |
| [Newsletter](#newsletter) | Email capture form — provider-agnostic | No |
| [PricingTable](#pricingtable) | Tiered pricing cards with badges and feature lists | No |
| [ProductCard](#productcard) | Physical product card with image, spec, and action buttons | No |
| [SectionDivider](#sectiondivider) | Decorative SVG wave/curve shapes (6 presets) | No |
| [SEOHead](#seohead) | All `<head>` SEO tags: OG, Twitter Card, JSON-LD, canonical | No |
| [ServiceCard](#servicecard) | Service offering card with icon slot and arrow link | No |
| [StatsBar](#statsbar) | Horizontal metrics strip (dark/light) | No |
| [TeamGrid](#teamgrid) | People cards with photo fallback, bio, social links | No |
| [TestimonialSlider](#testimonialslider) | Horizontal testimonial carousel with star ratings | Minimal |
| [Timeline](#timeline) | Vertical timeline for history, milestones, or changelogs | No |
| [TrustBar](#trustbar) | Compact row of trust indicators (certifications, stats) | No |

**Layouts:** [BaseLayout](#baselayout) · [IndustryLayout](#industrylayout) · [ProductLayout](#productlayout)

---

## How components work

Every component follows the same pattern:

1. **Typed Props** — each component exports a `Props` interface. TypeScript catches misuse at build time.
2. **CSS custom properties** — colours and fonts come from `var(--color-primary)`, `var(--font-heading)`, etc. These are set by your design preset (CORPORATE, SAAS, WARM) in `BaseLayout`. You never need to touch component styles to rebrand a site.
3. **Scoped styles** — each component's `<style>` block is automatically scoped by Astro, so class names never leak or collide.
4. **No global state** — everything flows through props or named slots. Two instances of the same component on one page won't interfere.
5. **No third-party dependencies** — every component is pure HTML, CSS, and (where needed) vanilla JS. Nothing to install, nothing to break.

### Customising a component

If you need to override styles, use CSS specificity in your page's `<style>` block:

```astro
<style>
  /* Override the CTA block's background in this page only */
  .cta-block { background: var(--color-accent); }
</style>
```

Or pass a different CSS variable value by wrapping the component in a container:

```astro
<div style="--color-accent: #e11d48;">
  <CTABlock heading="Sale ends Friday" primaryButton={{ text: 'Shop now', href: '/sale' }} />
</div>
```

---

## Components

### Banner

A top-of-page notification bar for announcements, promotions, or cookie consent. Dismissible via a pure CSS checkbox hack — **no JavaScript required**. The banner stays dismissed for the duration of the page view.

**When to use:** Product launches, maintenance notices, promotional offers, cookie consent banners, or any time-sensitive message that should be visible but dismissible.

```ts
export interface Props {
  text:         string;
  linkText?:    string;      // optional call-to-action text
  linkHref?:    string;      // URL for the link
  variant?:     'info' | 'success' | 'warning' | 'accent';  // default: 'info'
  dismissible?: boolean;     // show close button; default: true
  id?:          string;      // unique ID for dismiss state; default: 'banner-dismiss'
}
```

**Basic usage:**

```astro
---
import Banner from '@astro-fleet/shared-ui/src/components/Banner.astro';
---
<Banner
  text="We've just launched v2.0 with session replay!"
  linkText="See what's new"
  linkHref="/changelog"
  variant="accent"
/>
```

**Multiple banners on one page:** Each banner needs a unique `id` so the dismiss state doesn't conflict:

```astro
<Banner id="cookie-banner" text="We use cookies for analytics." variant="warning" />
<Banner id="promo-banner" text="20% off annual plans this week." variant="accent" linkText="Claim now" linkHref="/pricing" />
```

**Non-dismissible (e.g. maintenance notice):**

```astro
<Banner text="Scheduled maintenance: Saturday 2am–4am UTC." variant="warning" dismissible={false} />
```

**Variant colours:**
- `info` — blue background (#eff6ff)
- `success` — green background (#f0fdf4)
- `warning` — amber background (#fffbeb)
- `accent` — uses your preset's `--color-accent` as a solid background with white text

**CSS variables consumed:** `--color-accent`

---

### Breadcrumb

Renders an accessible breadcrumb trail with automatic `BreadcrumbList` JSON-LD structured data for search engines. The last item is rendered as plain text (not a link) to indicate the current page.

**When to use:** Every inner page (services, about, contact, product detail). Place it inside a `.container` div, right after `BaseLayout` opens.

```ts
export interface BreadcrumbItem {
  label: string;
  href?: string;   // omit for the current (last) item
}

export interface Props {
  items:    BreadcrumbItem[];
  baseUrl?: string;   // prepended to hrefs in JSON-LD (e.g. 'https://acme.com')
}
```

**Usage:**

```astro
---
import Breadcrumb from '@astro-fleet/shared-ui/src/components/Breadcrumb.astro';
---
<div class="container">
  <Breadcrumb
    items={[
      { label: 'Home',     href: '/' },
      { label: 'Products', href: '/products/' },
      { label: 'Widget A' },
    ]}
    baseUrl="https://acme.com"
  />
</div>
```

**Tip:** When deploying to a custom domain, always set `baseUrl` so the JSON-LD structured data contains full URLs that Google can use.

**CSS variables consumed:** `--color-accent`, `--font-body`

---

### ComparisonTable

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

### ContactForm

A full enquiry form with fields for name, company, email, phone, optional industry dropdown, product interest, and message. Includes built-in validation styling (`:invalid:not(:placeholder-shown)`) and an optional WhatsApp CTA for markets where WhatsApp is preferred.

**When to use:** Contact pages, product inquiry pages, demo request forms. The form is provider-agnostic — set `formAction` to your own API endpoint, Formspree, Netlify Forms, or any backend.

```ts
export interface Props {
  formAction?:      string;     // default: '/api/enquiry'
  machineName?:     string;     // pre-fills the Product Interest field
  machineSlug?:     string;     // added as a hidden field
  showWhatsApp?:    boolean;    // default: false
  whatsAppNumber?:  string;     // international format, e.g. '+15551234567'
  whatsAppMessage?: string;     // pre-filled WhatsApp message
  heading?:         string;     // default: 'Send Us an Enquiry'
  description?:     string;
  industries?:      string[];   // renders a <select> dropdown when provided
}
```

**Basic usage:**

```astro
---
import ContactForm from '@astro-fleet/shared-ui/src/components/ContactForm.astro';
---
<ContactForm
  heading="Get in Touch"
  description="We'll respond within one business day."
  formAction="/api/contact"
/>
```

**With industry dropdown and WhatsApp:**

```astro
<ContactForm
  heading="Request a Quote"
  description="Tell us about your requirements."
  formAction="https://formspree.io/f/yourformid"
  showWhatsApp={true}
  whatsAppNumber="+15551234567"
  whatsAppMessage="Hi, I'd like a quote for..."
  industries={['Manufacturing', 'Retail', 'Healthcare', 'Finance', 'Other']}
/>
```

**Connecting to form providers:**
- **Formspree:** `formAction="https://formspree.io/f/your-form-id"`
- **Netlify Forms:** add `data-netlify="true"` to the form via a slot or custom integration
- **Custom API:** `formAction="/api/contact"` and handle the POST on your backend
- **Static fallback:** Leave `formAction="#"` and add a `footer-scripts` slot with your preferred form handler JS

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`, `--font-body`

---

### CTABlock

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

### FAQ

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
      answer: 'Almost none. 20 of 22 components are pure CSS. Only HeroSlider and TestimonialSlider include a small inline script for carousel navigation.',
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

### FeatureGrid

A flexible grid of feature cards with optional icons, titles, and descriptions. More versatile than ServiceCard — supports 2, 3, or 4 columns, left or centre alignment, and inline SVG icons passed as strings.

**When to use:** Feature overview sections, "Why choose us" blocks, benefit lists. Use FeatureGrid when you need a simple grid without links. Use ServiceCard when each item needs a clickable call-to-action.

```ts
export interface Feature {
  icon?:       string;    // raw SVG string, injected via set:html
  title:       string;
  description: string;
}

export interface Props {
  features:     Feature[];
  heading?:     string;
  description?: string;
  columns?:     2 | 3 | 4;            // default: 3
  align?:       'left' | 'center';    // default: 'left'
}
```

**Basic usage (no icons):**

```astro
---
import FeatureGrid from '@astro-fleet/shared-ui/src/components/FeatureGrid.astro';
---
<FeatureGrid
  heading="Why teams choose us"
  columns={3}
  features={[
    { title: 'Fast Builds',  description: 'Turborepo caches every site independently. Rebuilds take seconds.' },
    { title: 'Type-Safe',    description: 'Every component exports a Props interface. TypeScript catches errors at build time.' },
    { title: 'Zero JS',      description: 'Static HTML by default. Add interactivity only where you choose.' },
  ]}
/>
```

**With SVG icons:**

```astro
<FeatureGrid
  columns={4}
  align="center"
  features={[
    {
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      title: 'Lightning Fast',
      description: 'Sub-second page loads with zero client-side JavaScript.',
    },
    // ... more features
  ]}
/>
```

**Tip:** Copy SVG icons from [Lucide](https://lucide.dev/) or [Heroicons](https://heroicons.com/) and pass them as the `icon` string. The component wraps them in a styled container that uses `--color-accent`.

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-text-muted`, `--font-heading`

---

### Footer

Multi-column footer with brand section (name, tagline, contact details), link columns, social media icons, and a bottom bar with copyright and legal links. Built-in SVG icons for six social platforms.

**When to use:** You typically don't use this directly — `BaseLayout` renders it automatically from your site config. But you can import it standalone if you're building a custom layout.

```ts
export interface FooterLink   { label: string; href: string; }
export interface FooterColumn { title: string; links: FooterLink[]; }
export interface ContactInfo  { phone?: string; email?: string; address?: string; }
export interface SocialLink   { platform: string; url: string; }

export interface Props {
  columns:       FooterColumn[];
  contactInfo?:  ContactInfo;
  socialLinks?:  SocialLink[];    // default: []
  siteName:      string;
  year?:         number;          // default: current year
  tagline?:      string;
}
```

**Supported social platforms:** `linkedin`, `twitter`, `facebook`, `instagram`, `youtube`, `whatsapp` — each has a built-in SVG icon.

**Usage (standalone):**

```astro
---
import Footer from '@astro-fleet/shared-ui/src/components/Footer.astro';
---
<Footer
  siteName="Acme Corp"
  tagline="Building great things since 2020."
  columns={[
    { title: 'Product',  links: [{ label: 'Features', href: '/features' }, { label: 'Pricing', href: '/pricing' }] },
    { title: 'Company',  links: [{ label: 'About', href: '/about' }, { label: 'Careers', href: '/careers' }] },
    { title: 'Support',  links: [{ label: 'Docs', href: '/docs' }, { label: 'Contact', href: '/contact' }] },
  ]}
  contactInfo={{ email: 'hello@acme.com', phone: '+1 555 000 0000', address: '123 Main St, SF' }}
  socialLinks={[
    { platform: 'linkedin', url: 'https://linkedin.com/company/acme' },
    { platform: 'twitter', url: 'https://twitter.com/acme' },
  ]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--font-heading`, `--font-body`

---

### Header

Sticky top navigation bar with desktop dropdown menus, a CTA button, and a zero-JavaScript mobile menu (CSS checkbox toggle). Highlights the current page in the nav automatically.

**When to use:** Like Footer, you typically don't use this directly — `BaseLayout` handles it. Import standalone for custom layouts.

```ts
export interface MenuItem {
  label:     string;
  href:      string;
  children?: MenuItem[];   // renders a dropdown submenu
}

export interface Props {
  navigation: MenuItem[];
  logoSrc?:   string;      // path to logo image; undefined = text logo
  logoAlt?:   string;      // default: 'Company Logo'
  siteName:   string;      // used as alt text and text logo fallback
  ctaText?:   string;      // default: 'Get Started'
  ctaHref?:   string;      // default: '/contact'
}
```

**Navigation with dropdowns:**

```astro
const navigation = [
  { label: 'Product', href: '/product/', children: [
    { label: 'Features',    href: '/product/features/' },
    { label: 'Integrations', href: '/product/integrations/' },
    { label: 'Pricing',     href: '/pricing/' },
  ]},
  { label: 'About', href: '/about/' },
  { label: 'Blog',  href: '/blog/'  },
  { label: 'Contact', href: '/contact/' },
];
```

**Tip:** Define your navigation in `src/lib/site-config.ts` and import it everywhere. This ensures the header, mobile menu, and any breadcrumbs stay in sync.

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--cta-radius`, `--font-heading`, `--font-body`

---

### HeroSlider

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

### LogoCloud

A strip of partner or client logos for social proof. Accepts image URLs or renders text fallbacks when logo images aren't available. Logos are desaturated (grayscale) by default and colourise on hover.

**When to use:** Below the hero section to establish trust, on pricing pages to show recognisable customers, or in case study sections.

```ts
export interface LogoItem {
  name:   string;     // alt text for the image, or rendered as text if no image
  image?: string;     // URL to the logo image (SVG recommended)
  url?:   string;     // optional link (opens in new tab)
}

export interface Props {
  logos:      LogoItem[];
  heading?:   string;       // small label above the logos; default: 'Trusted by'
  grayscale?: boolean;      // desaturate logos by default; default: true
}
```

**With images:**

```astro
---
import LogoCloud from '@astro-fleet/shared-ui/src/components/LogoCloud.astro';
---
<LogoCloud
  heading="Trusted by teams at"
  logos={[
    { name: 'Stripe',   image: '/logos/stripe.svg', url: 'https://stripe.com' },
    { name: 'Vercel',   image: '/logos/vercel.svg', url: 'https://vercel.com' },
    { name: 'Supabase', image: '/logos/supabase.svg' },
  ]}
/>
```

**Text-only fallback (no logo images yet):**

```astro
<LogoCloud
  heading="Our partners"
  logos={[
    { name: 'Linear' },
    { name: 'Retool' },
    { name: 'Vercel' },
    { name: 'Railway' },
  ]}
/>
```

**Tip:** Use SVG logos at a consistent height (32px recommended). The component caps images at `height: 32px; max-width: 120px` and uses `object-fit: contain` so different aspect ratios work fine.

**CSS variables consumed:** `--color-primary`, `--color-text-muted`, `--font-heading`

---

### Newsletter

An email capture form for lead generation and mailing list signups. Provider-agnostic — set `formAction` to your Mailchimp, ConvertKit, Buttondown, Loops, or custom endpoint. Includes built-in privacy text and a `filled` variant for use on white backgrounds.

**When to use:** Bottom of blog posts, above the footer on content pages, or as a standalone section on the home page. The `filled` variant adds a subtle background so the form stands out from white page sections.

```ts
export interface Props {
  heading?:     string;     // default: 'Stay in the loop'
  description?: string;     // default: 'Get product updates and engineering insights...'
  formAction?:  string;     // default: '#'
  buttonText?:  string;     // default: 'Subscribe'
  placeholder?: string;     // default: 'you@company.com'
  variant?:     'default' | 'filled';   // default: 'default'
}
```

**Basic usage:**

```astro
---
import Newsletter from '@astro-fleet/shared-ui/src/components/Newsletter.astro';
---
<Newsletter
  heading="Engineering insights, weekly"
  description="One email per week. Architecture deep-dives, performance tips, and what we shipped. Unsubscribe anytime."
  buttonText="Subscribe"
  variant="filled"
/>
```

**Connecting to email providers:**

```astro
<!-- Buttondown -->
<Newsletter formAction="https://buttondown.email/api/emails/embed-subscribe/yourname" />

<!-- ConvertKit -->
<Newsletter formAction="https://app.convertkit.com/forms/FORM_ID/subscriptions" />

<!-- Mailchimp -->
<Newsletter formAction="https://yourlist.us1.list-manage.com/subscribe/post?u=XXXX&id=YYYY" />
```

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--cta-radius`, `--font-body`

---

### PricingTable

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

### ProductCard

Card component for a physical product or piece of equipment — image (with placeholder fallback), category badge, key specification, and two action buttons (View Details / Request Quote).

**When to use:** Product catalogues, equipment listing pages, or any e-commerce-style grid. The detail URL is auto-generated from `categorySlug` and `slug`, or you can override with `detailsHref`.

```ts
export interface KeySpec {
  label: string;   // e.g. 'Capacity'
  value: string;   // e.g. '120 units/min'
}

export interface Props {
  name:          string;
  slug:          string;
  category:      string;
  image?:        string;
  imageAlt?:     string;
  keySpec?:      KeySpec;
  categorySlug?: string;
  detailsHref?:  string;     // overrides auto-generated URL
  quoteHref?:    string;     // default: '/contact'
}
```

**Usage:**

```astro
---
import ProductCard from '@astro-fleet/shared-ui/src/components/ProductCard.astro';
---
<ProductCard
  name="Widget A"
  slug="widget-a"
  category="Packaging Machines"
  categorySlug="packaging"
  image="/images/widget-a.webp"
  keySpec={{ label: 'Capacity', value: '120 units/min' }}
  quoteHref="/contact?product=widget-a"
/>
```

**Auto-generated URLs:**
- With `categorySlug`: `/products/packaging/widget-a`
- Without `categorySlug`: `/products/widget-a`
- With `detailsHref`: uses your custom URL

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`, `--font-body`

---

### SectionDivider

A decorative SVG shape placed between page sections to create visual separation. Six shape presets available, each rendered as a responsive SVG that fills the container width. Flip vertically to use as a section footer.

**When to use:** Between sections with different background colours, between a dark hero and a light content section, or anywhere you want a softer transition than a hard edge.

```ts
export interface Props {
  shape?:  'wave' | 'curve' | 'angle' | 'zigzag' | 'rounded' | 'arrow';  // default: 'wave'
  flip?:   boolean;    // mirror vertically; default: false
  fill?:   string;     // SVG fill colour; default: 'var(--color-background, #ffffff)'
  height?: number;     // pixels; default: 64
}
```

**Between a dark section and a light section:**

```astro
---
import SectionDivider from '@astro-fleet/shared-ui/src/components/SectionDivider.astro';
---
<section style="background: #0f172a; padding: 4rem 1.5rem; color: #fff;">
  <h2>Dark section content</h2>
</section>

<SectionDivider shape="wave" fill="#0f172a" />

<section style="padding: 4rem 1.5rem;">
  <h2>Light section content</h2>
</section>
```

**Available shapes:**
- `wave` — smooth S-curve (default, most organic)
- `curve` — single parabolic arc
- `angle` — sharp V-shape pointing down
- `zigzag` — sawtooth pattern
- `rounded` — wide semicircle
- `arrow` — same as angle but often used flipped

**Using flip for section footer:**

```astro
<SectionDivider shape="curve" fill="#f8fafc" flip={true} />
<section style="background: #f8fafc;">
  <!-- section with light grey background -->
</section>
<SectionDivider shape="curve" fill="#f8fafc" />
```

**Adjusting height:**

```astro
<SectionDivider shape="wave" height={96} />  <!-- taller, more dramatic -->
<SectionDivider shape="wave" height={32} />  <!-- subtle, barely visible -->
```

**CSS variables consumed:** `--color-background` (as default fill)

---

### SEOHead

Injects all `<head>` SEO tags: title, description, keywords, Open Graph (og:), Twitter Card, canonical URL, and JSON-LD structured data. Place inside `<head>` or use via BaseLayout (which renders it automatically).

**When to use:** Every page. BaseLayout calls this internally, so you only need it directly if building a custom layout.

```ts
export interface Props {
  title:            string;
  description:      string;
  keywords?:        string[];
  structuredData?:  Record<string, unknown>;
  canonicalUrl?:    string;         // auto-derived from Astro.url if omitted
  ogImage?:         string;         // falls back to /images/og-default.png
  siteName?:        string;
  ogType?:          string;         // default: 'website'
  locale?:          string;         // default: 'en_US'
  twitterHandle?:   string;
  noindex?:         boolean;        // default: false
}
```

**With structured data:**

```astro
<SEOHead
  title="Widget A — Packaging Machines"
  description="High-speed packaging machine for consumer goods."
  keywords={['packaging machine', 'widget a', 'manufacturing']}
  siteName="Acme Corp"
  structuredData={{
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Widget A',
    description: 'High-speed packaging machine.',
  }}
/>
```

**CSS variables consumed:** none (pure `<head>` tags)

---

### ServiceCard

Card for a service offering — icon slot, title, description, and an arrow link. The icon slot accepts any SVG; a wrench icon is used as fallback if no slot content is provided. Cards have a hover state that highlights the border with `--color-accent`.

**When to use:** Services pages, feature overviews, or any grid where each card links to a detail page or contact form.

```ts
export interface Props {
  title:       string;
  description: string;
  href:        string;
  linkText?:   string;   // default: 'Learn More'
}
```

**Basic usage:**

```astro
---
import ServiceCard from '@astro-fleet/shared-ui/src/components/ServiceCard.astro';
---
<ServiceCard
  title="Cloud Hosting"
  description="Scalable infrastructure on Cloudflare, Vercel, or AWS."
  href="/services/hosting/"
  linkText="Explore Hosting"
/>
```

**With custom icon:**

```astro
<ServiceCard title="Analytics" description="Privacy-first analytics." href="/services/analytics/">
  <svg slot="icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
</ServiceCard>
```

**CSS variables consumed:** `--color-accent`, `--font-heading`, `--font-body`

---

### StatsBar

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

### TeamGrid

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

### TestimonialSlider

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

### Timeline

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

### TrustBar

A compact horizontal bar of trust indicators — certifications, stats, or awards. Renders with a subtle grid background using `--color-primary`. Icons are optional and injected as raw SVG strings.

**When to use:** Directly below the hero, above the fold, to establish immediate credibility. Keep it to 3–5 items for readability.

```ts
export interface TrustItem {
  icon?: string;   // raw SVG string injected via set:html
  text:  string;
}

export interface Props {
  items: TrustItem[];
}
```

**Usage:**

```astro
---
import TrustBar from '@astro-fleet/shared-ui/src/components/TrustBar.astro';
---
<TrustBar
  items={[
    { text: 'ISO 9001 Certified' },
    { text: '500+ Clients Worldwide' },
    { text: '99.9% Uptime SLA' },
    { text: '24/7 Support' },
  ]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--font-body`

---

## Layouts

### BaseLayout

The full-page shell that every page uses. Composes `SEOHead`, `Header`, `<main>`, and `Footer`. Applies CSS custom properties from `designTokens` to `:root` at build time. Includes a global CSS reset and utility classes (`.container`, `.section`, `.section-header`).

**Key props (abridged — includes all SEOHead + Header + Footer props):**

```ts
export interface Props {
  title:          string;
  description:    string;
  keywords?:      string[];
  structuredData?: Record<string, unknown>;
  canonicalUrl?:  string;
  ogImage?:       string;
  navigation:     MenuItem[];
  footerColumns:  FooterColumn[];
  contactInfo?:   ContactInfo;
  socialLinks?:   SocialLink[];
  siteName:       string;
  designTokens?:  DesignTokens;
  logoSrc?:       string;
  logoAlt?:       string;
  tagline?:       string;
  ctaText?:       string;
  ctaHref?:       string;
  bodyClass?:     string;
  theme?:         'light' | 'dark';
}
```

**Named slots:** `head` (extra `<head>` content), `footer-scripts` (scripts before `</body>`)

**Usage:**

```astro
---
import BaseLayout from '@astro-fleet/shared-ui/src/layouts/BaseLayout.astro';
import { CORPORATE } from '@astro-fleet/config/tokens';
import { SITE_NAME, navigation, footerColumns, contactInfo, socialLinks } from '../lib/site-config';
---
<BaseLayout
  title="Home — Acme Corp"
  description="We build great things."
  siteName={SITE_NAME}
  navigation={navigation}
  footerColumns={footerColumns}
  contactInfo={contactInfo}
  socialLinks={socialLinks}
  designTokens={CORPORATE}
>
  <h1>Hello world</h1>
</BaseLayout>
```

**Adding analytics or third-party scripts:**

```astro
<BaseLayout ...props>
  <script slot="footer-scripts" src="https://plausible.io/js/script.js" data-domain="yourdomain.com" defer></script>
  <main>
    <!-- page content -->
  </main>
</BaseLayout>
```

---

### IndustryLayout

Extends `BaseLayout`. Adds breadcrumb navigation and named slots for structured industry/vertical pages: hero, products, case studies, testimonials, and services sections. Renders an automatic `CTABlock` at the bottom.

**Additional props (on top of BaseLayout):**

```ts
export interface Props extends BaseLayoutProps {
  breadcrumbs?:        BreadcrumbItem[];
  industryName?:       string;
  showCTA?:            boolean;
  ctaHeading?:         string;
  ctaDescription?:     string;
  ctaPrimaryButton?:   { text: string; href: string };
  ctaSecondaryButton?: { text: string; href: string };
}
```

**Named slots:** `head`, `hero`, `products`, `case-studies`, `testimonials`, `services`, `footer-scripts`

---

### ProductLayout

Extends `BaseLayout`. Adds breadcrumb navigation, a two-column layout (content + sidebar), a related products slot, and an automatic `CTABlock` at the bottom.

**Additional props (on top of BaseLayout):**

```ts
export interface Props extends BaseLayoutProps {
  breadcrumbs?:        BreadcrumbItem[];
  category?:           string;
  showCTA?:            boolean;
  ctaHeading?:         string;
  ctaDescription?:     string;
  ctaPrimaryButton?:   { text: string; href: string };
  ctaSecondaryButton?: { text: string; href: string };
}
```

**Named slots:** `head`, `hero`, `sidebar`, `related`, `footer-scripts`

---

## Recipes

These patterns show how to compose multiple components together for common page types.

### SaaS home page

```astro
<Banner text="Just shipped: Session Replay" linkText="Try it" linkHref="/product/replay" variant="accent" />

<HeroSlider variant="dark" slides={heroSlides} />

<LogoCloud logos={customers} heading="Trusted by engineering teams at" />

<FeatureGrid heading="Everything you need" columns={3} features={features} />

<SectionDivider shape="wave" fill="var(--color-primary)" />

<StatsBar items={metrics} />

<PricingTable heading="Simple pricing" tiers={tiers} />

<TestimonialSlider testimonials={testimonials} />

<FAQ heading="Common questions" items={faqs} />

<Newsletter heading="Engineering blog" variant="filled" />

<CTABlock heading="Start free today" primaryButton={{ text: 'Sign up', href: '/signup' }} />
```

### Corporate about page

```astro
<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

<!-- Page hero (custom) -->

<StatsBar items={companyStats} />

<Timeline heading="Our History" events={milestones} />

<SectionDivider shape="curve" fill="#f8fafc" />

<TeamGrid heading="Leadership" members={executives} columns={4} />

<FAQ heading="Working with us" items={engagementFAQs} />

<Newsletter heading="Quarterly insights" />

<CTABlock heading="Let's talk" primaryButton={{ text: 'Contact us', href: '/contact' }} />
```

### Restaurant home page

```astro
<Banner text="Mother's Day brunch — reservations open" linkText="Book now" linkHref="/contact" variant="accent" />

<!-- Hero (custom) -->

<!-- Awards strip (custom) -->

<SectionDivider shape="curve" fill="#1c1917" />

<!-- Chef quote (custom) -->

<FeatureGrid heading="What makes us different" columns={4} features={values} align="center" />

<!-- Featured dishes (custom) -->

<Newsletter heading="The Weekly Table" description="Our menu changes every Monday. Get it in your inbox." variant="filled" />

<CTABlock heading="Join us for dinner" primaryButton={{ text: 'Reserve a table', href: '/contact' }} />
```

---

## Third-party integrations

Astro Fleet doesn't bundle third-party services, but here's how to integrate common ones:

### Comments

Add comments to any page via the `footer-scripts` slot:

- **Giscus** (GitHub Discussions-backed, recommended for developer audiences): Add the Giscus `<script>` tag. Free, no account required for GitHub users.
- **Disqus**: Add the Disqus universal embed code.
- **Cusdis**: Lightweight, privacy-first alternative.

### Analytics

Use the `footer-scripts` slot in BaseLayout:

- **Plausible** (recommended — privacy-first, no cookie banner needed): `<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>`
- **Fathom**: Similar to Plausible, single script tag.
- **Google Analytics 4**: Standard gtag.js snippet.
- **PostHog**: Full product analytics with session replay.

### Forms

The `ContactForm` and `Newsletter` components accept any `formAction` URL:

- **Formspree**: `https://formspree.io/f/your-form-id`
- **Netlify Forms**: Add `data-netlify="true"` to the form element
- **Basin**: `https://usebasin.com/f/your-form-id`
- **Custom API**: Any URL that accepts a POST with form data

### Cookie consent

Use the `Banner` component with `variant="warning"` for a simple, GDPR-compliant cookie notice. For full consent management, consider adding a lightweight library like **cookie-consent-box** or **Osano** via the `footer-scripts` slot.
