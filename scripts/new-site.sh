#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Usage
if [ $# -lt 1 ]; then
  echo "Usage: ./scripts/new-site.sh <domain> [preset]"
  echo ""
  echo "  domain  — e.g. mydomain.com (becomes the site directory name)"
  echo "  preset  — corporate | saas | warm (default: corporate)"
  echo ""
  echo "Example:"
  echo "  ./scripts/new-site.sh acme.com saas"
  exit 1
fi

DOMAIN="$1"
PRESET="${2:-corporate}"

# Validate domain — alphanumeric, hyphens, dots only. Blocks path traversal and sed injection.
if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ ]] || [[ "$DOMAIN" == *..* ]]; then
  echo "Error: Invalid domain '$DOMAIN'. Use only letters, numbers, hyphens, and dots."
  exit 1
fi

# Validate preset
if [[ "$PRESET" != "corporate" && "$PRESET" != "saas" && "$PRESET" != "warm" ]]; then
  echo "Error: Invalid preset '$PRESET'. Choose: corporate, saas, or warm."
  exit 1
fi

# Check if site already exists
if [ -d "$ROOT_DIR/sites/$DOMAIN" ]; then
  echo "Error: sites/$DOMAIN already exists."
  exit 1
fi

# Check starter exists
if [ ! -d "$ROOT_DIR/sites/starter" ]; then
  echo "Error: sites/starter template not found."
  exit 1
fi

echo "Creating site: $DOMAIN (preset: $PRESET)"
echo ""

# 1. Copy starter
cp -r "$ROOT_DIR/sites/starter" "$ROOT_DIR/sites/$DOMAIN"

# 2. Update astro.config.mjs — replace example.com with the actual domain
sed -i'' -e "s|https://www.example.com|https://www.$DOMAIN|g" "$ROOT_DIR/sites/$DOMAIN/astro.config.mjs"
sed -i'' -e "s|https://www.example.com|https://www.$DOMAIN|g" "$ROOT_DIR/sites/$DOMAIN/public/robots.txt"

# 3. Update package.json — replace name
sed -i'' -e "s|\"name\": \"starter\"|\"name\": \"$DOMAIN\"|g" "$ROOT_DIR/sites/$DOMAIN/package.json"

# 4. Update site-config.ts — replace site name
# Title-case the domain name (strip TLD, capitalize first letter)
SITE_TITLE=$(echo "$DOMAIN" | sed 's/\..*//' | sed 's/./\U&/')
sed -i'' -e "s|'Starter Site'|'$SITE_TITLE'|g" "$ROOT_DIR/sites/$DOMAIN/src/lib/site-config.ts"
sed -i'' -e "s|'Built with Astro Fleet'|'Powered by $SITE_TITLE'|g" "$ROOT_DIR/sites/$DOMAIN/src/lib/site-config.ts"

# 5. Apply design preset — update CSS and astro.config.mjs fonts
if [ "$PRESET" = "saas" ]; then
  cat > "$ROOT_DIR/sites/$DOMAIN/src/styles/global.css" << 'CSSEOF'
@import "tailwindcss";

@theme {
  --color-primary: #0a0f14;
  --color-secondary: #1a1f2e;
  --color-accent: #34d399;
  --color-bg: #0d1117;
  --color-text: #e6edf3;
  --color-cta: #10b981;
  --color-text-secondary: #8b949e;
  --color-text-muted: #6e7681;
  --color-border: #30363d;
  --color-elevated: #161b22;
  --font-heading: 'Sora', sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; }
body {
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.15;
  color: var(--color-text);
}
a { color: inherit; text-decoration: none; }
a:hover { color: var(--color-accent); }
CSSEOF

  cat > "$ROOT_DIR/sites/$DOMAIN/astro.config.mjs" << CONFEOF
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.$DOMAIN',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Sora',
      cssVariable: '--font-heading',
      weights: [400, 500, 600, 700, 800],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700],
    },
  ],
});
CONFEOF

elif [ "$PRESET" = "warm" ]; then
  cat > "$ROOT_DIR/sites/$DOMAIN/src/styles/global.css" << 'CSSEOF'
@import "tailwindcss";

@theme {
  --color-primary: #1c1917;
  --color-secondary: #44403c;
  --color-accent: #d97706;
  --color-bg: #faf7f2;
  --color-text: #1c1917;
  --color-cta: #b45309;
  --color-text-secondary: #57534e;
  --color-text-muted: #78716c;
  --color-border: #e7e5e4;
  --color-elevated: #ffffff;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Source Sans 3', system-ui, -apple-system, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; }
body {
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.15;
  color: var(--color-text);
}
a { color: inherit; text-decoration: none; }
a:hover { color: var(--color-accent); }
CSSEOF

  cat > "$ROOT_DIR/sites/$DOMAIN/astro.config.mjs" << CONFEOF
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.$DOMAIN',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Playfair Display',
      cssVariable: '--font-heading',
      weights: [400, 600, 700, 800],
    },
    {
      provider: fontProviders.google(),
      name: 'Source Sans 3',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700],
    },
  ],
});
CONFEOF
fi

# 6. Clean up sed backup files (macOS sed creates .bak files with -i'')
find "$ROOT_DIR/sites/$DOMAIN" -name "*-e" -delete 2>/dev/null || true

echo "✓ Created sites/$DOMAIN"
echo ""
echo "Next steps:"
echo "  1. Edit sites/$DOMAIN/src/lib/site-config.ts with your site details"
echo "  2. Run: bun install"
echo "  3. Run: bun run dev --filter=$DOMAIN"
echo ""
echo "Preset: $PRESET"
echo "Config: sites/$DOMAIN/src/lib/site-config.ts"
echo "Styles: sites/$DOMAIN/src/styles/global.css"
