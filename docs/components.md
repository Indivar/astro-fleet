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
