# Hacker News — Show HN

Post as a **Show HN** submission. Keep it lean — HN penalises marketing language.

Best posted Tuesday–Thursday, 9am–11am US Eastern.

---

**Title:** Show HN: Astro Fleet – Multi-site monorepo with shared components and design tokens

**URL:** https://github.com/Indivar/astro-fleet

**Comment (post immediately after submitting):**

We run multiple brand/client websites and got tired of copying component fixes between repos. This is the monorepo structure we've used in production for two years, cleaned up and open-sourced.

Architecture: `packages/shared-ui/` has 22 Astro components (all typed Props, scoped CSS, zero JS by default). `packages/config/` has design token presets. `sites/<domain>/` has per-site pages and config. Turborepo orchestrates builds so only changed sites rebuild.

Each site has a single `site-config.ts` that controls identity (name, nav, footer, contact). Components read CSS custom properties, so rebranding is a token change, not a CSS rewrite.

Three presets ship: Corporate, SaaS, Warm. We built live demos with each to show they're not just colour swaps — different navigation, page composition, and typography:

- Corporate: https://astro-fleet-meridian.pages.dev
- SaaS: https://astro-fleet-flux.pages.dev
- Restaurant: https://astro-fleet-olive.pages.dev

Stack: Astro 5, Bun, Turborepo 2, Tailwind CSS 4, TypeScript. Static output — no runtime.

Includes self-hosting templates (Docker Compose + Traefik + Caddy) for teams that want to avoid platform lock-in.

MIT. Happy to answer architecture questions.
