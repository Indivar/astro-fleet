# Reddit — r/webdev post

Post to **r/webdev**. Focus on the multi-site management problem, not Astro specifics.

---

**Title:** How we stopped copy-pasting component fixes across 6 client repos (open-source monorepo starter)

**Body:**

If you maintain websites for multiple clients or brands, you've probably lived this loop:

1. Client A reports a bug in the header dropdown on mobile
2. You fix it
3. You realise the same header code exists in Client B, C, D, E, and F's repos
4. You copy-paste the fix to each one
5. You miss Client D
6. Client D reports the same bug two weeks later

We ran this loop for a year and a half before we reorganised everything into a monorepo with a shared component library. One codebase, many sites. Fix the header once, every site gets it.

We've been using this structure in production for two years now. We finally cleaned it up and open-sourced it.

**What it looks like in practice**

```
packages/shared-ui/    → 22 components (Header, Footer, FAQ, PricingTable, etc.)
packages/config/       → design token presets (colours, fonts, spacing)
sites/client-a.com/    → pages + site config → deploys independently
sites/client-b.com/    → different brand, same components
sites/client-c.com/    → ...
```

Each site has a single `site-config.ts` file that defines the brand identity: name, logo, navigation menu, footer links, contact info, social links. The shared components read CSS custom properties, so they automatically adapt to whatever design preset the site uses.

Creating a new site:

```bash
./scripts/new-site.sh newclient.com saas
```

That scaffolds a complete site from a template, applies the design preset, and it's ready to run. Edit the config, add your pages, deploy.

**Three demo sites to show the range**

Same monorepo, same 22 shared components, but they look nothing alike:

- **Consulting firm** (corporate preset): https://astro-fleet-meridian.pages.dev
- **SaaS product** (developer tool preset): https://astro-fleet-flux.pages.dev
- **Restaurant** (warm preset): https://astro-fleet-olive.pages.dev

These aren't colour-swap reskins. The navigation, page structure, hero layouts, typography, and section composition are all different. Click through to the About pages — each one uses a different combination of shared components (timelines, team grids, FAQs, comparison tables).

**Stack:** Astro 5, Bun, Turborepo, Tailwind CSS 4, TypeScript. Static HTML — zero client-side JavaScript by default.

**What this is NOT:**
- Not a CMS. It's a static site monorepo. You write pages in `.astro` files.
- Not a theme. It's a project structure with a shared component library and build pipeline.
- Not locked to any hosting provider. Deploys to Cloudflare Pages, Vercel, Netlify, or self-hosted with Docker.

**Repo:** https://github.com/Indivar/astro-fleet (MIT)

Genuinely curious if others have solved multi-site management differently. We looked at Nx, micro-frontends, and a few headless CMS approaches before landing on this. Each had tradeoffs. Would love to hear what's worked (or hasn't) for other teams.
