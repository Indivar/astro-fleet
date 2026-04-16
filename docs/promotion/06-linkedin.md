# LinkedIn post

Post from your personal profile. Attach the social preview image or a composite screenshot of the three demos.

---

We've been running all our company websites from a single codebase for two years. We finally open-sourced the entire setup.

**The problem we solved:**

When you maintain websites for multiple brands or clients, every improvement becomes a multiplication problem. Fix a header bug? Copy it to six repos. Update the footer layout? Six PRs. Miss one? Bug report in two weeks.

After a year of this, we reorganised everything into a monorepo with a shared component library: one set of components, one design system, many sites. Fix it once, every site gets it.

**What we released:**

Astro Fleet — a multi-site monorepo starter built with Astro 5, Turborepo, and Tailwind CSS 4. It's the actual structure we use in production, cleaned up and documented.

What's included:
→ 22 shared components with typed interfaces (Header, Footer, FAQ, Pricing, Timeline, etc.)
→ 3 design presets (Corporate, SaaS, Warm) — not just colour changes, completely different site personalities
→ One-command site scaffolding: you run a script, edit a config file, and have a branded site in minutes
→ Self-hosting templates (Docker + Traefik) for teams that can't use Vercel or Cloudflare
→ Zero client-side JavaScript by default — pure static HTML

**See it in action** (same components, three different sites):

🏢 Corporate consulting firm → https://astro-fleet-meridian.pages.dev
💻 SaaS developer tool → https://astro-fleet-flux.pages.dev
🍽️ Mediterranean restaurant → https://astro-fleet-olive.pages.dev

These are all built from the same monorepo. The components are identical — the navigation, page structure, typography, and content are unique to each brand.

**Who is this for:**
- Agencies managing multiple client sites
- Companies with multiple brands or product lines
- Freelancers tired of maintaining separate repos for every project
- Teams looking for an Astro starter that goes beyond a single-site template

MIT licensed: https://github.com/Indivar/astro-fleet

We use it to run vairi.com, claspt.app, and stakteck.com in production — with more sites coming.

If you've dealt with multi-site maintenance and found a different approach, I'd genuinely love to hear what worked (or didn't). The monorepo approach has tradeoffs too.

#opensource #webdevelopment #astro #monorepo #webdev
