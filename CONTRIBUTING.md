# Contributing to Astro Fleet

Thank you for your interest in contributing. This document covers how to report bugs, propose features, and submit pull requests.

## Reporting Bugs

Open a [GitHub Issue](https://github.com/indivar/astro-fleet/issues) and include:

- What you expected to happen
- What actually happened
- Steps to reproduce (minimal reproduction preferred)
- Environment: OS, Node/Bun version, Astro version

The more specific the reproduction steps, the faster we can address it.

## Proposing Features

Use [GitHub Discussions](https://github.com/indivar/astro-fleet/discussions) for feature proposals. Describe the use case first — what problem you're solving and who it affects — rather than jumping straight to the solution. This helps us evaluate fit and consider alternative approaches.

For small additions (a new component variant, a documentation improvement), a PR with a brief description is fine.

## Pull Request Process

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes. For new shared components, add them to `packages/shared-ui/`. For site-level changes, keep them scoped to the relevant `sites/` directory.

3. Verify the build passes before submitting:
   ```bash
   bun install
   bun run build
   ```

4. Submit a PR against `main` with a clear description of what changed and why.

We review PRs on a best-effort basis. Small, focused PRs with clear descriptions are reviewed faster.

## Component Conventions

When adding or modifying shared components in `packages/shared-ui/`:

- **Typed props** — Export a `Props` interface for every component. Use TypeScript strict mode. No `any`.
- **CSS variables for theming** — Use design token CSS variables (e.g. `var(--color-primary)`) rather than hardcoded color values or one-off Tailwind classes that bypass the token system.
- **No hardcoded content** — All text, URLs, and data must come through props or slots. Components should be blank canvases.
- **Slots for extensibility** — Use named Astro slots to allow callers to inject additional markup without forking the component.
- **Self-contained styles** — Scoped `<style>` blocks or Tailwind utility classes only. No global CSS side effects.

## Commit Message Format

Use conventional commits:

- `feat:` — new feature or component
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — build scripts, dependencies, tooling

Examples:
```
feat: add BreadcrumbNav shared component
fix: correct token fallback in Corporate preset
docs: add Vercel deployment example to deployment.md
chore: upgrade Astro to 5.3
```

## Code Style

- Follow the patterns established in existing files — indentation, import order, file naming.
- Astro components for UI, TypeScript for logic and utilities.
- Tailwind utility classes for layout and spacing; CSS variables for brand colors and typography.
- TypeScript strict mode is enabled in `tsconfig.base.json` — keep it that way.
- No `console.log` left in committed code.

## Questions

For general questions about using Astro Fleet, use [GitHub Discussions](https://github.com/indivar/astro-fleet/discussions). Issues are for bugs and confirmed feature requests only.
