# Framework Integrations & Astro Capabilities

Astro Fleet's 22 shared components are built as native `.astro` files — pure HTML templates with scoped CSS and zero framework dependencies. This is a deliberate choice: it means you can use **any** UI framework alongside them, or none at all.

This guide covers how to add interactive framework components to your Fleet sites, and how to take advantage of Astro's broader feature set.

---

## Framework-agnostic by design

Every component in `packages/shared-ui/` is a `.astro` file. At build time, Astro renders it to static HTML. No React runtime, no Vue reactivity system, no Svelte compiler output is shipped to the browser.

**Why this matters:**

- **No lock-in.** You're not forced into React because the starter uses React. You pick the framework that fits your team.
- **Zero JS by default.** A page built entirely from Astro Fleet components ships zero client-side JavaScript. Your Lighthouse performance score starts at 100, not 60.
- **Mix and match.** You can drop a React chart into a page that uses Astro Fleet's header, footer, and layout — they coexist without conflict.

---

## Adding a UI framework

Astro supports **React, Vue, Svelte, Solid, Preact, Alpine.js, and Lit** as first-class integrations. Install one (or several) when you need client-side interactivity that pure HTML can't handle.

### When to add a framework

You need a framework when the component requires **client-side state, event handling, or reactivity** — things that can't be done with static HTML and CSS alone:

- Interactive dashboards or data visualisations
- Real-time search/filter with instant feedback
- Complex form wizards with multi-step state
- Animated UI that responds to user input (not just CSS hover/scroll)
- Components you've already built in React/Vue/Svelte and want to reuse

You **don't** need a framework for:

- Navigation, headers, footers (Astro Fleet handles these)
- Static content sections (hero, features, pricing, FAQ, testimonials)
- Forms that submit to a backend (standard HTML `<form>` works)
- Accordions and tabs (CSS-only solutions work — see FAQ and Tabs components)
- Carousels (HeroSlider and TestimonialSlider use minimal vanilla JS)

### Install a framework integration

```bash
# React
bunx astro add react

# Vue
bunx astro add vue

# Svelte
bunx astro add svelte

# Solid
bunx astro add solid-js

# Preact (lighter alternative to React)
bunx astro add preact
```

This adds the integration to your site's `astro.config.mjs` automatically:

```js
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';  // ← added

export default defineConfig({
  site: 'https://www.yourdomain.com',
  integrations: [sitemap(), react()],  // ← added
  vite: { plugins: [tailwindcss()] },
  output: 'static',
  fonts: [ /* ... */ ],
});
```

### Using framework components alongside Astro Fleet

Once installed, create `.jsx`, `.tsx`, `.vue`, or `.svelte` files anywhere in your site's `src/` directory and import them into your Astro pages:

```astro
---
// src/pages/dashboard.astro
import BaseLayout from '@astro-fleet/shared-ui/src/layouts/BaseLayout.astro';
import StatsBar from '@astro-fleet/shared-ui/src/components/StatsBar.astro';
import FAQ from '@astro-fleet/shared-ui/src/components/FAQ.astro';
import { SITE_NAME, navigation, footerColumns } from '../lib/site-config';
import { CORPORATE } from '@astro-fleet/config/tokens';

// Your React component
import AnalyticsDashboard from '../components/AnalyticsDashboard';
---

<BaseLayout
  title="Dashboard"
  siteName={SITE_NAME}
  navigation={navigation}
  footerColumns={footerColumns}
  designTokens={CORPORATE}
>
  <StatsBar items={stats} />

  <!-- React component with client-side interactivity -->
  <AnalyticsDashboard client:load />

  <FAQ items={faqs} />
</BaseLayout>
```

### Client directives — controlling when JS loads

The `client:*` directive tells Astro when to hydrate your framework component. This is Astro's **Islands Architecture** — only the interactive parts of a page ship JavaScript:

| Directive | When it hydrates | Use when |
|-----------|-----------------|----------|
| `client:load` | Immediately on page load | Critical interactive content (search bars, auth UI) |
| `client:idle` | After the page is idle | Non-critical widgets (chat, analytics dashboards) |
| `client:visible` | When scrolled into view | Below-the-fold content (charts, maps, comments) |
| `client:media="(max-width: 768px)"` | When media query matches | Mobile-only interactions |
| `client:only="react"` | Client-side only, no SSR | Components that can't be server-rendered |

**Best practice:** Use `client:visible` or `client:idle` by default. Only use `client:load` for above-the-fold interactive content. This keeps your page fast while still enabling rich interactivity where needed.

```astro
<!-- This chart only loads JS when the user scrolls to it -->
<RevenueChart client:visible data={chartData} />

<!-- This search bar loads immediately because it's above the fold -->
<SearchBar client:load placeholder="Search products..." />

<!-- This chat widget loads after the page is idle -->
<LiveChat client:idle />
```

### Using multiple frameworks on one site

Astro supports using multiple frameworks simultaneously. Each component is its own island:

```bash
bunx astro add react
bunx astro add svelte
```

```astro
---
import ReactChart from '../components/ReactChart';
import SvelteForm from '../components/SvelteForm.svelte';
---

<!-- React and Svelte components on the same page -->
<ReactChart client:visible data={chartData} />
<SvelteForm client:load />
```

This is useful when migrating from one framework to another, or when different team members prefer different tools. Each component bundles only its own framework runtime.

---

## Sharing components across sites

If you build a React/Vue/Svelte component that multiple sites need, you have two options:

### Option 1: Add to shared-ui (recommended for Astro components)

If the component is an `.astro` file (or can be), add it to `packages/shared-ui/src/components/`. This is the simplest path — it works exactly like the existing 22 components.

### Option 2: Create a new shared package (for framework components)

If the component is a `.tsx` or `.svelte` file that needs its framework runtime:

```bash
mkdir -p packages/shared-interactive/src/components
```

Create a `package.json`:

```json
{
  "name": "@astro-fleet/shared-interactive",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./*": "./src/*"
  }
}
```

Add it as a dependency to sites that need it:

```json
{
  "dependencies": {
    "@astro-fleet/shared-interactive": "workspace:*"
  }
}
```

Then import from any site:

```astro
import Chart from '@astro-fleet/shared-interactive/components/Chart';
```

---

## Astro capabilities you can adopt

Beyond framework integrations, Astro 6 has several features that work well with Astro Fleet. Here's what's available and when to use each.

### View Transitions (page morphing)

Astro's built-in view transitions create smooth, app-like page navigation without a client-side router. Pages morph between each other instead of doing a full reload.

```astro
---
// In your BaseLayout or page head
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />
</head>
```

Elements with matching `transition:name` attributes animate between pages:

```astro
<!-- On the list page -->
<h2 transition:name="post-title">Article Title</h2>

<!-- On the detail page — same transition:name, Astro morphs between them -->
<h1 transition:name="post-title">Article Title</h1>
```

**When to use:** Sites that feel like apps — SaaS dashboards, documentation sites, portfolios. Not necessary for simple marketing sites where standard navigation is fine.

### Content Collections

Astro's content collections let you organise Markdown/MDX content with TypeScript-enforced schemas. Ideal for blogs, documentation, case studies, or any content-heavy section.

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
```

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
---
{posts.map(post => <article><h2>{post.data.title}</h2></article>)}
```

**When to use:** Any site that has structured content authored in Markdown — blogs, docs, changelogs, team bios, case studies.

### Image Optimization

Astro's built-in `<Image />` component automatically optimises images — resizing, format conversion (WebP/AVIF), and preventing layout shift:

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---
<Image src={heroImage} alt="Hero banner" width={1200} height={600} />
```

**Benefits over a plain `<img>`:**
- Automatic format conversion (serves WebP/AVIF to supported browsers)
- Prevents Cumulative Layout Shift (CLS) by setting width/height
- Lazy loading by default
- Responsive `srcset` generation

**When to use:** Always, for any image that isn't an SVG or icon. Especially important for hero images, product photos, and team headshots.

### Middleware

Astro middleware runs before every request, useful for authentication, logging, redirects, or injecting data:

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  response.headers.set('X-Custom-Header', 'Astro Fleet');
  return response;
});
```

**When to use:** Server-rendered sites (`output: 'server'` or `output: 'hybrid'`) that need request-level logic. Not applicable to fully static sites (our default).

### Actions (type-safe backend functions)

Astro Actions let you define type-safe server functions that your pages can call:

```typescript
// src/actions/index.ts
import { defineAction, z } from 'astro:actions';

export const server = {
  submitContact: defineAction({
    input: z.object({
      name: z.string(),
      email: z.string().email(),
      message: z.string(),
    }),
    handler: async (input) => {
      // Send email, save to database, etc.
      return { success: true };
    },
  }),
};
```

**When to use:** When you need server-side logic (form handling, API calls, database writes) without building a separate API. Requires `output: 'server'` or `output: 'hybrid'`.

### Prefetching

Astro can prefetch links when they come into view or on hover, making subsequent page loads feel instant:

```js
// astro.config.mjs
export default defineConfig({
  prefetch: {
    prefetchAll: true,         // prefetch all links
    defaultStrategy: 'hover',  // or 'viewport', 'load'
  },
});
```

**When to use:** Marketing sites and documentation where users browse multiple pages. The default `hover` strategy is a good balance — it prefetches when the user moves their cursor toward a link, adding ~100ms head start.

### Content Security Policy (CSP)

New in Astro 6 — automatic CSP header generation to protect against XSS attacks:

```js
// astro.config.mjs
export default defineConfig({
  security: {
    csp: true,  // automatic hash-based CSP for scripts and styles
  },
});
```

**When to use:** Any production site, especially those handling user data. CSP is a defence-in-depth measure that prevents inline script injection even if an XSS vulnerability exists.

### Environment Variables

Astro 6 inlines `import.meta.env` values at build time. Remember that values are always strings:

```js
// Correct
const isEnabled = import.meta.env.FEATURE_FLAG === 'true';

// Incorrect (won't work as expected in Astro 6)
const isEnabled = import.meta.env.FEATURE_FLAG; // this is a string, not boolean
```

Public env vars (prefixed with `PUBLIC_`) are available in client-side code. Private vars are only available server-side.

---

## Architecture decision: when to use what

| Need | Solution | JS shipped? |
|------|----------|------------|
| Static content (text, images, cards) | `.astro` components (Astro Fleet) | None |
| Form submission | HTML `<form>` + backend endpoint | None |
| Accordion, tabs | CSS-only (FAQ, details/summary) | None |
| Carousel | Vanilla JS (HeroSlider, TestimonialSlider) | ~1KB |
| Interactive chart/dashboard | React/Vue/Svelte + `client:visible` | Framework runtime |
| Real-time search/filter | React/Vue/Svelte + `client:load` | Framework runtime |
| Complex multi-step form | React/Vue/Svelte + `client:load` | Framework runtime |
| Full SPA-like experience | Consider Next.js/SvelteKit instead | Everything |

**The rule of thumb:** Start with Astro Fleet's static components. Add a framework component only when you hit something that genuinely requires client-side state. Most marketing sites, corporate sites, and restaurants never need to.

---

## Recommended reading

- [Astro Documentation](https://docs.astro.build/) — the official docs, comprehensive and well-maintained
- [Astro Islands](https://docs.astro.build/en/concepts/islands/) — understanding the partial hydration architecture
- [Framework Integrations](https://docs.astro.build/en/guides/framework-components/) — detailed setup for each framework
- [Content Collections](https://docs.astro.build/en/guides/content-collections/) — organising Markdown/MDX with schemas
- [View Transitions](https://docs.astro.build/en/guides/view-transitions/) — smooth page-to-page animations
- [Astro Actions](https://docs.astro.build/en/guides/actions/) — type-safe server functions
- [Image Optimization](https://docs.astro.build/en/guides/images/) — automatic image processing
