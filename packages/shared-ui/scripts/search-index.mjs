#!/usr/bin/env node
/**
 * The search index, shared by every site in the fleet.
 *
 * Built from the HTML that actually shipped, not from the source. A page whose
 * copy changed cannot then be missing from search, and a page that never
 * rendered cannot appear in it.
 *
 * Deliberately not a search library. These sites run from a dozen to forty
 * pages. A dependency that ships a WebAssembly runtime and its own index
 * format earns its size at a few thousand pages; here it would be most of the
 * JavaScript on sites whose floor is LCP under 2.5s on a mid-range phone.
 * The index is a JSON file, fetched on first use and never on load.
 *
 * Run it AFTER `astro build`, from the site directory:
 *
 *   node ../../packages/shared-ui/scripts/search-index.mjs
 *
 * Then add it to the site's build script, after the Astro build:
 *
 *   "build": "astro build && node ../../packages/shared-ui/scripts/search-index.mjs"
 *
 * Options, all optional:
 *   --dist <dir>     where the build is           (default: dist)
 *   --public <dir>   dev copy, so `astro dev` can serve it  (default: public)
 *   --exclude a,b    extra path prefixes to leave out
 *   --body <n>       characters of body text kept per page  (default: 1200)
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const DIST = arg('dist', 'dist');
const PUBLIC = arg('public', 'public');
const BODY_CHARS = Number(arg('body', '1200'));
const EXCLUDE = ['/lab/', ...arg('exclude', '').split(',').filter(Boolean)];

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return name.endsWith('.html') ? [p] : [];
  });
}

/** Visible words only: no script, style, nav, header or footer. */
function visible(html) {
  let h = html.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  h = h.replace(/<[^>]+>/g, ' ');
  h = h.replace(/&rsquo;|&#8217;/g, "'").replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  h = h.replace(/&[a-z]+;|&#\d+;/gi, ' ');
  return h.replace(/\s+/g, ' ').trim();
}

const attr = (html, re) => (html.match(re) || [, ''])[1];

if (!existsSync(DIST)) {
  console.error(`search-index: no ${DIST}/ directory. Run this after astro build.`);
  process.exit(1);
}

const docs = [];
for (const file of htmlFiles(DIST)) {
  const url = '/' + file.replace(`${DIST}/`, '').replace(/index\.html$/, '').replace(/\.html$/, '');
  if (url === '/404' || EXCLUDE.some((p) => url.startsWith(p))) continue;

  const html = readFileSync(file, 'utf8');
  // If it is not for search engines it is not for the reader either.
  if (/<meta\s+name="robots"[^>]*noindex/i.test(html)) continue;

  const h1 = visible(attr(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || '');
  const title = h1 || visible(attr(html, /<title>([\s\S]*?)<\/title>/i) || '');
  const desc = attr(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  // The section label in the margin, where a site has one.
  const rail = visible(attr(html, /<p class="rail"[^>]*>([\s\S]*?)<\/p>/i) || '');
  const heads = [...html.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => visible(m[2]))
    .filter(Boolean);

  /* The body is capped. Past roughly 1,200 characters a page matches on its
     own footnotes and the index doubles for results nobody scrolls to. */
  const body = visible(html).slice(0, BODY_CHARS);

  docs.push({ u: url, t: title, d: desc, r: rail, h: heads.slice(0, 12), b: body });
}

docs.sort((a, b) => a.u.localeCompare(b.u));
const json = JSON.stringify(docs);

writeFileSync(join(DIST, 'search-index.json'), json);

/* Also into public/, because `astro dev` serves from there and not from dist.
   Without it the search box in development returns nothing at all, silently,
   which is exactly the kind of fault that ships. Gitignore this copy. */
if (existsSync(PUBLIC)) writeFileSync(join(PUBLIC, 'search-index.json'), json);

const kb = (Buffer.byteLength(json) / 1024).toFixed(1);
console.log(`search-index: ${docs.length} page(s), ${kb} KB`);
