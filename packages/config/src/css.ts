import type { DesignTokens } from './tokens';

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
