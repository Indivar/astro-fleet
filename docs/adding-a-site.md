# Adding a Site

Everything you need to go from zero to a running site with its own branding.

## Run the scaffolding script

```bash
./scripts/new-site.sh <domain> [preset]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `domain` | Yes | The domain name — becomes the directory at `sites/<domain>/` |
| `preset` | No | `corporate` (default), `saas`, or `warm` |

**Examples:**

```bash
./scripts/new-site.sh acme.com              # corporate preset
./scripts/new-site.sh acme.com saas         # dark SaaS theme
./scripts/new-site.sh acme.com warm         # warm editorial theme
```

**What the script does:**

1. Copies `sites/starter/` into `sites/<domain>/`
2. Updates `astro.config.mjs` — sets `site` to `https://www.<domain>`
3. Updates `package.json` — sets `name` to `<domain>`
4. Updates `site-config.ts` — sets `SITE_NAME` from the domain prefix
5. Overwrites `src/styles/global.css` with the correct CSS variables for the chosen preset (corporate is the default, so it's already correct for that preset)

After running the script:

```bash
bun install                              # register the new workspace package
bun run dev --filter=acme.com           # start dev server for this site only
```

---

## The site-config.ts structure

`sites/<domain>/src/lib/site-config.ts` is the single source of truth for your site's identity and navigation. A change here propagates to every page via the shared layout components.

### Site identity

```ts
// Human-readable name used in <title>, header logo text, and footer.
export const SITE_NAME = 'Acme Corp';

// Short tagline displayed in the footer beneath the site name.
export const TAGLINE = 'We build great things';

// Path to the logo image rendered in the header.
// Set to undefined to show the SITE_NAME as text instead.
export const LOGO_SRC = '/logo.svg';
```

### Navigation

```ts
export const navigation: MenuItem[] = [
  { label: 'Home',     href: '/'          },
  { label: 'About',    href: '/about/'    },
  { label: 'Services', href: '/services/' },
  { label: 'Contact',  href: '/contact/'  },
];
```

Each `MenuItem` has:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | Yes | Link text shown in the nav |
| `href` | `string` | Yes | URL path |
| `children` | `MenuItem[]` | No | Nested items — renders as a hover dropdown |

Dropdown example:

```ts
{
  label: 'Products',
  href: '/products/',
  children: [
    { label: 'Widget A', href: '/products/widget-a/' },
    { label: 'Widget B', href: '/products/widget-b/' },
  ],
}
```

### Footer columns

```ts
export const footerColumns: FooterColumn[] = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about/' },
      { label: 'Contact',  href: '/contact/' },
    ],
  },
  // add up to 3–4 columns
];
```

Each `FooterColumn` has a `title` string and a `links` array of `{ label, href }` objects.

### Contact information

```ts
export const contactInfo: ContactInfo = {
  email:   'hello@acme.com',
  phone:   '+1 (555) 123-4567',
  address: '123 Main Street, Anytown',
};
```

All three fields are optional. Omit any you do not want displayed in the footer.

### Social links

```ts
export const socialLinks: SocialLink[] = [
  { platform: 'twitter',  url: 'https://twitter.com/acme' },
  { platform: 'linkedin', url: 'https://linkedin.com/company/acme' },
];
```

Supported `platform` values (built-in SVG icons): `linkedin`, `twitter`, `facebook`, `instagram`, `youtube`, `whatsapp`.

---

## Overriding a shared component locally

Shared components in `packages/shared-ui/src/components/` are used by all sites. If you need a one-off customisation for a single site, copy the component into the site's own component directory:

```bash
cp packages/shared-ui/src/components/Header.astro \
   sites/acme.com/src/components/Header.astro
```

Then update the import in the page or layout that uses it:

```ts
// Before (resolves to shared-ui)
import Header from '@astro-fleet/shared-ui/src/components/Header.astro';

// After (resolves to the local copy)
import Header from '../components/Header.astro';
```

Astro resolves imports at build time — the local file wins. Other sites are unaffected.

---

## Selective builds

Build only the site you are working on:

```bash
bun run build --filter=acme.com
```

Build all sites:

```bash
bun run build
```

Turborepo caches build outputs. If nothing has changed in a site or its dependencies, the cache is replayed and the build completes instantly.

---

## Running multiple dev servers

Each dev server needs its own port. Pass Astro's `--port` flag after `--`:

```bash
# Terminal 1
bun run dev --filter=acme.com -- --port 4321

# Terminal 2
bun run dev --filter=shop.acme.com -- --port 4322
```
