export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    cta: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  heroLayout: 'centered' | 'split' | 'fullwidth';
  ctaStyle: 'rounded' | 'square' | 'pill';
  spacing: 'compact' | 'normal' | 'spacious';
}

export const CORPORATE: DesignTokens = {
  colors: {
    primary: '#1e3a5f',
    secondary: '#2d4a6f',
    accent: '#2563eb',
    background: '#ffffff',
    text: '#1a1a1a',
    cta: '#2563eb',
  },
  fonts: {
    heading: 'Inter',
    body: 'system-ui, -apple-system, sans-serif',
  },
  heroLayout: 'split',
  ctaStyle: 'rounded',
  spacing: 'normal',
};

export const SAAS: DesignTokens = {
  colors: {
    primary: '#0a0f14',
    secondary: '#1a1f2e',
    accent: '#34d399',
    background: '#0d1117',
    text: '#e6edf3',
    cta: '#10b981',
  },
  fonts: {
    heading: 'Sora',
    body: 'Inter, system-ui, sans-serif',
  },
  heroLayout: 'centered',
  ctaStyle: 'pill',
  spacing: 'spacious',
};

export const WARM: DesignTokens = {
  colors: {
    primary: '#1c1917',
    secondary: '#44403c',
    accent: '#d97706',
    background: '#faf7f2',
    text: '#1c1917',
    cta: '#b45309',
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Source Sans 3, system-ui, sans-serif',
  },
  heroLayout: 'fullwidth',
  ctaStyle: 'square',
  spacing: 'normal',
};

export const ALL_PRESETS: Record<string, DesignTokens> = {
  corporate: CORPORATE,
  saas: SAAS,
  warm: WARM,
};
