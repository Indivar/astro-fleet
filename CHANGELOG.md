# Changelog

All notable changes to Astro Fleet are recorded here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Two version numbers move independently:

- **Astro Fleet** — the template and shared packages. Tagged `vX.Y.Z`.
- **`create-astro-fleet`** — the scaffolding CLI, published to npm.

The CLI pins the template it clones to a specific Fleet tag, so a Fleet release
that changes the template needs a matching CLI release. If it does not get one,
new projects silently scaffold from the previous version.

---

## [2.3.0] — 2026-08-23

Two shared components and a documentation set built to be executed rather than
read.

### Added

- **`SiteSearch`** — search across every page, with no server and no search
  service. The index is generated from the HTML that actually shipped, so a page
  whose copy changed cannot go missing from search and a page that never
  rendered cannot appear in it. Fetched on first use and never on load, about
  1.8 KB gzipped per page. `noindex` pages and the 404 are skipped. Keyboard
  throughout: `/` or Cmd/Ctrl-K opens, arrows move, Enter follows, Escape closes
  and returns focus to the control that opened it.

  Deliberately not a search library. A WebAssembly runtime with its own index
  format earns its size at a few thousand pages; on a forty-page marketing site
  it would be most of the JavaScript on the page.

- **`packages/shared-ui/scripts/search-index.mjs`** — the index generator. Takes
  `--dist`, `--public`, `--exclude` and `--body`. Runs after `astro build`.

- **`Analytics`** — GA4 behind a consent banner, wired through `BaseLayout` as
  `gaId` and `privacyHref`. Two props is the whole integration.

  Stricter than the usual Consent Mode v2 pattern, deliberately. The common
  approach loads `gtag.js` immediately with `analytics_storage: denied` and
  flips it later, which still fetches Google's script and still pings before
  anybody has agreed. Most privacy policies do not describe that. This one keeps
  the sentence they do use: nothing is requested from googletagmanager.com until
  the visitor accepts. Consent Mode defaults are still set before the script
  arrives, because a granted signal needs something to update.

  Global Privacy Control is read as a decline. The choice lives in
  `localStorage`, shared across an origin so nobody is asked twice.
  `window.track(name, params)` is available everywhere and is a no-op until
  consent, so callers never have to check. `requireConsent={false}` restores the
  standard behaviour for anyone who wants it.

- **`docs/build-a-site-with-claude.md`** — clone to live domain with Claude
  Code, with the exact sentences to type at each step, a troubleshooting
  section, and an honest list of what this repo does not do.

- **`CHANGELOG.md`** — this file. Earlier versions reconstructed from the
  published GitHub releases.

### Changed

- **`CLAUDE.md` rewritten** from a 108-line reference into an operating manual.
  It now carries the whole path: prerequisites with the checks to actually run,
  the five questions to ask in one message and the longer list not to ask about,
  scaffolding, design direction including the generic looks to avoid, copy
  rules, each feature and how to switch it on, deployment down to the individual
  DNS record, and a verification checklist that insists on numbers rather than
  adjectives.

  Its section 9 lists nine failure modes that have shipped silently in real
  projects. None of them produce an error: an undefined CSS custom property
  deleting a whole declaration, a reset outranking the flow rhythm, a descendant
  selector repainting a component, `getStaticPaths` not seeing its own
  frontmatter, a redirect splat shadowing real routes, search returning nothing
  in development, a `nowrap` column holding prose, trailing-slash mismatches in
  redirects, and Cloudflare rewriting email addresses out of the served HTML.

- **`BaseLayout`** takes four new optional props: `search`, `searchPlaceholder`,
  `gaId`, `privacyHref`. All features are off by default.

- **`Header`** takes `search` and `searchPlaceholder`, and renders the search
  control only when asked.

- **Showcase** in the README now lists seven production sites, each checked live
  and returning 200 on the day of release: edubold.com, moiengineering.com,
  hybridagrobots.com, indivar.com, stakteck.com, vairi.com, claspt.app.

- **`docs/components.md`** documents both new components in full, including the
  nine CSS custom properties that restyle the search panel and the seven that
  restyle the consent bar.

### Fixed

- **Analytics no longer ships its script to sites that do not use it.** It is
  rendered conditionally in `BaseLayout`, so a site with no `gaId` carries
  none of it. Measured at 1.4 KB per page on the two demo sites that leave it
  off.

- **Component count corrected** across four files. The README said 22,
  `docs/components.md` said 22, `docs/framework-integrations.md` said 22 twice.
  The real count is 24.

- **Duplicate `### Analytics` heading** in `docs/components.md` produced an
  ambiguous anchor, and the older of the two recommended pasting a raw `gtag`
  snippet, which contradicts the new component. It is now
  "Other analytics providers" and points at the built-in.

- **Root `package.json` version** was stuck at `1.0.0` while the repository was
  tagged `v2.2.0`. It now tracks the tag.

---

## [2.2.0] — 2026-04-17

### Added

- **`create-astro-fleet` CLI** — scaffold a new fleet, or add a site to an
  existing one, without cloning the repo. `bunx create-astro-fleet`.
- **Keystatic CMS example** in the Meridian demo, with the access-control
  caveats documented.
- **SEO hardening** — P0 meta fixes, automatic JSON-LD, security headers, RSS,
  and `docs/seo-recipes.md` covering per-page OG images, git-based sitemap
  `lastmod`, `llms.txt`, IndexNow, markdown alternates and build-time
  validation.

### Changed

- CLI install flow detects the package manager from `npm_config_user_agent`
  (bun, pnpm, yarn, npm) and offers to install after scaffolding.
- CLI pins its default template to a Fleet tag via a `TEMPLATE_VERSION`
  constant.

### Fixed

- CLI flag parser treats `--no-*` and known boolean flags as pure booleans.
  Previously `--no-install` consumed the next positional argument.

---

## [2.1.0] — 2026-04-16

### Added

- `docs/framework-integrations.md` — adding React, Vue or Svelte islands,
  Islands Architecture, View Transitions and Content Collections.
- Astro capabilities reference.

### Changed

- Node 22 is now the documented requirement.

---

## [2.0.0] — 2026-04-16

### Changed

- **Upgraded to Astro 6**, with self-hosted fonts via the Astro Fonts API. No
  third-party font requests at runtime.

### Added

- CI badges and promotion drafts.

---

## [1.1.0] — 2026-04-16

### Added

- 12 further shared components, bringing the set to 22, each with full
  documentation.
- CI workflow and pull request template.

### Changed

- Comprehensive documentation rewrite, and all components integrated into the
  three demo sites.

---

## [1.0.0] — 2026-04-15

Initial release. Multi-site Astro monorepo with shared components, a design
token system with three presets, three demo sites, scaffolding scripts and
infrastructure templates. MIT licensed.

[2.3.0]: https://github.com/Indivar/astro-fleet/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/Indivar/astro-fleet/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/Indivar/astro-fleet/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Indivar/astro-fleet/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/Indivar/astro-fleet/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Indivar/astro-fleet/releases/tag/v1.0.0
