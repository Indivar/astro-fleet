# Releasing Astro Fleet

Two things ship together, and forgetting the second one is the mistake this
page exists to prevent:

1. **The template** (this repo), tagged `vX.Y.Z` on GitHub.
2. **`create-astro-fleet`** on npm, which pins the template tag it clones.
   If the CLI is not republished, `npm create astro-fleet` keeps scaffolding
   the previous version and nobody notices.

## Checklist

1. **Changelog.** Add `## [X.Y.Z] — YYYY-MM-DD` to `CHANGELOG.md` in the
   existing style (Added / Changed / Fixed, plain language, no em dashes).
2. **Versions.** Bump the root `package.json`; `packages/shared-ui` if it
   changed; `packages/create-astro-fleet` to its next version and set
   `TEMPLATE_VERSION = 'vX.Y.Z'` in `src/init.mjs` and the default shown in
   `src/help.mjs`.
3. **Verify.** `bun install`, `bun run build` (every site), `bun run lint`,
   `python3 scripts/responsive-images.py --check`,
   `python3 scripts/localize-stock-images.py --check`. Grep the diff for
   anything that belongs to a private site (client names, ids, tokens).
4. **PR.** Branch, commit, push, open a PR, wait for the `Build all sites`
   check, squash-merge.
5. **Tag and release.** On `main`:
   `git tag -a vX.Y.Z -m "..." && git push origin vX.Y.Z`, then
   `gh release create vX.Y.Z --title "..." --notes-file <changelog section>`.
6. **Publish the CLI.** From `packages/create-astro-fleet`, in your own
   terminal (npm opens the browser for the passkey; it cannot be done from an
   agent session):
   ```
   npm publish
   ```
   Confirm with `npm view create-astro-fleet version`. Then add one line to
   the GitHub release notes: "`create-astro-fleet@A.B.C` is on npm, pinned to
   this tag."
7. **Tell the private fleet.** If the change came from a production site,
   record the backport in that project's memory so it is not ported twice.

## Why the CLI is published by hand

The npm account uses a passkey for two-factor. `npm publish` prompts through
the browser, which only works in an interactive terminal. A granular access
token with "bypass 2FA" would allow automation; until one exists, step 6 is a
person.
