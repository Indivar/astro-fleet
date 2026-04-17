import { cp, readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const PRESET_STYLES = {
  corporate: null,
  saas: {
    css: `@import "tailwindcss";

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
`,
    fonts: {
      heading: { name: 'Sora', weights: [400, 500, 600, 700, 800] },
      body: { name: 'Inter', weights: [400, 500, 600, 700] },
    },
  },
  warm: {
    css: `@import "tailwindcss";

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
`,
    fonts: {
      heading: { name: 'Playfair Display', weights: [400, 600, 700, 800] },
      body: { name: 'Source Sans 3', weights: [400, 500, 600, 700] },
    },
  },
};

function astroConfigFor(domain, preset) {
  const styles = PRESET_STYLES[preset];
  if (!styles) return null;
  const { fonts } = styles;
  return `import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.${domain}',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
  fonts: [
    {
      provider: fontProviders.google(),
      name: '${fonts.heading.name}',
      cssVariable: '--font-heading',
      weights: [${fonts.heading.weights.join(', ')}],
    },
    {
      provider: fontProviders.google(),
      name: '${fonts.body.name}',
      cssVariable: '--font-body',
      weights: [${fonts.body.weights.join(', ')}],
    },
  ],
});
`;
}

function titleCase(domain) {
  const base = domain.split('.')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function pathExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function replaceInFile(path, replacements) {
  const original = await readFile(path, 'utf8');
  let next = original;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== original) await writeFile(path, next);
}

export async function scaffoldSite({ rootDir, domain, preset }) {
  const sitesDir = join(rootDir, 'sites');
  const starterDir = join(sitesDir, 'starter');
  const targetDir = join(sitesDir, domain);

  if (!(await pathExists(starterDir))) {
    throw new Error(`Starter template not found at sites/starter in ${rootDir}.`);
  }
  if (await pathExists(targetDir)) {
    throw new Error(`sites/${domain} already exists.`);
  }

  await cp(starterDir, targetDir, {
    recursive: true,
    filter: (src) => !/[\\/](node_modules|dist|\.turbo|\.astro)($|[\\/])/.test(src),
  });

  const siteTitle = titleCase(domain);

  await replaceInFile(join(targetDir, 'astro.config.mjs'), [
    ['https://www.example.com', `https://www.${domain}`],
  ]);

  const robotsPath = join(targetDir, 'public', 'robots.txt');
  if (await pathExists(robotsPath)) {
    await replaceInFile(robotsPath, [
      ['https://www.example.com', `https://www.${domain}`],
    ]);
  }

  await replaceInFile(join(targetDir, 'package.json'), [
    ['"name": "starter"', `"name": "${domain}"`],
  ]);

  await replaceInFile(join(targetDir, 'src', 'lib', 'site-config.ts'), [
    ["'Starter Site'", `'${siteTitle}'`],
    ["'Built with Astro Fleet'", `'Powered by ${siteTitle}'`],
  ]);

  const styles = PRESET_STYLES[preset];
  if (styles) {
    await writeFile(join(targetDir, 'src', 'styles', 'global.css'), styles.css);
    await writeFile(join(targetDir, 'astro.config.mjs'), astroConfigFor(domain, preset));
  }

  return targetDir;
}
