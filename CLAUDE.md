# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro Fleet is a multi-site Astro monorepo for agencies and multi-brand companies. Each site lives in `sites/<domain>/` and is independently deployable. Shared components and config live in `packages/`.

**Stack:** Astro 6, Bun, Turborepo 2, Tailwind CSS 4, TypeScript (strict mode). Static-first — zero client-side JS by default. Fonts are self-hosted via the Astro 6 Fonts API (configured in each site's `astro.config.mjs`, no third-party Google Fonts requests).

## Commands

```bash
# Development
bun run dev                                    # all sites (port 4321)
bun run dev --filter=<domain>                  # single site
bun run dev --filter=<domain> -- --port 4322   # custom port

# Build
bun run build                                  # all sites (parallel via Turborepo)
bun run build --filter=<domain>                # single site

# Lint
bun run lint

# Scaffold a new site
./scripts/new-site.sh <domain> [corporate|saas|warm]
bun install  # run after scaffolding

# Deploy (Cloudflare Pages)
wrangler pages deploy sites/<domain>/dist --project-name=<name> --branch=main

# Self-hosted infra
./scripts/setup-infra.sh domain1.com,domain2.com
```

## Architecture

### Monorepo layout

```
packages/config/       — DesignTokens interface + 3 presets (CORPORATE, SAAS, WARM)
packages/shared-ui/    — 22 shared components + 3 layouts (BaseLayout, IndustryLayout, ProductLayout)
sites/<domain>/        — individual sites, each with its own astro.config, package.json, and pages
scripts/               — new-site.sh (scaffolder), setup-infra.sh (Docker/Traefik)
infrastructure/        — Docker Compose + Traefik + Caddy templates
```

### Design token system

Tokens are defined as TypeScript objects (`packages/config/src/tokens.ts`) conforming to the `DesignTokens` interface. They get converted to CSS custom properties two ways:

1. **`tokensToCSSVars()`** in `packages/config/src/css.ts` — called by BaseLayout, injected into `:root` at build time
2. **`global.css` `@theme` layer** — each site duplicates token values for Tailwind CSS 4 integration

CSS variables: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-bg`, `--color-text`, `--color-cta`, `--font-heading`, `--font-body`, `--hero-layout`, `--cta-style`, `--spacing`

### Per-site configuration

Each site has a single `src/lib/site-config.ts` that defines: site name, tagline, logo, navigation menu (with dropdown support), footer columns, contact info, and social links. Reading this one file gives full context on a site's identity.

### Page pattern

Pages import `BaseLayout` from `@astro-fleet/shared-ui`, a preset from `@astro-fleet/config/tokens`, and site config from `../lib/site-config`. All content is passed via typed props — no global state.

## Component Conventions

All shared components in `packages/shared-ui/src/components/`:

- Export a typed `Props` interface — no `any` types
- Use CSS custom properties for all colors/fonts (preset-agnostic)
- Scoped `<style>` blocks — no global CSS side effects
- No hardcoded content — everything via props or named slots
- `loading="lazy"` on images, `aria-*` on interactive elements
- Import path: `@astro-fleet/shared-ui/src/components/<Name>.astro`

## Workflow

- **Branch protection:** `main` is protected. All changes go through feature branches and PRs.
- **Commit messages:** conventional commits — `feat:`, `fix:`, `docs:`, `chore:`
- **CI:** GitHub Actions runs `bun install --frozen-lockfile` + `bun run build` on every PR.
- **Deploys:** after merging, deploy individual sites with `wrangler pages deploy sites/<domain>/dist --project-name=<name> --branch=main`

## Key Files to Know

- `packages/config/src/tokens.ts` — DesignTokens interface + CORPORATE/SAAS/WARM presets
- `packages/config/src/css.ts` — `tokensToCSSVars()` utility
- `packages/shared-ui/src/layouts/BaseLayout.astro` — main page shell (composes SEOHead, Header, Footer)
- `packages/shared-ui/src/components/` — all 22 shared components
- `sites/<domain>/src/lib/site-config.ts` — site identity config (single file controls entire site brand)
- `sites/<domain>/src/styles/global.css` — Tailwind imports + `@theme` layer with token values
- `sites/<domain>/astro.config.mjs` — per-site Astro config (update `site` URL for each domain)
- `.github/workflows/ci.yml` — CI pipeline
- `.github/pull_request_template.md` — PR template

## Detailed Documentation

For in-depth guidance beyond what's in this file, refer to:

- [docs/components.md](docs/components.md) — Props interfaces, usage examples, CSS variables, and recipes for all 22 components and 3 layouts
- [docs/getting-started.md](docs/getting-started.md) — Clone to first deploy in 15 minutes
- [docs/adding-a-site.md](docs/adding-a-site.md) — Scaffold, configure, and deploy a new site
- [docs/adding-a-cms.md](docs/adding-a-cms.md) — Keystatic pattern used in Meridian, access-control caveats, and alternatives
- [docs/seo-recipes.md](docs/seo-recipes.md) — Optional SEO add-ons not baked into the starter (per-page OG images, git-based lastmod, llms.txt, markdown alternates, IndexNow, FuzzyRedirect, view transitions)
- [docs/design-tokens.md](docs/design-tokens.md) — How presets work, creating custom palettes
- [docs/framework-integrations.md](docs/framework-integrations.md) — Adding React/Vue/Svelte, Islands Architecture, View Transitions, Content Collections, and other Astro 6 capabilities
- [docs/deployment.md](docs/deployment.md) — Cloudflare Pages, Vercel, Netlify, or self-hosted
- [docs/ai-workflow.md](docs/ai-workflow.md) — Sample prompts and AI-driven development patterns
