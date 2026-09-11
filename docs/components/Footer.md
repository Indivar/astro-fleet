# Footer

> The bottom of every page: link columns, contact details, social icons and the copyright line.

**Use it for:** Every page. It is set once in your site config and appears everywhere.

**Reach for something else if** never; but keep it short. A footer with sixty links is a sitemap, not navigation.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import Footer from '@astro-fleet/shared-ui/src/components/Footer.astro';
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
| `columns` | Groups of links, each with a `title` and `links`. | yes | — |
| `siteName` | Your company name, used in the copyright line. | yes | — |
| `contactInfo` | Address, phone and email. | no | none |
| `socialLinks` | Social profiles. Only add the ones you actually post on. | no | none |
| `year` | The copyright year. | no | this year |
| `tagline` | One line under the site name. | no | none |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Linking social accounts that have been empty for two years. It reads as abandoned.
- A phone number in the footer that nobody answers. Leave it out rather than have it ring unanswered.
- Hard-coding the year, then forgetting it in January. Leave `year` alone and it stays right.

---

## Full reference

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

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
