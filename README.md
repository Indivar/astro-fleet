# Astro Fleet

One codebase, many sites. A multi-site Astro monorepo starter for agencies and multi-brand companies.

Astro Fleet gives you a production-ready monorepo with shared components, per-site design tokens, Turborepo build orchestration, and deployment to Cloudflare Pages, Vercel, or a self-hosted VPS. Create a new site in one command. Brand it with a design preset. Deploy it independently.

**Built for AI-driven development.** Astro Fleet's project structure, typed component props, and clear configuration patterns are optimized for AI coding assistants. Tested extensively with [Claude Code](https://claude.ai/claude-code). Also works with Gemini CLI and other AI coding tools. [See the AI Workflow Guide →](docs/ai-workflow.md)

## Quick Start

```bash
git clone https://github.com/indivar/astro-fleet.git
cd astro-fleet
bun install
bun run dev          # → starter site at localhost:4321
```

Create your first site:

```bash
./scripts/new-site.sh yourdomain.com saas
bun install
bun run dev --filter=yourdomain.com
```

## What's Included

- **10 shared components + 3 layouts** — Header, Footer, SEO Head, CTA blocks, cards, forms, testimonials, breadcrumbs, and more. All accept content via typed props, all use CSS variables for theming.
- **Design token system** — 3 presets (Corporate, SaaS, Warm) with a TypeScript interface. Create custom presets or modify colors and fonts per site without touching component code.
- **Site scaffolder** — `./scripts/new-site.sh domain.com [preset]` creates a new site from the starter template with the correct config, styles, and build pipeline wired up.
- **Infrastructure templates** — Optional Docker Compose + Traefik + Caddy setup for self-hosting on a VPS. Run `./scripts/setup-infra.sh` to generate configs for your domains.
- **AI-first workflow** — Designed to be developed with Claude Code, Gemini CLI, or any AI coding assistant. Sample prompts and patterns in the [AI Workflow Guide](docs/ai-workflow.md).

## Documentation

- [Getting Started](docs/getting-started.md) — Clone to first deploy in 15 minutes
- [Adding a Site](docs/adding-a-site.md) — Create and configure additional sites
- [Components Reference](docs/components.md) — Props, usage examples, CSS variables for every component
- [Design Tokens](docs/design-tokens.md) — Branding system, presets, custom palettes
- [Deployment](docs/deployment.md) — Cloudflare Pages, Vercel, Netlify, or self-hosted
- [AI Workflow](docs/ai-workflow.md) — Sample prompts, tool setup, AI-driven development patterns

## Stack

Astro 5 · Bun · Turborepo 2 · Tailwind CSS 4 · TypeScript · Static-first (zero JS by default)

## License

MIT — use it for anything. See [LICENSE](LICENSE).

## Credits

Built by [Indivar Software Solutions](https://indivar.com), a software company based in India and New Zealand. We use Astro Fleet to run our own portfolio of company websites.
