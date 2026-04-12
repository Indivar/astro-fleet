import type { DesignTokens } from '@astro-fleet/config';

export function tokensToCSSVars(tokens: DesignTokens): string {
  return `
    --color-primary: ${tokens.colors.primary};
    --color-secondary: ${tokens.colors.secondary};
    --color-accent: ${tokens.colors.accent};
    --color-background: ${tokens.colors.background};
    --color-text: ${tokens.colors.text};
    --color-cta: ${tokens.colors.cta};
    --font-heading: ${tokens.fonts.heading};
    --font-body: ${tokens.fonts.body};
  `.trim();
}

export function tokensToCSSVarsObject(tokens: DesignTokens): Record<string, string> {
  return {
    'color-primary': tokens.colors.primary,
    'color-secondary': tokens.colors.secondary,
    'color-accent': tokens.colors.accent,
    'color-background': tokens.colors.background,
    'color-text': tokens.colors.text,
    'color-cta': tokens.colors.cta,
    'font-heading': tokens.fonts.heading,
    'font-body': tokens.fonts.body,
  };
}

export function getSpacingScale(spacing: DesignTokens['spacing']): {
  section: string;
  block: string;
  element: string;
} {
  switch (spacing) {
    case 'compact':
      return { section: '3rem', block: '1.5rem', element: '0.75rem' };
    case 'spacious':
      return { section: '8rem', block: '3rem', element: '1.5rem' };
    case 'normal':
    default:
      return { section: '5rem', block: '2rem', element: '1rem' };
  }
}

export function getCTABorderRadius(ctaStyle: DesignTokens['ctaStyle']): string {
  switch (ctaStyle) {
    case 'square':
      return '0';
    case 'pill':
      return '9999px';
    case 'rounded':
    default:
      return '0.5rem';
  }
}
