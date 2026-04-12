# Getting Started

Get Astro Fleet running locally in under five minutes.

## Prerequisites

- **[Bun](https://bun.sh)** — install with `curl -fsSL https://bun.sh/install | bash`
- **Git**
- **Node.js 18+** (Bun bundles its own Node-compatible runtime, but some Astro tooling needs it)

## 1. Clone the repository

```bash
git clone https://github.com/indivar/astro-fleet.git
cd astro-fleet
```

## 2. Install dependencies

```bash
bun install
```

This installs dependencies for all workspaces: the root, `packages/config`, `packages/shared-ui`, and `sites/starter`.

## 3. Start the dev server

```bash
bun run dev
```

The starter site is now running at **http://localhost:4321**.

Open it in your browser. You should see the five-page starter site with the default CORPORATE preset (navy/blue).

## 4. Create your first site

Run the scaffolding script with your domain and a preset:

```bash
./scripts/new-site.sh yourdomain.com saas
```

Available presets: `corporate`, `saas`, `warm`

The script copies the starter template into `sites/yourdomain.com/`, updates the package name, sets the site URL, and writes the correct CSS variables for the chosen preset.

## 5. Edit your site config

Open the generated config file:

```
sites/yourdomain.com/src/lib/site-config.ts
```

This is the single file that controls your site's identity, navigation, footer columns, contact details, and social links. Change `SITE_NAME`, `TAGLINE`, navigation items, and footer columns. Everything propagates to all shared components automatically.

See [adding-a-site.md](./adding-a-site.md) for a full field-by-field reference.

## 6. Install new site dependencies and start its dev server

After creating a new site, re-run install so Bun registers the new workspace package:

```bash
bun install
bun run dev --filter=yourdomain.com
```

The new site starts at **http://localhost:4321**.

If you want to run the starter and your new site at the same time, pass a different port:

```bash
bun run dev --filter=yourdomain.com -- --port 4322
```

## 7. Edit pages and content

Pages live at `sites/yourdomain.com/src/pages/`. The starter includes:

| File | Route |
|------|-------|
| `index.astro` | `/` |
| `about.astro` | `/about/` |
| `services.astro` | `/services/` |
| `contact.astro` | `/contact/` |
| `404.astro` | 404 error page |

Each page imports from `site-config.ts` and passes props to `BaseLayout`. Edit the page content directly in `.astro` files.

## 8. Build for production

```bash
bun run build --filter=yourdomain.com
```

The static output lands in `sites/yourdomain.com/dist/`. This is the directory you deploy.

To build all sites at once:

```bash
bun run build
```

## 9. Deploy

See [deployment.md](./deployment.md) for step-by-step guides covering:

- **Cloudflare Pages** (recommended — free, global CDN, zero config)
- **Vercel / Netlify**
- **Self-hosted** with Traefik + Caddy on a VPS

---

**That's it.** The full cycle is: clone → install → create site → edit config → dev → build → deploy.
