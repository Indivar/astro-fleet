# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

This file is written to be **executed, not just read**. Someone clones this repo,
opens Claude Code, and says "build me a site for acme.com". Everything needed to
take that from nothing to a live, indexed, measured website is below, in the
order it has to happen.

If you are that someone: you do not need to read this file. Tell Claude what you
want. Claude reads it.

---

## 0. What this repo is

A multi-site Astro monorepo. Each site lives in `sites/<domain>/` and deploys
independently. Shared components and design tokens live in `packages/`.

**Stack:** Astro 6, Bun, Turborepo 2, Tailwind CSS 4, TypeScript strict.
Static-first, zero client JS by default. Fonts self-hosted via the Astro Fonts
API — no third-party font requests at runtime.

**The three demo sites** (`meridian-advisory.com`, `flux-analytics.com`,
`olive-and-vine.com`) are not templates to copy. They are worked examples
proving the same components can produce genuinely different-looking sites. Read
them for technique; do not clone their look.

---

## 1. Before the first site: prerequisites

Check these before doing anything else. Do not assume; run the checks.

```bash
bun --version        # 1.1+.  Install: curl -fsSL https://bun.sh/install | bash
node --version       # 20+.   Some tooling still shells out to node.
git --version
```

Then:

```bash
bun install
bun run build        # must pass before you change anything
```

**If the baseline build fails, stop and fix that first.** Never start a new site
on a broken tree — you will spend an hour deciding whether you broke it.

### Deployment prerequisites (only needed at §7)

```bash
npx wrangler --version    # bundled; no global install needed
npx wrangler login        # opens a browser, authorises this machine
```

`wrangler login` is right for a human at a keyboard. For CI, or where no browser
is available, use an API token:

```bash
export CLOUDFLARE_API_TOKEN=...     # dashboard -> My Profile -> API Tokens
export CLOUDFLARE_ACCOUNT_ID=...    # any zone's overview page, right column
```

The token needs **Account → Cloudflare Pages → Edit**, plus **Zone → DNS → Edit**
for any domain you will attach.

**Never commit either value.** Shell profile, a gitignored `.env`, or your CI's
secret store. If a user pastes a token into the chat, use it for the task and
tell them to rotate it if it has been shared anywhere else.

---

## 2. The conversation that starts a site

You need five things. Ask for all of them in **one message**, then stop asking
and start building.

1. **Domain** — the real one, e.g. `acme.com`. Becomes the folder name.
2. **What the business does**, in their words. One or two sentences.
3. **Who is buying**, and what you want that person to do on the site.
4. **Any existing brand** — logo, colours, fonts, a site to match.
5. **Pages needed**, and where the content comes from.

**Do not ask about** palette, type pairing, layout, spacing, animation,
component choice, section order, or schema types. Those are your job. Decide,
write one line in an `ASSUMPTIONS.md` at the site root, and keep moving.

If the user is vague, take the most commercially sensible reading and say which
one you took. A site that exists and is 80% right beats a questionnaire.

---

## 3. Scaffolding

```bash
./scripts/new-site.sh acme.com corporate    # or: saas | warm
bun install                                  # ALWAYS after scaffolding
```

The preset only seeds design tokens. It is a starting point you will change, not
a decision you are stuck with.

```
sites/acme.com/
  astro.config.mjs        site URL, integrations, fonts
  package.json            scripts; add the search-index step here (§6.1)
  src/lib/site-config.ts  identity, navigation, footer, contact, social
  src/pages/              routes
  src/styles/global.css   Tailwind @theme layer mirroring the tokens
  public/                 static assets, robots.txt
```

**Set the real domain in `astro.config.mjs` immediately.** Canonicals, the
sitemap and OG URLs all derive from it, and a placeholder there poisons all
three quietly.

---

## 4. Design direction

The failure mode is not ugliness. It is genericness — a site that could belong to
any company in any industry.

### Choose from the subject

Before picking colours, write one sentence naming what the business actually does
and what its world looks like. A structural-steel fabricator, a paediatric dental
practice and a fintech API are three different visual worlds. **If your direction
would work equally well for all three, it is wrong.**

### What to avoid

These read as machine-generated because they are everywhere:

- Warm cream `#F4F1EA` + serif display + terracotta accent
- Near-black + one acid-green or vermilion pop
- Purple-to-blue gradient hero on white
- Inter or Space Grotesk as the safe default face
- Emoji as section markers
- Everything centred
- `rounded-lg` on every surface with a soft drop shadow
- An accent bar down the left of a rounded card

If the user explicitly asks for one of these, give it to them — their words win.
Where nothing is specified, do not spend the freedom on a default.

### Tokens

Edit `src/lib/site-config.ts` (identity, navigation) and the site's `global.css`
`@theme` block (the Tailwind side). **Keep the two in step** — they are
duplicated by design, and a mismatch is a real bug visible in only one of them.

Set a type scale and stay on it. Keep running text near 65 characters. Give
headings `text-wrap: balance`. Uppercase labels get letter-spacing.

### Floors, never traded away

- **WCAG AA contrast.** 4.5:1 body, 3:1 large text — measured against the
  background the text is *actually composited on*, not the one you assume. A
  colour that passes on white can fail on the panel it really sits on.
- **Visible keyboard focus** on every interactive element.
- **`prefers-reduced-motion` respected.** Anything that would animate shows in
  its finished state instead.
- **Nothing hidden by CSS awaiting JavaScript.** If a script fails the page must
  still read. Set animation start states at run time, not in the stylesheet.
- **Mobile first.** Check 375px before 1440px.
- **No horizontal scroll at any width.** Wide things — tables, code, diagrams —
  scroll inside their own `overflow-x: auto` container.

---

## 5. Content and copy

Copy is design material, not filler. Write it as you build; never ship lorem.

- **Never fabricate proof.** No invented testimonials, client names, user counts,
  statistics, certifications or awards. Where proof is needed but not supplied,
  write `[CLIENT TO SUPPLY: ...]` and list every one at handoff.
- **Name things the way the reader does**, not the way the system is built. A
  person manages *notifications*, not *webhook config*.
- **One primary action per page**, with a specific verb. Never "Learn more" as
  the primary CTA.
- **Buttons say what happens.** "Publish", then a toast saying "Published".
- **Errors say what went wrong and how to fix it.** No apologies, no vagueness.
- **Standard things get standard names.** The blog is called Blog and the pricing
  page is called Pricing. Save the house voice for headings; a reader hunting for
  the blog scans for the word "blog".

---

## 6. Features, and how to turn each on

Everything is opt-in. Nothing turns itself on.

### 6.1 Site search

Two steps. **Both are required, and skipping the first fails silently** — the box
appears and finds nothing.

**Step 1** — add the index generator to the site's build, after `astro build`:

```json
{
  "scripts": {
    "build": "astro build && node ../../packages/shared-ui/scripts/search-index.mjs"
  }
}
```

**Step 2** — turn it on in the layout:

```astro
<BaseLayout
  search
  searchPlaceholder="Pricing, integrations, security"
  ...
>
```

Name three things the site actually covers. A generic placeholder teaches nobody
what to type.

The index is built from the HTML that actually shipped, so a page whose copy
changed cannot go missing from search, and a page that never rendered cannot
appear in it. Fetched on first use, never on load. Roughly 1.8 KB gzipped per
page. `noindex` pages and the 404 are skipped.

It also writes a copy into `public/` so `astro dev` can serve it — dev serves
`public/`, not `dist/`. **Gitignore that copy:**

```
sites/*/public/search-index.json
```

Keyboard: `/` or Cmd/Ctrl-K opens, arrows move, Enter follows, Escape closes and
returns focus to the control that opened it.

Full reference including the nine CSS custom properties that restyle the panel:
`docs/components.md` → SiteSearch.

### 6.2 Analytics, behind consent

```astro
<BaseLayout
  gaId="G-XXXXXXXXXX"
  privacyHref="/privacy/"
  ...
>
```

That is the whole integration. What it does:

- **Nothing is requested from Google until the visitor accepts.** Deliberately
  stricter than the usual Consent Mode v2 pattern, which loads `gtag.js`
  immediately with tracking denied and flips it later — that still fetches
  Google's script and still pings before anybody has agreed.
- Global Privacy Control is read as a decline; the banner never shows.
- The choice is stored in `localStorage` under `analytics-consent`. Pages on the
  same origin share it, so nobody is asked twice.
- `window.track(name, params)` is available everywhere and is a no-op until
  consent, so callers never have to check.

**Update the privacy page in the same commit.** The most common mistake in this
whole repo's history is a privacy page describing analytics the site does not
have — or, worse, promising a consent banner that was never built. If you want
the standard behaviour instead, pass `requireConsent={false}` and say *that*.

The honest trade: **your numbers will be lower than a site that tags everyone.**
They will also match what your privacy page says.

### 6.3 SEO

Most of it is automatic once `site` is correct in `astro.config.mjs`. Per page,
`BaseLayout` emits a unique title and meta description, canonical, Open Graph and
Twitter tags, and JSON-LD from `structuredData`.

**What you still have to do:**

- One `<h1>` per page, and a heading tree that descends in order.
- A real, distinct `description` per page. Under 160 characters or it truncates.
- Descriptive `alt` on every image. Decorative images get `alt=""`.
- Deliberate internal linking. Every page reachable, and pointing somewhere
  useful.
- `structuredData` where a type genuinely applies: `Organization`, `Product`,
  `Article`, `FAQPage`, `BreadcrumbList`. Do not invent schema that does not fit.

**Recipes for the rest** — per-page OG images, git-based sitemap `lastmod`,
`llms.txt` for answer engines, IndexNow, markdown alternates, fuzzy 404
redirects, build-time validation — are in `docs/seo-recipes.md`. Read it before
writing any of that yourself.

**Write for answer engines too.** Answer-first sections, real FAQs, consistent
entity naming, and factual statements an AI could quote without mangling.

---

## 7. Deployment

### 7.1 Build and look at it locally

```bash
bun run build --filter=acme.com
cd sites/acme.com && npx astro preview
```

### 7.2 Create the Pages project (once per site)

```bash
npx wrangler pages project create acme-com --production-branch=main
```

Project names cannot contain dots. Convention: `acme.com` → `acme-com`.

### 7.3 Deploy

```bash
# staging first, always
npx wrangler pages deploy sites/acme.com/dist --project-name=acme-com \
  --branch=staging --commit-dirty=true

# then production
npx wrangler pages deploy sites/acme.com/dist --project-name=acme-com \
  --branch=main --commit-dirty=true
```

Staging gets a `staging.<project>.pages.dev` alias. Look at it on the real CDN
before production — some faults only appear behind a proxy.

### 7.4 Attach the custom domain

**Wrangler cannot do this.** There is no `pages domain` command. Use the
dashboard (Workers & Pages → project → Custom domains) or the API:

```bash
curl -sS -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/acme-com/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"acme.com"}'
```

Repeat for `www.acme.com`.

**The trap.** If a conflicting DNS record already exists — say an `A` record
pointing at an old host — Cloudflare will **not** overwrite it. The domain sits
at `status: pending` forever, the certificate never issues, and nothing reports
an error. Check, then fix the records explicitly:

```bash
# find the record id
curl -sS "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=acme.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# point it at Pages
curl -sS -X PUT \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"acme.com","content":"acme-com.pages.dev","proxied":true,"ttl":1}'
```

**Before touching DNS on a domain already in use, write the current records down
somewhere recoverable.** Apex `CNAME` flattening means `MX` records keep working,
so mail survives an apex change — but change only the records you mean to, and
check the rest afterwards.

### 7.5 Purge the cache

After any deploy that changes HTML, or you will spend twenty minutes debugging a
stale page:

```bash
curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" --data '{"purge_everything":true}'
```

### 7.6 Other hosts

Vercel, Netlify and self-hosted Traefik + Caddy are all supported and documented
in `docs/deployment.md`. The build output is plain static files; nothing here is
Cloudflare-specific except §7.2 to §7.5.

---

## 8. Verify before saying it is done

Never report a site as finished from the source. Look at what actually rendered.
At minimum, against the built output:

- [ ] Every page returns 200. Walk the sitemap.
- [ ] **No horizontal scroll** at 1280, 768, 375 and 320.
- [ ] **Contrast passes** on every text element, measured against its real
      composited background.
- [ ] No broken images — check `naturalWidth === 0`, not just that the file
      exists.
- [ ] Keyboard: tab through, focus always visible, nothing traps.
- [ ] Search returns sensible results for three real queries, if enabled.
- [ ] Consent: **zero requests to googletagmanager before accepting**, and the
      tag loads after. If analytics is enabled.
- [ ] Canonical, title and description correct and unique on every page.
- [ ] `robots.txt` and the sitemap present and reachable.
- [ ] If this replaces an existing site: every indexed old URL has a 301, or the
      rankings go on launch day.

Report what you measured, with numbers. "Contrast passes" is worth less than
"lowest reading on the site is 4.99:1 against a 4.5 floor".

---

## 9. Failure modes seen in the wild

Every one of these has shipped silently in a real project. They are listed
because **none of them produce an error**.

**An undefined CSS custom property deletes the whole declaration.**
`font-size: var(--t-5)` where `--t-5` was never defined is *invalid at computed
value time*. It does not fall back to the previous rule — the property is dropped
and the element inherits. Symptom: headings render at body size. A typo in a
custom property is not a syntax error.

**A reset that outranks the flow rhythm.** `figure` has a browser default margin.
Killing it with `.card { margin: 0 }` scores the same as
`* + .card { margin-top: 2rem }` and, sitting later in the file, wins. Symptom:
everything is flush. Write resets inside `:where()` so they score zero.

**A broad descendant selector claiming a component.** `.menu a { color: … }`
scores 0,1,1 and beats `.btn` at 0,1,0, so the button inside your menu is
repainted in link colour. Use `:not(.btn)`.

**`getStaticPaths` cannot see its own frontmatter.** Astro hoists it into a
separate module scope, so a `const` declared beside it is out of scope. It fails
at generate time, not type-check time, and reads like a typo. Declare inside the
function, or import it.

**A redirect splat shadowing real routes.** Cloudflare evaluates `_redirects`
before serving a file, so `/blog/*  /  301` makes every blog post unreachable.
List specific redirects; never splat a prefix you also serve.

**Search that returns nothing in development.** `astro dev` serves `public/`, not
`dist/`. Without the dev copy the box works and finds nothing, silently.

**A nowrap column holding prose.** A cell styled `white-space: nowrap` so numbers
never break mid-figure will push the whole page sideways the moment somebody puts
a sentence or a street address in it.

**Trailing-slash mismatches in redirects.** If the old sitemap publishes `/post/`
and your rule says `/post`, whether it matches is a platform detail. Write both.

**Cloudflare email obfuscation rewriting your HTML.** Scrape Shield turns
`hello@acme.com` into `[email protected]` in the served markup, decoded by a
script at run time. Fine for humans, invisible to AI crawlers reading your
contact page. Decide deliberately; it is on by default.

---

## 10. Commands

```bash
# Development
bun run dev                                    # all sites (4321)
bun run dev --filter=acme.com                  # one site
bun run dev --filter=acme.com -- --port 4322   # a second alongside

# Build
bun run build                                  # all, parallel via Turborepo
bun run build --filter=acme.com                # one

# Lint / typecheck
bun run lint

# New site
./scripts/new-site.sh acme.com corporate       # then: bun install

# Search index (only if not already in the site's build script)
cd sites/acme.com && node ../../packages/shared-ui/scripts/search-index.mjs

# Deploy
npx wrangler pages deploy sites/acme.com/dist --project-name=acme-com --branch=main

# Self-hosted infra
./scripts/setup-infra.sh acme.com,other.com
```

---

## 11. Architecture reference

### Layout

```
packages/config/       DesignTokens interface + 3 presets (CORPORATE, SAAS, WARM)
packages/shared-ui/    24 components + 3 layouts + scripts/search-index.mjs
sites/<domain>/        one site; own astro.config, package.json, pages
scripts/               new-site.sh, setup-infra.sh
infrastructure/        Docker Compose + Traefik + Caddy templates
```

### Design tokens

Defined in `packages/config/src/tokens.ts` against the `DesignTokens` interface,
reaching CSS two ways:

1. `tokensToCSSVars()` in `packages/config/src/css.ts`, called by `BaseLayout`,
   injected into `:root` at build time.
2. Each site's `global.css` `@theme` layer, for Tailwind 4.

Variables: `--color-primary`, `--color-secondary`, `--color-accent`,
`--color-bg`, `--color-text`, `--color-cta`, `--font-heading`, `--font-body`,
`--hero-layout`, `--cta-style`, `--spacing`.

### Per-site configuration

One file, `src/lib/site-config.ts`: site name, tagline, logo, navigation (with
dropdowns), footer columns, contact info, social links. Reading it gives full
context on a site's identity.

### Component conventions

Everything in `packages/shared-ui/src/components/`:

- Exports a typed `Props` interface. No `any`.
- Uses CSS custom properties for all colours and fonts, so it is preset-agnostic.
- Scoped `<style>` blocks. Where a component must ship global CSS, it wraps every
  rule in `:where()` so a site's own stylesheet always wins without `!important`.
- No hardcoded content — props or named slots.
- `loading="lazy"` on images, `aria-*` on interactive elements.
- Import path: `@astro-fleet/shared-ui/src/components/<Name>.astro`

To change a component for one site, **copy it into that site's
`src/components/` and edit there.** Do not fork a shared component in place —
the other sites are using it.

### Page pattern

A page imports `BaseLayout` from `@astro-fleet/shared-ui`, a preset from
`@astro-fleet/config/tokens`, and site config from `../lib/site-config`. All
content passed via typed props; no global state.
`sites/meridian-advisory.com/src/pages/index.astro` is the canonical shape.

---

## 12. Repository workflow

- **`main` is protected.** All changes go through a feature branch and a PR.
- **Conventional commits:** `feat:`, `fix:`, `docs:`, `chore:`.
- **CI** runs `bun install --frozen-lockfile` and `bun run build` on every PR.
- **Deploy after merge**, per site, as in §7.

---

## 13. Further reading

| Doc | For |
|---|---|
| `docs/getting-started.md` | Clone to first deploy in 15 minutes |
| `docs/adding-a-site.md` | `site-config.ts` in full, selective builds |
| `docs/components.md` | All 24 components and 3 layouts, with props |
| `docs/design-tokens.md` | The token system and the three presets |
| `docs/seo-recipes.md` | OG images, llms.txt, IndexNow, validation |
| `docs/deployment.md` | Cloudflare, Vercel, Netlify, self-hosted |
| `docs/adding-a-cms.md` | The Keystatic pattern and alternatives |
| `docs/framework-integrations.md` | React/Vue/Svelte islands, view transitions |
| `docs/ai-workflow.md` | Sample prompts and AI-driven development patterns |

### Key files

- `packages/config/src/tokens.ts` — presets
- `packages/config/src/css.ts` — `tokensToCSSVars()`
- `packages/shared-ui/src/layouts/BaseLayout.astro` — the page shell
- `packages/shared-ui/scripts/search-index.mjs` — the search index generator
- `sites/<domain>/src/lib/site-config.ts` — one file controls a site's brand
- `sites/<domain>/src/styles/global.css` — Tailwind `@theme` token mirror
- `sites/<domain>/astro.config.mjs` — per-site config; **set `site`**
- `.github/workflows/ci.yml` — CI pipeline
