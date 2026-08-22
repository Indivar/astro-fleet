# Build a site with Claude

A walkthrough from cloning this repo to a live, measured website. Written for
the person at the keyboard, not for the agent — `CLAUDE.md` is the agent's copy.

You do not need to know Astro. You do need to read what Claude tells you and
answer five questions honestly.

**Roughly an hour**, most of it spent looking at the site and asking for changes.

---

## Before you start

Install these once:

| | Check | If missing |
|---|---|---|
| **Bun** | `bun --version` (1.1+) | `curl -fsSL https://bun.sh/install \| bash` |
| **Node** | `node --version` (20+) | [nodejs.org](https://nodejs.org) |
| **Claude Code** | `claude --version` | [claude.com/code](https://claude.com/code) |

A **Cloudflare account** is needed only at the deploy step, and it is free. You
do not need one to build and look at a site.

Then:

```bash
git clone https://github.com/Indivar/astro-fleet.git
cd astro-fleet
bun install
bun run build     # should pass; if not, say so before going further
claude
```

That last command opens Claude Code in the repo. Everything below is typed into
that conversation.

---

## Step 1 — Ask for the site

Type something like this. Detail helps; polish does not.

> Build me a site for **acme.com**. We fabricate structural steel for commercial
> builders in Auckland. The buyer is a project manager comparing three
> fabricators on lead time and certification. I want them to request a quote.
> We have a logo at `~/Desktop/acme-logo.svg` and no other brand. Pages: home,
> capabilities, projects, certifications, about, contact.

Claude will confirm the five things it needs and start. If you leave something
out it will ask **once**, in one message, then get on with it.

**It will not ask you about colours, fonts, layout or spacing.** Those are its
job. It records what it assumed in `sites/acme.com/ASSUMPTIONS.md` so you can
argue with any of it later.

### If you have an existing site

> Look at oldacme.com and carry over the real content. Keep every page that
> ranks. Tell me what you find that we should not repeat.

Claude will fetch it, and will tell you where the old copy makes claims it
cannot verify.

---

## Step 2 — Look at it

```
Show me the site
```

Claude starts a dev server and gives you a URL. **Open it.** Then say what is
wrong, in your own words:

> The hero is too big and the headline is doing nothing. The three service cards
> look like every consulting site I have seen.

Vague is fine. "It feels generic" is a useful sentence — genericness is a real
fault with real causes, and Claude has a list of them.

**Ask for alternatives** rather than accepting the first answer:

> Show me three different directions for the homepage hero. Do not use the same
> layout three times.

---

## Step 3 — Turn on what you want

Each of these is one instruction. None is on by default.

### Search across the whole site

```
Add site search
```

Two files change, and search costs nothing on page load — the index is fetched
the first time somebody actually searches. Visitors press `/` or `Cmd-K`.

Worth asking for once it is in:

> Search for "lead time" and show me what comes back

### Google Analytics

First create a GA4 property at [analytics.google.com](https://analytics.google.com)
— Admin → Create → Property → Web → copy the `G-XXXXXXXXXX`. Then:

```
Add GA4, the ID is G-XXXXXXXXXX
```

You get a consent banner, and **nothing is sent to Google until a visitor
accepts.** That is stricter than most sites. It means your numbers will be lower
than a site that tracks everyone, and it means your privacy page is true.

Claude will also update your privacy page to match. Let it — a privacy page
describing analytics you do not have is the single most common fault in this
whole area.

> Prefer the standard behaviour? Say "use standard consent mode" and Claude will
> switch it, and change the privacy wording to match.

### SEO

Mostly automatic. Worth asking for explicitly:

```
Do a full SEO pass and tell me what you changed
```

That covers per-page titles and descriptions, structured data, `llms.txt` so AI
search engines can read the site, per-page social cards, and sitemap `lastmod`
from git history.

### A blog

```
Add a blog with pagination and an archive by year
```

Ask for images in the index and a sidebar if you want them; say so up front.

---

## Step 4 — Check it honestly

Before deploying:

```
Verify the site properly and show me the numbers
```

Claude checks the built output, not the source: every page loads, nothing scrolls
sideways on a phone, contrast passes against real backgrounds, no broken images,
keyboard navigation works.

**Ask for numbers, not adjectives.** "Contrast passes" means less than "the
lowest reading on the site is 4.99:1 against a 4.5 floor". If you get adjectives,
ask again.

---

## Step 5 — Deploy

### Connect Cloudflare, once

In your terminal:

```
! npx wrangler login
```

The `!` runs it in the Claude Code session, so Claude sees the result. A browser
opens; approve it. This machine is now authorised and you will not do it again.

> **Automating this later?** Create an API token instead: Cloudflare dashboard →
> My Profile → API Tokens, with **Account → Cloudflare Pages → Edit** and
> **Zone → DNS → Edit**. Put it in your shell profile as
> `CLOUDFLARE_API_TOKEN`. **Never commit it.**

### Deploy to staging

```
Deploy to staging
```

You get a `.pages.dev` URL. Look at it. Some faults appear only behind a real
CDN.

### Go live

```
Deploy to production and point acme.com at it
```

Claude deploys, attaches the domain, and updates DNS.

**Two things to know**, both real:

- **If the domain already points somewhere**, Cloudflare will not overwrite the
  existing record. The certificate silently never issues. Claude checks for this
  and fixes the record explicitly — but say so if the domain is currently live:

  > acme.com is currently serving our old WordPress site. Record the current DNS
  > before you change anything.

- **Email is not affected** by pointing the apex at Pages. `MX` records are
  separate. Claude will confirm this rather than assume it.

### Replacing an existing site?

Say so **before** deploying:

> This replaces our WordPress site. Make sure every indexed URL still works.

Claude fetches the old sitemap and writes a redirect for every URL. Skip this and
you lose your search rankings on launch day, quietly, and find out weeks later.

---

## Adding more sites

The repo holds as many as you like:

```
Add a second site for acmeparts.co.nz. Same company, different business,
so it should not look like acme.com.
```

Shared components are shared; the look is not. Deploy them independently.

---

## Useful things to say

| Say this | To get |
|---|---|
| `Show me three directions for this page` | Alternatives instead of the first idea |
| `That looks generic. Why?` | A diagnosis, not a reskin |
| `What did you assume?` | The assumptions log |
| `What do you need from me?` | Blockers only you can clear |
| `What is not finished?` | An honest list, including anything skipped |
| `Check this on a phone` | 375px, measured |
| `Deploy to staging first` | A look before it is public |

---

## When something goes wrong

**The build fails.** Paste the error. Claude reads build output better than it
reads descriptions of build output.

**A page looks broken.** Screenshot it. Say which browser and roughly how wide
the window was.

**Search finds nothing.** Almost always the index step missing from the build
script. Say `search returns nothing` and Claude will check that first.

**Analytics shows no data.** GA's Home tab lags by a day or two. Look at
**Reports → Realtime** instead. If Realtime is empty, say so and Claude will
check whether the tag is actually firing.

**The site is live but shows the old version.** Cloudflare's edge cache. Say
`purge the cache`.

---

## What this does not do

Being straight about the edges:

- **No CMS by default.** Content lives in the repo, and you change it by asking
  Claude or editing files. If a non-technical person must edit copy without a
  developer, ask for a CMS — `docs/adding-a-cms.md` covers the pattern.
- **No e-commerce.** Static sites, no cart, no checkout.
- **No logo design.** Bring a logo, or get one made.
- **No stock photography.** Claude will not invent images, and will not pretend
  a stock photo is your factory. Supply real photographs or the site ships
  without them.
- **No invented proof.** Claude will not write testimonials, client names, user
  counts or statistics you have not given it. Where a page needs proof you have
  not supplied, it writes `[CLIENT TO SUPPLY: ...]` and lists them at handoff.
  That is a feature. Made-up numbers are the fastest way to lose a buyer who
  checks.
