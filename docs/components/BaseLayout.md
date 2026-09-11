# BaseLayout

A layout wraps a whole page: it supplies the `<head>`, the header, the footer and the page shell, so your page file only holds its own content.

---

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

---

[← All components](./README.md) · [Getting started](../getting-started.md)
