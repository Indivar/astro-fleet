# AI Workflow

## Philosophy

Astro Fleet is designed to be developed with AI coding assistants as first-class collaborators.

The project structure was deliberately shaped for AI legibility:

- **One config file per site** (`site-config.ts`) — an AI tool can read a single file and understand the entire site's identity, navigation, and footer in seconds.
- **Typed Props interfaces on every component** — AI tools can inspect what a component accepts without running the code or reading its entire implementation.
- **Self-contained components** — each `.astro` file in `packages/shared-ui/` owns its own scoped CSS and exposes a clean Props interface. There are no hidden globals to discover.
- **Consistent naming and file layout** — `sites/<domain>/src/pages/`, `src/lib/site-config.ts`, `src/styles/global.css`. Every site has the same shape, so an AI that has seen one site can navigate any other.
- **Static-first output** — no runtime server state to reason about. What you build is what gets deployed.

The result is that AI tools can make accurate, targeted changes — adding a page, creating a component, updating branding — without hallucinating file paths or misreading data flow.

---

## Recommended tools

**Claude Code** is the primary recommended tool. It is tested extensively with this monorepo. It runs in the terminal (`claude`) and as an IDE extension. It can read files, run build commands, edit components, and reason about multi-site changes in a single session.

**Gemini CLI** also works well with the monorepo structure. The flat, explicit file layout means Gemini can orient itself quickly without needing deep context injection.

Any AI coding tool that can read local files and run shell commands will work. The structured layout does the heavy lifting.

---

## CLAUDE.md integration

Claude Code reads a `CLAUDE.md` file at the project root and treats it as persistent project context — available in every session without re-prompting.

Create `/astro-fleet/CLAUDE.md` and include:

```markdown
# Astro Fleet

Multi-site Astro monorepo. Each site lives in `sites/<domain>/`.

## Key conventions
- Site config: `sites/<domain>/src/lib/site-config.ts`
- Shared components: `packages/shared-ui/src/components/`
- Shared layouts: `packages/shared-ui/src/layouts/`
- Design tokens: `packages/config/src/tokens.ts`

## Commands
- Dev (single site): `bun run dev --filter=<domain>`
- Build (single site): `bun run build --filter=<domain>`
- Build all: `bun run build`
- New site: `./scripts/new-site.sh <domain> [corporate|saas|warm]`

## Deployment
- Cloudflare Pages: `wrangler pages deploy sites/<domain>/dist --project-name=<name> --branch=main`
- Self-hosted: `./scripts/setup-infra.sh domain1.com,domain2.com` then `docker compose up -d`
```

With this file in place, Claude Code knows the monorepo layout, component conventions, and deploy commands from the first message of every session.

---

## Sample prompts

Copy these directly into Claude Code or any AI coding tool. Replace `acme.com` with your actual site domain.

**Create a new site:**
```
Create a new site for acme.com with a SaaS dark theme. Run the scaffolding script, then update site-config.ts with the site name "Acme", tagline "Ship faster", and navigation items: Home, Features, Pricing, Contact.
```

**Add a pricing page:**
```
Add a pricing page to sites/acme.com at /pricing/ with three tiers: Starter at $9/mo (5 projects, 1 user), Pro at $29/mo (unlimited projects, 5 users), Enterprise at custom pricing. Use the existing BaseLayout and match the style of the services page.
```

**Create a new shared component:**
```
Create a new TeamGrid component in packages/shared-ui/src/components/ that displays team member cards in a responsive grid. Each card should show a photo, name, role, and LinkedIn link. Use a typed Props interface and CSS custom properties for theming. Follow the same conventions as ServiceCard.astro.
```

**Redesign a section:**
```
Redesign the hero section on sites/acme.com/src/pages/index.astro to use a split layout — headline and CTA on the left, a product screenshot on the right. Keep using the existing BaseLayout and site-config imports.
```

**Add a blog section:**
```
Add a blog section to sites/acme.com with 3 seed articles about cloud computing. Create the pages at /blog/, /blog/what-is-cloud-computing/, and /blog/cloud-cost-optimization/. Add a Blog link to the navigation in site-config.ts.
```

**Start the dev server:**
```
Run the dev server for sites/acme.com so I can preview changes. Tell me the URL when it's ready.
```

**Build and deploy to staging:**
```
Build sites/acme.com and deploy it to Cloudflare Pages staging using wrangler. The project name is acme-com.
```

**Change the color scheme:**
```
Change the color scheme of sites/acme.com from corporate blue to emerald green. Update global.css and the design tokens so that --color-accent and --color-cta use emerald (#10b981 and #059669 respectively). Rebuild and confirm no build errors.
```

**Add JSON-LD structured data:**
```
Add Organization JSON-LD structured data to the homepage of sites/acme.com. Include name, url, logo, and sameAs fields for Twitter and LinkedIn. Pass it through the structuredData prop on BaseLayout.
```

**Create a cross-site comparison table component:**
```
Create a ComparisonTable component in packages/shared-ui/src/components/ that accepts a typed Props interface with column headers and rows of feature/value pairs. Make it usable across all sites. Add it to the pricing page on sites/acme.com as an example.
```

**Add a dark mode toggle:**
```
Add a dark mode toggle to the shared Header component in packages/shared-ui/src/components/Header.astro. Use a CSS class on <html> to switch modes and persist the preference in localStorage. Keep the toggle accessible with a proper aria-label.
```

**Audit all sites:**
```
Show me which sites currently exist under the sites/ directory, their package names from package.json, and whether a dist/ folder exists (indicating a recent build).
```

---

## How to work on a specific site

Start the dev server for one site:

```bash
bun run dev --filter=acme.com
```

Run two sites simultaneously on different ports:

```bash
# Terminal 1
bun run dev --filter=acme.com -- --port 4321

# Terminal 2
bun run dev --filter=shop.acme.com -- --port 4322
```

Build one site:

```bash
bun run build --filter=acme.com
```

Build everything (Turborepo runs builds in parallel and caches results):

```bash
bun run build
```

---

## Creating new shared components with AI

When you want a component available across all sites, it belongs in `packages/shared-ui/src/components/`. Tell the AI:

> "Create a `<ComponentName>` component in `packages/shared-ui/src/components/`. It should have a typed Props interface at the top of the frontmatter. Use CSS custom properties (`--color-primary`, `--color-accent`, `--font-heading`, `--font-body`) for all colors and typography — no hardcoded hex values. No hardcoded content — everything should come through props or slots."

Then add it to a page:

> "Add the new `<ComponentName>` component to the services page on sites/acme.com with the following props: ..."

Astro resolves the workspace import automatically via the `@astro-fleet/shared-ui` alias. You do not need to configure anything.

**Conventions all shared components follow:**

- Typed `Props` interface exported from the component frontmatter
- Scoped `<style>` block inside the component file (no external CSS files)
- CSS custom properties for every color and font value — components are preset-agnostic
- No hardcoded content — all text, links, and data come from props or named slots
- `loading="lazy"` on all images
- `aria-*` attributes on interactive elements

---

## Available libraries

**Built into the stack:**

| Library | Version | Use |
|---------|---------|-----|
| Astro | latest | Static site generation, component islands, zero-JS by default |
| Tailwind CSS | 4 | Utility classes, `@theme` layer for CSS custom properties |

**No JavaScript framework is included by default.** Astro ships zero client-side JS unless you explicitly add a framework island (`client:load`, `client:idle`, etc.).

**Adding more libraries:**

Ask the AI directly:

```
Add Chart.js to sites/acme.com and create a dashboard page at /dashboard/ with a line chart showing monthly revenue for the past 6 months. Use Astro's client:load directive to hydrate the chart on the client.
```

```
Add @astrojs/react to sites/acme.com so I can use React components for the interactive pricing calculator.
```

```
Add the Swiper library to packages/shared-ui and create a LogoCarousel component that auto-scrolls client logos. Use client:idle so it only loads after the page is interactive.
```

Libraries added to a site's `package.json` stay scoped to that site. Libraries added to `packages/shared-ui/package.json` are available to all sites that import from it.
