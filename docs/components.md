# Components Reference

All components live in `packages/shared-ui/src/components/`. Layouts live in `packages/shared-ui/src/layouts/`. Import them using the `@astro-fleet/shared-ui` workspace alias.

This is a reference document — one section per component, with the real Props interface, a usage example, and the CSS variables each component reads.

---

## Components

### Breadcrumb

Renders an accessible breadcrumb trail with automatic `BreadcrumbList` JSON-LD structured data.

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
<Breadcrumb
  items={[
    { label: 'Home',     href: '/' },
    { label: 'Products', href: '/products/' },
    { label: 'Widget A' },
  ]}
  baseUrl="https://acme.com"
/>
```

**CSS variables consumed:** `--color-accent`, `--font-body`

---

### CTABlock

Full-width call-to-action section with a heading, optional description, and one or two buttons.

```ts
export interface CTAButton {
  text: string;
  href: string;
}

export interface Props {
  heading:         string;
  description?:    string;
  primaryButton:   CTAButton;
  secondaryButton?: CTAButton;
  variant?:        'light' | 'dark';   // default: 'dark'
}
```

**Usage:**

```astro
---
import CTABlock from '@astro-fleet/shared-ui/src/components/CTABlock.astro';
---
<CTABlock
  heading="Ready to get started?"
  description="Join thousands of teams already using Acme."
  primaryButton={{ text: 'Start Free Trial', href: '/signup' }}
  secondaryButton={{ text: 'Talk to Sales', href: '/contact' }}
  variant="dark"
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--color-cta`, `--cta-radius`, `--font-heading`, `--font-body`

---

### ContactForm

Enquiry form with fields for name, company, email, phone, optional industry dropdown, product interest, and message. Includes optional WhatsApp CTA.

```ts
export interface Props {
  formAction?:      string;     // default: '/api/enquiry'
  machineName?:     string;     // pre-fills the Product Interest field
  machineSlug?:     string;     // added as a hidden field
  showWhatsApp?:    boolean;    // default: false
  whatsAppNumber?:  string;     // e.g. '+15551234567'
  whatsAppMessage?: string;
  heading?:         string;     // default: 'Send Us an Enquiry'
  description?:     string;
  industries?:      string[];   // renders a select dropdown when provided
}
```

**Usage:**

```astro
---
import ContactForm from '@astro-fleet/shared-ui/src/components/ContactForm.astro';
---
<ContactForm
  heading="Get in Touch"
  description="We'll respond within one business day."
  formAction="/api/contact"
  showWhatsApp={true}
  whatsAppNumber="+15551234567"
  industries={['Manufacturing', 'Retail', 'Healthcare']}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`, `--font-body`

---

### Footer

Multi-column footer with brand section, link columns, contact info, social icons, and a bottom bar.

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

**Supported social platforms:** `linkedin`, `twitter`, `facebook`, `instagram`, `youtube`, `whatsapp`

**Usage:**

```astro
---
import Footer from '@astro-fleet/shared-ui/src/components/Footer.astro';
---
<Footer
  siteName="Acme Corp"
  tagline="Building great things since 2020."
  columns={footerColumns}
  contactInfo={{ email: 'hello@acme.com', phone: '+1 555 000 0000' }}
  socialLinks={[{ platform: 'linkedin', url: 'https://linkedin.com/company/acme' }]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--font-heading`, `--font-body`

---

### Header

Sticky top navigation with desktop menu, hover dropdowns, CTA button, and a no-JS mobile menu (CSS checkbox toggle).

```ts
export interface MenuItem {
  label:     string;
  href:      string;
  children?: MenuItem[];
}

export interface Props {
  navigation: MenuItem[];
  logoSrc?:   string;
  logoAlt?:   string;      // default: 'Company Logo'
  siteName:   string;
  ctaText?:   string;      // default: 'Get Started'
  ctaHref?:   string;      // default: '/contact'
}
```

**Usage:**

```astro
---
import Header from '@astro-fleet/shared-ui/src/components/Header.astro';
---
<Header
  siteName="Acme Corp"
  logoSrc="/logo.svg"
  navigation={navigation}
  ctaText="Book a Demo"
  ctaHref="/demo"
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--cta-radius`, `--font-heading`, `--font-body`

---

### ProductCard

Card component for a physical product or machine — image, category badge, key spec, and two action buttons (View Details / Request Quote).

```ts
export interface KeySpec {
  label: string;
  value: string;
}

export interface Props {
  name:          string;
  slug:          string;
  category:      string;
  image?:        string;
  imageAlt?:     string;      // default: name
  keySpec?:      KeySpec;
  categorySlug?: string;
  detailsHref?:  string;      // overrides auto-generated URL
  quoteHref?:    string;      // default: '/contact'
}
```

The detail URL is auto-generated as `/products/<categorySlug>/<slug>` (or `/products/<slug>` without a category slug), unless `detailsHref` is provided.

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
/>
```

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`, `--font-body`

---

### SEOHead

Injects all `<head>` SEO tags: title, description, keywords, Open Graph, Twitter Card, canonical URL, and JSON-LD structured data. Place inside `<head>`.

```ts
export interface Props {
  title:            string;
  description:      string;
  keywords?:        string[];
  structuredData?:  Record<string, unknown>;   // serialised as JSON-LD
  canonicalUrl?:    string;                    // auto-derived from Astro.url if omitted
  ogImage?:         string;                    // falls back to /images/og-default.png
  siteName?:        string;
  ogType?:          string;                    // default: 'website'
  locale?:          string;                    // default: 'en_US'
  twitterHandle?:   string;
  noindex?:         boolean;                   // default: false
}
```

**Usage:**

```astro
---
import SEOHead from '@astro-fleet/shared-ui/src/components/SEOHead.astro';
---
<head>
  <SEOHead
    title="Widget A — Packaging Machines"
    description="High-speed packaging machine for consumer goods."
    keywords={['packaging machine', 'widget a']}
    siteName="Acme Corp"
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Widget A',
    }}
  />
</head>
```

**CSS variables consumed:** none (pure `<head>` tags)

---

### ServiceCard

Card for a service offering — icon slot, title, description, and an arrow link.

```ts
export interface Props {
  title:       string;
  description: string;
  href:        string;
  linkText?:   string;   // default: 'Learn More'
}
```

Accepts an `icon` named slot for a custom SVG. Falls back to a wrench icon if the slot is empty.

**Usage:**

```astro
---
import ServiceCard from '@astro-fleet/shared-ui/src/components/ServiceCard.astro';
---
<ServiceCard
  title="Cloud Hosting"
  description="Scalable infrastructure for your applications."
  href="/services/cloud-hosting"
  linkText="Explore Hosting"
>
  <svg slot="icon" width="32" height="32" viewBox="0 0 24 24" ...>...</svg>
</ServiceCard>
```

**CSS variables consumed:** `--color-accent`, `--font-heading`, `--font-body`

---

### TestimonialSlider

Horizontally scrollable testimonial cards with optional star ratings and CSS dot navigation. No third-party dependencies — uses scroll-snap and a small inline script for dot clicks.

```ts
export interface Testimonial {
  clientName: string;
  company:    string;
  role?:      string;
  quote:      string;
  rating?:    number;   // 1–5, renders star icons
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
  heading="What Our Clients Say"
  testimonials={[
    {
      clientName: 'Jane Smith',
      company:    'Globex Corp',
      role:       'Head of Operations',
      quote:      'Transformed our production line in under a week.',
      rating:     5,
    },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--font-heading`, `--font-body`

---

### TrustBar

Compact horizontal bar of trust indicators (certifications, stats, awards). Renders with a subtle grid background using `--color-primary`.

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
    { text: '500+ Clients' },
    { text: '24/7 Support' },
  ]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--font-body`

---

### Banner

Top-of-page announcement or notification bar. Dismissible via a CSS checkbox hack — no JavaScript required. Supports info, success, warning, and accent variants.

```ts
export interface Props {
  text:         string;
  linkText?:    string;
  linkHref?:    string;
  variant?:     'info' | 'success' | 'warning' | 'accent';  // default: 'info'
  dismissible?: boolean;   // default: true
  id?:          string;    // unique ID for dismiss checkbox
}
```

**Usage:**

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

**CSS variables consumed:** `--color-accent`

---

### ComparisonTable

Feature comparison grid with checkmarks, crosses, or custom text. Use for pricing tiers, product vs. competitor, or feature matrices.

```ts
export interface ComparisonColumn {
  name:         string;
  highlighted?: boolean;
}

export interface ComparisonRow {
  feature: string;
  values:  (boolean | string)[];   // true = ✓, false = ✗, string = custom
}

export interface Props {
  columns:      ComparisonColumn[];
  rows:         ComparisonRow[];
  heading?:     string;
  description?: string;
}
```

**Usage:**

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
    { feature: 'Unlimited users',    values: [false, true, true] },
    { feature: 'API access',         values: ['REST only', 'REST + GraphQL', 'REST + GraphQL'] },
    { feature: 'Dedicated support',  values: [false, false, true] },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-text`, `--font-heading`

---

### FAQ

Accessible accordion built with `<details>/<summary>`. Pure CSS, zero JavaScript, progressive enhancement by default.

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

**Usage:**

```astro
---
import FAQ from '@astro-fleet/shared-ui/src/components/FAQ.astro';
---
<FAQ
  heading="Common Questions"
  items={[
    { question: 'How do I add a new site?', answer: 'Run ./scripts/new-site.sh domain.com [preset] and then bun install.' },
    { question: 'Can I use a custom font?', answer: 'Yes — update the @theme layer in global.css and the font-heading/font-body tokens.' },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--font-heading`

---

### FeatureGrid

Flexible icon + title + description grid. More versatile than ServiceCard — supports 2, 3, or 4 columns, centred or left-aligned layout, and optional inline SVG icons.

```ts
export interface Feature {
  icon?:       string;    // raw SVG string injected via set:html
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

**Usage:**

```astro
---
import FeatureGrid from '@astro-fleet/shared-ui/src/components/FeatureGrid.astro';
---
<FeatureGrid
  heading="Why choose us"
  columns={3}
  features={[
    { title: 'Fast Builds',  description: 'Turborepo caches every site build.' },
    { title: 'Type-Safe',    description: 'Typed Props interfaces on every component.' },
    { title: 'Zero JS',      description: 'Static HTML by default, JS only when you opt in.' },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-text-muted`, `--font-heading`

---

### HeroSlider

Content carousel with smooth CSS transitions, dot navigation, and optional auto-advance. Uses minimal vanilla JS (same pattern as TestimonialSlider). Supports light, dark, and gradient backgrounds.

```ts
export interface Slide {
  eyebrow?:        string;
  heading:         string;
  description:     string;
  primaryButton?:  { text: string; href: string };
  secondaryButton?: { text: string; href: string };
  image?:          string;
  imageAlt?:       string;
}

export interface Props {
  slides:    Slide[];
  autoplay?: number;              // ms between slides; 0 = off; default: 5000
  variant?:  'light' | 'dark' | 'gradient';  // default: 'light'
}
```

**Usage:**

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
    },
    {
      heading: 'Three presets, infinite possibilities',
      description: 'Corporate, SaaS, Warm — or design your own.',
      primaryButton: { text: 'See Demos', href: '#demos' },
      image: '/images/presets.png',
      imageAlt: 'Three preset previews',
    },
  ]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-secondary`, `--color-accent`, `--color-cta`, `--cta-radius`, `--font-heading`

---

### LogoCloud

Strip of partner/client logos for social proof. Accepts image URLs or renders text fallbacks. Logos are grayscale by default and colourize on hover.

```ts
export interface LogoItem {
  name:   string;
  image?: string;   // URL to logo image
  url?:   string;   // optional link
}

export interface Props {
  logos:       LogoItem[];
  heading?:    string;       // default: 'Trusted by'
  grayscale?:  boolean;      // default: true
}
```

**Usage:**

```astro
---
import LogoCloud from '@astro-fleet/shared-ui/src/components/LogoCloud.astro';
---
<LogoCloud
  heading="Our partners"
  logos={[
    { name: 'Acme Corp', image: '/logos/acme.svg', url: 'https://acme.com' },
    { name: 'Globex',    image: '/logos/globex.svg' },
    { name: 'Initech' },
  ]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-text-muted`, `--font-heading`

---

### Newsletter

Email capture form for lead generation. Provider-agnostic — set `formAction` to your Mailchimp, ConvertKit, Buttondown, or custom endpoint.

```ts
export interface Props {
  heading?:     string;     // default: 'Stay in the loop'
  description?: string;
  formAction?:  string;     // default: '#'
  buttonText?:  string;     // default: 'Subscribe'
  placeholder?: string;     // default: 'you@company.com'
  variant?:     'default' | 'filled';
}
```

**Usage:**

```astro
---
import Newsletter from '@astro-fleet/shared-ui/src/components/Newsletter.astro';
---
<Newsletter
  heading="Get product updates"
  description="Engineering insights, no spam, unsubscribe anytime."
  formAction="https://buttondown.email/api/emails/embed-subscribe/yourname"
  buttonText="Subscribe"
  variant="filled"
/>
```

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--cta-radius`, `--font-body`

---

### PricingTable

Responsive row of pricing tier cards. Supports highlighting a recommended plan, feature lists with checkmarks, and badge labels.

```ts
export interface PricingFeature {
  text:     string;
  included: boolean;
}

export interface PricingTier {
  name:         string;
  price:        string;
  period?:      string;       // e.g. 'mo', 'year'
  description?: string;
  features:     PricingFeature[];
  ctaText?:     string;       // default: 'Get started'
  ctaHref?:     string;
  highlighted?: boolean;
  badge?:       string;       // e.g. 'Most popular'
}

export interface Props {
  tiers:        PricingTier[];
  heading?:     string;       // default: 'Simple, transparent pricing'
  description?: string;
}
```

**Usage:**

```astro
---
import PricingTable from '@astro-fleet/shared-ui/src/components/PricingTable.astro';
---
<PricingTable
  heading="Choose your plan"
  tiers={[
    {
      name: 'Starter',
      price: '$0',
      period: 'mo',
      features: [
        { text: '3 sites', included: true },
        { text: 'Community support', included: true },
        { text: 'Custom domain', included: false },
      ],
      ctaHref: '/signup',
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'mo',
      badge: 'Most popular',
      highlighted: true,
      features: [
        { text: 'Unlimited sites', included: true },
        { text: 'Priority support', included: true },
        { text: 'Custom domain', included: true },
      ],
      ctaHref: '/signup',
    },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`

---

### SectionDivider

Decorative SVG wave/curve between page sections. Six shape presets: wave, curve, angle, zigzag, rounded, and arrow. Flip vertically to use as a section footer.

```ts
export interface Props {
  shape?:  'wave' | 'curve' | 'angle' | 'zigzag' | 'rounded' | 'arrow';  // default: 'wave'
  flip?:   boolean;   // flip vertically; default: false
  fill?:   string;    // fill colour; default: 'var(--color-background, #ffffff)'
  height?: number;    // pixels; default: 64
}
```

**Usage:**

```astro
---
import SectionDivider from '@astro-fleet/shared-ui/src/components/SectionDivider.astro';
---
<!-- Place between two sections -->
<section style="background: #0f172a;">
  <!-- dark section content -->
</section>
<SectionDivider shape="wave" fill="#0f172a" />
<section>
  <!-- light section content -->
</section>
```

**CSS variables consumed:** `--color-background` (as default fill)

---

### StatsBar

Horizontal strip of key metrics or numbers. Commonly placed below the hero or above a CTA to build credibility. Supports dark and light variants.

```ts
export interface StatItem {
  value: string;
  label: string;
  unit?: string;
}

export interface Props {
  items: StatItem[];
  dark?: boolean;      // default: true
}
```

**Usage:**

```astro
---
import StatsBar from '@astro-fleet/shared-ui/src/components/StatsBar.astro';
---
<StatsBar
  items={[
    { value: '10K+', label: 'Active users' },
    { value: '99.9', unit: '%', label: 'Uptime SLA' },
    { value: '< 50', unit: 'ms', label: 'Avg response time' },
    { value: '24/7', label: 'Support coverage' },
  ]}
  dark={true}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-background`, `--color-text-muted`, `--font-heading`

---

### TeamGrid

Responsive grid of team member cards with photo placeholder fallback, role, bio, and social links. Supports 2, 3, or 4 column layouts.

```ts
export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'github' | 'website';
  url:      string;
}

export interface TeamMember {
  name:     string;
  role:     string;
  bio?:     string;
  image?:   string;
  socials?: SocialLink[];
}

export interface Props {
  members:      TeamMember[];
  heading?:     string;           // default: 'Our Team'
  description?: string;
  columns?:     2 | 3 | 4;       // default: 3
}
```

**Usage:**

```astro
---
import TeamGrid from '@astro-fleet/shared-ui/src/components/TeamGrid.astro';
---
<TeamGrid
  heading="Meet the Team"
  columns={3}
  members={[
    {
      name: 'Jane Smith',
      role: 'CEO & Co-founder',
      bio: 'Previously VP Engineering at Globex.',
      socials: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/janesmith' },
        { platform: 'twitter', url: 'https://twitter.com/janesmith' },
      ],
    },
    {
      name: 'Alex Chen',
      role: 'Head of Design',
      socials: [
        { platform: 'github', url: 'https://github.com/alexchen' },
      ],
    },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-text-muted`, `--font-heading`

---

### Timeline

Vertical timeline for company history, milestones, or changelogs. Alternates left/right on desktop, stacks vertically on mobile. Supports optional badges.

```ts
export interface TimelineEvent {
  date:        string;
  title:       string;
  description: string;
  badge?:      string;
}

export interface Props {
  events:       TimelineEvent[];
  heading?:     string;
  description?: string;
}
```

**Usage:**

```astro
---
import Timeline from '@astro-fleet/shared-ui/src/components/Timeline.astro';
---
<Timeline
  heading="Our Journey"
  events={[
    {
      date: '2024',
      title: 'Open-source launch',
      description: 'Released Astro Fleet on GitHub with three design presets.',
      badge: 'v1.0',
    },
    {
      date: '2023',
      title: 'First production site',
      description: 'Deployed the framework for our first client project.',
    },
  ]}
/>
```

**CSS variables consumed:** `--color-accent`, `--color-primary`, `--color-background`, `--font-heading`

---

## Layouts

### BaseLayout

Full-page shell. Composes `SEOHead`, `Header`, `<main>`, and `Footer`. Applies CSS custom properties from `designTokens` to `:root`. Includes a global CSS reset and utility classes (`.container`, `.section`, `.section-header`).

**Key props (abridged — includes all SEOHead + Header + Footer props):**

```ts
export interface Props {
  title:          string;         // page <title>
  description:    string;         // meta description
  keywords?:      string[];
  structuredData?: Record<string, unknown>;
  canonicalUrl?:  string;
  ogImage?:       string;
  navigation:     MenuItem[];
  footerColumns:  FooterColumn[];
  contactInfo?:   ContactInfo;
  socialLinks?:   SocialLink[];
  siteName:       string;
  designTokens?:  DesignTokens;   // injects CSS vars into :root
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
import { SITE_NAME, navigation, footerColumns } from '../lib/site-config';
import { CORPORATE } from '@astro-fleet/config';
---
<BaseLayout
  title="Home"
  description="Welcome to Acme Corp."
  siteName={SITE_NAME}
  navigation={navigation}
  footerColumns={footerColumns}
  designTokens={CORPORATE}
>
  <h1>Hello world</h1>
</BaseLayout>
```

---

### IndustryLayout

Extends `BaseLayout`. Adds breadcrumb navigation, named slots for hero/products/case-studies/testimonials/services sections, and an automatic `CTABlock` at the bottom.

**Additional props (on top of BaseLayout):**

```ts
export interface Props extends BaseLayoutProps {
  breadcrumbs?:        BreadcrumbItem[];
  industryName?:       string;
  showCTA?:            boolean;                      // default: true
  ctaHeading?:         string;
  ctaDescription?:     string;
  ctaPrimaryButton?:   { text: string; href: string };
  ctaSecondaryButton?: { text: string; href: string };
}
```

**Named slots:** `head`, `hero`, `products`, `case-studies`, `testimonials`, `services`, `footer-scripts`

---

### ProductLayout

Extends `BaseLayout`. Adds breadcrumb navigation, named slots for hero/sidebar/related sections, and an automatic `CTABlock` at the bottom.

**Additional props (on top of BaseLayout):**

```ts
export interface Props extends BaseLayoutProps {
  breadcrumbs?:        BreadcrumbItem[];
  category?:           string;
  showCTA?:            boolean;                      // default: true
  ctaHeading?:         string;                       // default: 'Need a Custom Solution?'
  ctaDescription?:     string;
  ctaPrimaryButton?:   { text: string; href: string };
  ctaSecondaryButton?: { text: string; href: string };
}
```

**Named slots:** `head`, `hero`, `sidebar`, `related`, `footer-scripts`
