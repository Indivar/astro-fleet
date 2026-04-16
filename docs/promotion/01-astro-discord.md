# Astro Discord — #showcase post

Post this in the **#showcase** channel on the [Astro Discord](https://astro.build/chat).

---

**Astro Fleet — multi-site monorepo starter for agencies**

Hey all! We've been running multiple client/brand sites from a single Astro monorepo for the past couple of years and finally open-sourced the whole setup.

**The problem it solves:** If you manage more than 2-3 Astro sites, you've probably hit this: you fix a header bug in one site, then have to copy-paste the fix to every other repo. Or you redesign your CTA block and have to update it in six places. We got tired of that.

**What it is:** A monorepo starter with Astro 5 + Bun + Turborepo that lets you share components, design tokens, and deployment infra across any number of sites. Each site lives in `sites/<domain>/`, gets its own config and styles, and deploys independently.

**What's included:**
- 22 shared components (Header, Footer, FAQ, PricingTable, Timeline, HeroSlider, etc.) — all typed Props, all themed via CSS custom properties
- 3 design presets (Corporate, SaaS, Warm) — not just colour swaps, completely different personalities
- One-command scaffolder: `./scripts/new-site.sh yourdomain.com saas`
- Cloudflare Pages, Vercel, Netlify, or self-hosted (Docker + Traefik templates included)
- Zero client-side JS by default — only 2 of 22 components use a small inline script

**Live demos** (same shared components, three completely different sites):
- Corporate consulting firm: https://astro-fleet-meridian.pages.dev
- SaaS product: https://astro-fleet-flux.pages.dev
- Restaurant: https://astro-fleet-olive.pages.dev

**Repo:** https://github.com/Indivar/astro-fleet
**MIT licensed.** We use it to run our own portfolio of sites (vairi.com, claspt.app, stakteck.com).

Would love feedback from the community — especially if you've dealt with multi-site management and have opinions on what's missing or what could be better. 🙏
