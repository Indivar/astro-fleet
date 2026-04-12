# Design Tokens

Design tokens are typed constants that define a site's visual identity — colors, typography, layout choices, and spacing scale. In Astro Fleet, tokens are defined once per site and converted to CSS custom properties at build time, so every component picks them up automatically without any per-component configuration.

## The DesignTokens interface

Defined in `packages/config/src/tokens.ts`:

```ts
export interface DesignTokens {
  colors: {
    primary:    string;   // dominant brand color (backgrounds, dark surfaces)
    secondary:  string;   // secondary brand color (subtle backgrounds, borders)
    accent:     string;   // interactive color (links, hover states, icons)
    background: string;   // page background
    text:       string;   // default body text
    cta:        string;   // call-to-action button fill
  };
  fonts: {
    heading: string;   // font-family value for headings
    body:    string;   // font-family value for body text
  };
  heroLayout: 'centered' | 'split' | 'fullwidth';
  ctaStyle:   'rounded' | 'square' | 'pill';
  spacing:    'compact' | 'normal' | 'spacious';
}
```

## Three built-in presets

### CORPORATE

Navy/blue palette. Professional, trust-building. Suited to B2B services, consulting, enterprise software.

```ts
colors: {
  primary:    '#1e3a5f',
  secondary:  '#2d4a6f',
  accent:     '#2563eb',
  background: '#ffffff',
  text:       '#1a1a1a',
  cta:        '#2563eb',
}
fonts:      { heading: 'Inter', body: 'system-ui, -apple-system, sans-serif' }
heroLayout: 'split'
ctaStyle:   'rounded'
spacing:    'normal'
```

### SAAS

Dark mode. Emerald accents on near-black backgrounds. Suited to developer tools, SaaS products, tech startups.

```ts
colors: {
  primary:    '#0a0f14',
  secondary:  '#1a1f2e',
  accent:     '#34d399',
  background: '#0d1117',
  text:       '#e6edf3',
  cta:        '#10b981',
}
fonts:      { heading: 'Sora', body: 'Inter, system-ui, sans-serif' }
heroLayout: 'centered'
ctaStyle:   'pill'
spacing:    'spacious'
```

### WARM

Cream/stone palette. Amber accents. Serif headings. Suited to editorial brands, agencies, hospitality, artisan products.

```ts
colors: {
  primary:    '#1c1917',
  secondary:  '#44403c',
  accent:     '#d97706',
  background: '#faf7f2',
  text:       '#1c1917',
  cta:        '#b45309',
}
fonts:      { heading: 'Playfair Display', body: 'Source Sans 3, system-ui, sans-serif' }
heroLayout: 'fullwidth'
ctaStyle:   'square'
spacing:    'normal'
```

## How tokensToCSSVars() works

Defined in `packages/config/src/css.ts`:

```ts
export function tokensToCSSVars(tokens: DesignTokens): string {
  return [
    `  --color-primary: ${tokens.colors.primary};`,
    `  --color-secondary: ${tokens.colors.secondary};`,
    `  --color-accent: ${tokens.colors.accent};`,
    `  --color-background: ${tokens.colors.background};`,
    `  --color-text: ${tokens.colors.text};`,
    `  --color-cta: ${tokens.colors.cta};`,
    `  --font-heading: ${tokens.fonts.heading};`,
    `  --font-body: ${tokens.fonts.body};`,
    `  --hero-layout: ${tokens.heroLayout};`,
    `  --cta-style: ${tokens.ctaStyle};`,
    `  --spacing: ${tokens.spacing};`,
  ].join('\n');
}
```

It takes a `DesignTokens` object and returns a string of CSS custom property declarations. `BaseLayout` calls this function and injects the result into a `<style>` block on `:root`:

```astro
{cssVars && (
  <style set:html={`:root { ${cssVars} }`} />
)}
```

This means the CSS variables are available to every element on the page, including all shared-ui components and your own page-level CSS.

## How global.css consumes the variables

Each site's `src/styles/global.css` imports Tailwind and declares the same CSS custom properties directly for the Tailwind `@theme` layer. For the `saas` preset it looks like:

```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&...');
@import "tailwindcss";

@theme {
  --color-primary:   #0a0f14;
  --color-accent:    #34d399;
  --color-bg:        #0d1117;
  --font-heading:    'Sora', sans-serif;
  --font-body:       'Inter', system-ui, -apple-system, sans-serif;
  /* … */
}
```

The variables in `global.css` set the baseline. The `tokensToCSSVars()` injection in `BaseLayout` can override them at the `:root` level, which is useful when you want to switch tokens programmatically (e.g. from a CMS) without editing `global.css`.

## Creating a custom preset

Add a new export to `packages/config/src/tokens.ts` (or define it inline in your site):

```ts
import type { DesignTokens } from '@astro-fleet/config';

export const BRAND: DesignTokens = {
  colors: {
    primary:    '#0f172a',
    secondary:  '#1e293b',
    accent:     '#f59e0b',
    background: '#ffffff',
    text:       '#0f172a',
    cta:        '#d97706',
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body:    "'DM Sans', system-ui, sans-serif",
  },
  heroLayout: 'split',
  ctaStyle:   'rounded',
  spacing:    'normal',
};
```

Then pass it to `BaseLayout`:

```astro
<BaseLayout designTokens={BRAND} ...>
```

Remember to load the Google Fonts for any custom typefaces in your site's `global.css` `@import` statement.

## Changing a site's branding after creation

1. Open `sites/<domain>/src/styles/global.css` and update the color and font values in the `@theme` block.
2. If you are passing `designTokens` to `BaseLayout` in your pages, update the preset import or swap in a custom preset object.
3. Rebuild: `bun run build --filter=<domain>`

Changing `--color-accent` in one place updates every button hover, every icon, every focus ring, every active nav link — across the entire site.
