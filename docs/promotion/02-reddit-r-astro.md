# Reddit — r/astro post

Post to **r/astro**. Use the "Show & Tell" or "Project" flair if available.

---

**Title:** We open-sourced the monorepo we use to run all our client sites from one Astro codebase

**Body:**

For the past two years we've been running 6+ client and company websites from a single Astro monorepo. Every site shares the same component library and design token system, but each one looks completely different — different nav, different layout, different typography. We finally cleaned it up and open-sourced the whole thing.

**Why we built this**

We're a small team. We were maintaining separate repos for each client site. Every time we improved a component (fixed an accessibility bug in the header, added a loading state to the contact form, improved the footer's mobile layout), we had to manually propagate that change to every other repo. Sometimes we forgot. Sometimes we introduced regressions. It was a mess.

The monorepo approach means: fix it once, every site gets it on the next build.

**How it works**

```
packages/config/       → design tokens (3 presets: Corporate, SaaS, Warm)
packages/shared-ui/    → 22 components + 3 layouts
sites/client-a.com/    → site config, pages, styles — deploys independently
sites/client-b.com/    → different brand, same components
```

You scaffold a new site with:

```bash
./scripts/new-site.sh yourdomain.com saas
bun install
bun run dev --filter=yourdomain.com
```

That copies the starter template, applies the design preset, and wires up the build pipeline. You edit `site-config.ts` with your brand's name, nav, footer links, and contact info, and you have a fully branded site in minutes.

**What the presets actually look like**

We built three demo sites to show that the presets aren't just colour swaps — the same components compose into completely different site personalities:

- **Corporate** (consulting firm): https://astro-fleet-meridian.pages.dev — editorial hero, dark stats strip, numbered practice areas, global offices grid
- **SaaS** (developer tool): https://astro-fleet-flux.pages.dev — dark theme, code mockup, pricing tiers, comparison table, "book a demo" layout
- **Restaurant**: https://astro-fleet-olive.pages.dev — warm gradient hero, serif typography, dotted-leader menu, chef's quote, reservations page

Click through to the About and Contact pages on each — those use different component combinations (Timeline, TeamGrid, FAQ, FeatureGrid, PricingTable, etc.).

**Tech stack**

Astro 5 · Bun · Turborepo 2 · Tailwind CSS 4 · TypeScript (strict mode). Static-first — zero client-side JS by default. Only 2 of 22 components include a small inline script (the carousel sliders).

**What's genuinely different from other Astro starters**

Most Astro starters on GitHub are single-site templates. This is a monorepo designed for teams that manage multiple sites:

- Shared components with typed Props interfaces
- Design tokens as TypeScript objects → CSS custom properties → Tailwind `@theme` layer
- Per-site `site-config.ts` that controls the entire site identity from one file
- Self-hosting templates (Docker Compose + Traefik + Caddy) — not just Vercel/Netlify
- Designed for AI coding assistants (CLAUDE.md with project context, typed props that AI tools can autocomplete)

**Repo:** https://github.com/Indivar/astro-fleet

MIT licensed. We use it in production for our own sites. Happy to answer questions about the architecture, the token system, or multi-site deployment patterns.

---

## Crosspost note

A shorter version of this can be posted to **r/webdev** with the title: "How we manage 6 client websites from one Astro monorepo (open source, MIT)" — focus more on the problem (multi-site management pain) and less on Astro-specific details.
