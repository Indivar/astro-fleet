# X/Twitter thread

Post as a thread. Attach the social preview image (or three-demo composite screenshot) to the first tweet. Tag **@astrodotbuild**.

---

**Tweet 1** (attach screenshot of all three demos)

We open-sourced the monorepo we use to run all our websites from one Astro codebase.

22 shared components. 3 design presets. Zero client-side JS.

Same components, three completely different sites → [screenshot]

🔗 github.com/Indivar/astro-fleet

---

**Tweet 2**

The problem: we were maintaining 6 client sites in separate repos.

Every header fix → copy-paste to 6 repos.
Every footer update → 6 PRs.
Every time we forgot one → a bug report two weeks later.

---

**Tweet 3**

The fix: a monorepo with a shared component library.

Fix the header once → every site gets it.
Change a design token → every site rebrands.
Scaffold a new site → one command, 30 seconds.

```
./scripts/new-site.sh newclient.com saas
```

---

**Tweet 4**

What makes the presets more than colour swaps:

Corporate → editorial layout, stats strip, numbered practice areas
SaaS → dark hero with code mockup, pricing tiers, comparison table
Warm → serif typography, dotted-leader restaurant menu, chef's quote

Live demos:
🏢 astro-fleet-meridian.pages.dev
💻 astro-fleet-flux.pages.dev
🍽️ astro-fleet-olive.pages.dev

---

**Tweet 5**

Stack: Astro 5 + Bun + Turborepo + Tailwind CSS 4 + TypeScript

• 22 typed components (only 2 use any JS)
• 3 layouts (Base, Industry, Product)
• Design tokens as TS objects → CSS custom properties
• Cloudflare Pages, Vercel, or self-hosted (Docker templates included)

---

**Tweet 6**

We also designed it for AI-driven development.

The CLAUDE.md, typed Props, and single-file site configs mean AI coding assistants (Claude Code, Gemini CLI, etc.) can scaffold and modify sites with full context.

There's an AI Workflow Guide with sample prompts → docs/ai-workflow.md

---

**Tweet 7**

MIT licensed. We use it in production for:

• vairi.com — software consultancy
• claspt.app — encrypted notes app
• stakteck.com — IT staffing

If you ship a site with it, open a PR to get listed.

github.com/Indivar/astro-fleet ⭐

@astrodotbuild
