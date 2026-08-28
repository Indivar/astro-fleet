# Astro Fleet

[![CI](https://github.com/Indivar/astro-fleet/actions/workflows/ci.yml/badge.svg)](https://github.com/Indivar/astro-fleet/actions/workflows/ci.yml) [![GitHub release](https://img.shields.io/github/v/release/Indivar/astro-fleet)](https://github.com/Indivar/astro-fleet/releases) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**One codebase, many sites.** A multi-site Astro monorepo for agencies and
multi-brand companies.

Shared components, per-site design tokens, Turborepo builds, and independent
deployment to Cloudflare Pages, Vercel or your own VPS. Create a site in one
command, brand it with a preset, ship it on its own domain.

Site-wide search, consent-gated analytics and full SEO are built in and **off by
default** — each is one instruction away. Responsive images are on: write a
plain `<img>`, ship `<picture>` with AVIF and WebP.

**Built for AI-driven development.** The structure, typed props and single-file
site config exist so an AI assistant can work in this repo without guessing.
Tested extensively with [Claude Code](https://claude.ai/claude-code); works with
Gemini CLI and others.

---

## Get started

### With Claude Code

The fastest path from nothing to a live site:

```bash
git clone https://github.com/Indivar/astro-fleet.git
cd astro-fleet
bun install
claude
```

Then say what you want:

> Build me a site for acme.com. We fabricate structural steel for commercial
> builders in Auckland. The buyer is a project manager comparing fabricators on
> lead time and certification. I want them to request a quote.

Claude reads [`CLAUDE.md`](CLAUDE.md) automatically and follows the whole
process: scaffold, design, content, SEO, deploy.
**[Build a site with Claude →](docs/build-a-site-with-claude.md)** is the
human-readable walkthrough, with the exact sentences to type at each step.

### With the CLI

```bash
bunx create-astro-fleet         # or: npm create astro-fleet
cd my-astro-fleet
bun install
bun run dev
```

Prompts for a target directory, first-site domain and design preset. Use
`--domain` and `--preset` to skip them.

### By hand

```bash
git clone https://github.com/Indivar/astro-fleet.git
cd astro-fleet
bun install
bun run dev          # starter site at localhost:4321
```

**Requires** Bun 1.1+ and Node 20+. A Cloudflare account is needed only to
deploy, and it is free. Python 3 with Pillow is the one extra, and only on the
machine that adds photos: it writes the image renditions that get committed.
The build needs nothing beyond Bun.

---

## Everyday commands

```bash
# Develop
bun run dev                                    # every site (4321)
bun run dev --filter=acme.com                  # one site
bun run dev --filter=acme.com -- --port 4322   # a second alongside

# Build
bun run build                                  # all, in parallel
bun run build --filter=acme.com                # one

# Typecheck and lint
bun run lint

# Add a site
bunx create-astro-fleet add acme.com saas      # or:
./scripts/new-site.sh acme.com saas
bun install                                     # always, after adding

# Deploy
npx wrangler pages deploy sites/acme.com/dist \
  --project-name=acme-com --branch=main

# Images (Python 3 + Pillow, once per new photo; renditions are committed)
python3 scripts/responsive-images.py acme.com         # AVIF + WebP at 4 widths
python3 scripts/localize-stock-images.py acme.com     # bring Unsplash/Pexels hotlinks in-house
python3 scripts/responsive-images.py --check          # no large image without srcset
python3 scripts/image-weight.py                       # bytes per page, before vs after

# One canonical host per zone (apex -> www or the reverse)
python3 scripts/cf-canonical-redirects.py --check

# Self-hosted infrastructure
./scripts/setup-infra.sh acme.com,other.com
```

| Script | Does |
|---|---|
| `scripts/new-site.sh` | Copies the starter into `sites/<domain>` and applies a preset |
| `scripts/setup-infra.sh` | Generates the Caddyfile and `.env` for the self-hosted stack |
| `scripts/responsive-images.py` | Writes AVIF and WebP renditions plus a manifest into `public/images/_r/`; `--check` fails the build on a large image without `srcset` |
| `scripts/localize-stock-images.py` | Downloads hotlinked Unsplash and Pexels photos, writes WebP, rewrites the URLs; `--check` fails on any remaining hotlink |
| `scripts/image-weight.py` | Per-page image bytes at 375 and 1440 px, from the built HTML |
| `scripts/cf-canonical-redirects.py` | One 301 rule per Cloudflare zone from `infrastructure/zones.json`; `--check` verifies with HEAD requests |
| `packages/shared-ui/scripts/search-index.mjs` | Builds the search index from the HTML that shipped |

---

## Turning features on

Everything is opt-in. Full detail in
[`CLAUDE.md`](CLAUDE.md) §6 and the [components reference](docs/components.md).

### Site search

Add the index generator to the site's build, then switch it on:

```jsonc
// package.json
"build": "astro build && node ../../packages/shared-ui/scripts/search-index.mjs"
```

```astro
<BaseLayout search searchPlaceholder="Pricing, integrations, security" ...>
```

Built from the HTML that actually shipped, fetched on first use and never on
load, about 1.8 KB gzipped per page. `/` or Cmd-K opens it. No search service,
no server, no subscription.

### Analytics, behind consent

```astro
<BaseLayout gaId="G-XXXXXXXXXX" privacyHref="/privacy/" ...>
```

That is the whole integration. **Nothing is requested from Google until the
visitor accepts** — stricter than the usual Consent Mode v2 pattern, which
loads the script immediately with tracking denied. Global Privacy Control is
read as a decline. `requireConsent={false}` restores standard behaviour.

Your numbers will be lower than a site that tags everyone. They will also match
what your privacy page says.

### SEO

Automatic once `site` is set in `astro.config.mjs`: per-page titles and
descriptions, canonicals, Open Graph, Twitter cards, JSON-LD, sitemap.
[SEO Recipes](docs/seo-recipes.md) covers the rest — per-page OG images,
git-based `lastmod`, `llms.txt` for answer engines, IndexNow, fuzzy 404
redirects, one canonical host, a CSP that does not break the form, and
build-time validation.

### Responsive images

On by default. Drop a photo in `public/images/`, run
`python3 scripts/responsive-images.py <site>` once, commit the renditions.
Every `<img>` in the built HTML that has them becomes `<picture>` with AVIF
and WebP `srcset`, `width`/`height` and lazy loading. Nothing is generated at
build time and nothing is resized on request. [Images](docs/images.md) has the
per-image controls and the two checks.

---

## What's included

- **24 shared components + 3 layouts** — header, footer, SEO head, CTA blocks,
  cards, forms, testimonials, breadcrumbs, pricing tables, FAQ accordions, team
  grids, timelines, hero sliders, section dividers, comparison tables, search
  and analytics. Typed props, CSS-variable theming, zero JS unless a component
  needs it.
- **Design token system** — three presets (Corporate, SaaS, Warm) behind a
  TypeScript interface. Change colours and fonts per site without touching
  component code.
- **Site scaffolder** — `bunx create-astro-fleet` or `./scripts/new-site.sh`,
  wiring config, styles and the build pipeline.
- **Search and analytics**, as above.
- **Responsive images, pre-generated** — AVIF and WebP at four widths, written
  once by a script and committed; the build rewrites `<img>` to `<picture>`.
  Two checks fail on a large image without `srcset` or a stock-photo hotlink.
- **Security headers with an enforced CSP** in the starter's `_headers`, with
  the placeholders for the form endpoint and analytics marked, and a script
  that gives each zone one canonical host.
- **Hardened contact form** — honeypot, success and error states, and a
  documented submit handler that counts the lead only after the endpoint said
  yes.
- **CMS-ready** — the Meridian demo ships with [Keystatic](https://keystatic.com);
  admin at `/keystatic` in dev, content committed as markdown.
  [Adding a CMS](docs/adding-a-cms.md) covers the pattern and the alternatives.
- **Self-hosted fonts** — the Astro Fonts API downloads at build time and serves
  from your domain. No runtime third-party requests.
- **Framework-agnostic** — native `.astro` files throughout. Add React, Vue,
  Svelte, Solid or Preact to any site via Astro's
  [Islands Architecture](https://docs.astro.build/en/concepts/islands/).
- **Infrastructure templates** — optional Docker Compose + Traefik + Caddy for
  self-hosting.
- **An AI operating manual** — [`CLAUDE.md`](CLAUDE.md) carries the whole path
  from prerequisites to DNS, including nine failure modes that ship silently in
  real projects.

---

## Live demos

Three fully-built sites. Same monorepo, same shared components, three
genuinely different looks — the presets are complete site personalities, not
colour swaps.

| Preset | Demo | Use case | Live |
|---|---|---|---|
| **Corporate** | [Meridian Advisory](sites/meridian-advisory.com) | Management consulting firm | [astro-fleet-meridian.pages.dev](https://astro-fleet-meridian.pages.dev) |
| **SaaS** | [Flux Analytics](sites/flux-analytics.com) | Developer-tool product site | [astro-fleet-flux.pages.dev](https://astro-fleet-flux.pages.dev) |
| **Warm** | [Olive & Vine](sites/olive-and-vine.com) | Neighbourhood restaurant | [astro-fleet-olive.pages.dev](https://astro-fleet-olive.pages.dev) |

<table>
  <tr>
    <td align="center"><strong>Corporate → Meridian Advisory</strong></td>
    <td align="center"><strong>SaaS → Flux Analytics</strong></td>
    <td align="center"><strong>Warm → Olive & Vine</strong></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/meridian-home.png" alt="Meridian Advisory home page — corporate consulting firm with editorial hero, dark stat strip, and navy/blue palette" /></td>
    <td><img src="docs/screenshots/flux-home.png" alt="Flux Analytics home page — SaaS product with dark hero, code mockup, and emerald accents" /></td>
    <td><img src="docs/screenshots/olive-home.png" alt="Olive & Vine home page — restaurant with warm editorial hero, serif display type, and amber accents" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/meridian-services.png" alt="Meridian Advisory expertise page — numbered practice areas in editorial layout" /></td>
    <td><img src="docs/screenshots/flux-services.png" alt="Flux Analytics product page — dark six-card feature grid with icons and tags" /></td>
    <td><img src="docs/screenshots/olive-services.png" alt="Olive & Vine menu page — dotted-line typography grouped by course" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/meridian-contact.png" alt="Meridian Advisory contact page — briefing request form with global office grid" /></td>
    <td><img src="docs/screenshots/flux-contact.png" alt="Flux Analytics book-a-demo page — split layout with benefits list and form" /></td>
    <td><img src="docs/screenshots/olive-contact.png" alt="Olive & Vine reservations page — address, hours, and reservation form" /></td>
  </tr>
</table>

Each composes the **same shared components**. The navigation, section structure,
hero layouts and typography are unique to each brand.

---

## Built with Astro Fleet

Eight sites in production on this codebase, across eight industries, plus one
landing page that shares a domain with the site above it and looks nothing like
it. Same components, same tokens, same build.

<table>
<tr valign="top">
<td width="45%"><a href="https://www.edubold.com"><img src="docs/screenshots/production/edubold.jpg" alt="EduBold home page — an editorial serif headline on pale green, with a hairline-ruled register of the day's figures below it" /></a></td>
<td>

### [edubold.com](https://www.edubold.com)

**School management ERP for Indian schools and trusts.** Admissions, fees,
attendance, payroll and double-entry accounts on one set of records.

Set as a ledger, because that is what every Indian school already runs on:
hairline rules, a section index down the left margin, and red reserved for
totals and corrections. The homepage opens with the questions a principal asks
at 8am, each facing its answer.

Site search, consent-gated GA4, and a blog with pagination and archives. 46
pages.

</td>
</tr>

<tr valign="top">
<td><a href="https://edubold.com/a-school-day/"><img src="docs/screenshots/production/aschoolday.jpg" alt="A School Day landing page — dark navy starfield, a live clock and timeline down the left margin, sans-serif display headline" /></a></td>
<td>

### [edubold.com/a-school-day/](https://edubold.com/a-school-day/)

**The same site, and nothing like it.** A long-form landing page that walks
through one school day from first bell to last, on the same domain as the page
above.

Dark navy against pale green. A live clock and timeline down the margin instead
of a section index. Sans-serif display type instead of the serif. Scroll-driven
scenes — a timetable that solves itself, a receipt posting to its journal
entry — instead of a static register.

Here because it makes the point better than any argument: **the codebase does
not impose a look.** Nothing in the shared layer had to be fought to build it.

</td>
</tr>

<tr valign="top">
<td><a href="https://www.moiengineering.com"><img src="docs/screenshots/production/moi.jpg" alt="MOI Engineering home page — condensed uppercase headline on navy, with an orange technical drawing of meshing involute gears" /></a></td>
<td>

### [moiengineering.com](https://www.moiengineering.com)

**Packaging and wrapping machinery, built since 1960.** Cigarette making and
packing lines, capsule machines for pharma, and high-speed wrapping, bundling
and cartoning systems, shipped to manufacturers in 20+ countries.

Drawn as an engineering document: drawing numbers, revision marks, a technical
grid, and a hero of true involute gears meshing in WebGL. The catalogue runs to
28 machines, each with a real specification sheet behind it.

The largest site here at 77 pages.

</td>
</tr>

<tr valign="top">
<td><a href="https://www.hybridagrobots.com"><img src="docs/screenshots/production/hybrid.jpg" alt="Hybrid Agrobots home page — dark hero with a live egg-sorting conveyor scene in lime and black" /></a></td>
<td>

### [hybridagrobots.com](https://www.hybridagrobots.com)

**Computer-vision grading and sorting machines** for eggs, apples, fruit and
vegetables, sorting by size, weight, colour and grade.

The hero is the product: a live sorting line rendered in WebGL, eggs moving
under a vision head that grades and rejects them as you watch. Eleven machines,
each with its own bespoke scene, lazily loaded and replaced by a still on
mobile so the phone budget survives.

</td>
</tr>

<tr valign="top">
<td><a href="https://boldreach.io"><img src="docs/screenshots/production/boldreach.jpg" alt="BoldReach home page — large centred headline in black on white, above a product screenshot of the CRM risk dashboard" /></a></td>
<td>

### [boldreach.io](https://boldreach.io)

**A field-sales CRM that fills itself in.** Voice notes become contacts and
deals, the pipeline nudges reps on WhatsApp, and deals about to slip get flagged
before anyone has to ask.

The biggest build here: **512 pages**, generated across five regional variants
so pricing, currency and compliance copy match the reader's market without five
separate sites.

</td>
</tr>

<tr valign="top">
<td><a href="https://www.indivar.com"><img src="docs/screenshots/production/indivar.jpg" alt="Indivar home page — independent technology consulting" /></a></td>
<td>

### [indivar.com](https://www.indivar.com)

**Independent technology consulting**: architecture, cloud and delivery, for
organisations that have already been sold a platform and now need someone
without a stake in it.

95 pages including a migrated blog, service and product catalogues, and case
studies. Built to read as a consultancy rather than a vendor, which is the whole
positioning.

</td>
</tr>

<tr valign="top">
<td><a href="https://www.stakteck.com"><img src="docs/screenshots/production/stakteck.jpg" alt="StakTeck home page — IT staffing and recruitment across India" /></a></td>
<td>

### [stakteck.com](https://www.stakteck.com)

**IT staffing, contract hiring and staff augmentation across India.** Job
listings, a talent-pipeline view, and industry expertise grids.

58 pages. The clearest example of the design-token system doing its job: a
recruitment brand sharing every component with an industrial machinery site and
looking nothing like it.

</td>
</tr>

<tr valign="top">
<td><a href="https://www.vairi.com"><img src="docs/screenshots/production/vairi.jpg" alt="Vairi Technologies home page — AI-enhanced software and automation, Auckland" /></a></td>
<td>

### [vairi.com](https://www.vairi.com)

**AI-enhanced software development, business automation, and AI-driven SEO and
marketing.** Auckland, New Zealand.

The only site here outside India, and the one that most exercises the
token system's typography settings. Service pillars, a pricing table, process
steps and an assessment form.

</td>
</tr>

<tr valign="top">
<td><a href="https://www.claspt.app"><img src="docs/screenshots/production/claspt.jpg" alt="Claspt home page — encrypted markdown notes and password vault" /></a></td>
<td>

### [claspt.app](https://www.claspt.app)

**Encrypted markdown notes and a password vault**, on the Microsoft Store, macOS
and Linux.

A product site rather than a company one: download paths per platform, a
documentation tree, and a blog. The only entry here that was already running
GA4 before this repo grew an analytics component.

</td>
</tr>
</table>

Every URL was requested and returned 200 on 23 August 2026. The consent bar
along the bottom of each shot is the [analytics component](#analytics-behind-consent)
behaving correctly on a first visit — at that moment nothing has been requested
from Google.

If you ship a site with Astro Fleet, open a PR adding it here.

---

## Documentation

**Start here**

- [Build a site with Claude](docs/build-a-site-with-claude.md) — clone to live domain, step by step
- [Getting Started](docs/getting-started.md) — clone to first deploy in 15 minutes
- [`CLAUDE.md`](CLAUDE.md) — the operating manual Claude reads. Worth reading yourself

**Building**

- [Adding a Site](docs/adding-a-site.md) — create and configure additional sites
- [Components Reference](docs/components.md) — props, examples and CSS variables for all 24
- [Design Tokens](docs/design-tokens.md) — presets and custom palettes
- [Framework Integrations](docs/framework-integrations.md) — React, Vue, Svelte, islands, view transitions
- [Adding a CMS](docs/adding-a-cms.md) — the Keystatic pattern, and when to pick something else

**Shipping**

- [SEO Recipes](docs/seo-recipes.md) — OG images, `llms.txt`, IndexNow, canonical host, CSP, validation
- [Images](docs/images.md) — pre-generated renditions, stock-photo localisation, the checks
- [Deployment](docs/deployment.md) — Cloudflare Pages, Vercel, Netlify, self-hosted, security headers
- [AI Workflow](docs/ai-workflow.md) — prompts, tool setup, AI-driven patterns
- [Changelog](CHANGELOG.md) — what changed, and when

---

## Stack

Astro 6 · Bun · Turborepo 2 · Tailwind CSS 4 · TypeScript · static-first, zero JS
by default · works with React, Vue, Svelte, Solid and Preact

## License

MIT. Use it for anything. See [LICENSE](LICENSE).

## Credits

Built by [Indivar Software Solutions](https://indivar.com), a software company
in India and New Zealand. We use Astro Fleet to run our own portfolio of company
websites — the seven listed above.
