/**
 * i18n-build: write the translated copies of a built site into dist/<locale>/.
 *
 * Runs after `astro build`, reads the English pages the build just produced,
 * and emits one directory per locale. English keeps the root, so every URL that
 * ranks today is untouched: /products/ stays /products/ and Hindi lives at
 * /hi/products/.
 *
 * A PAGE ONLY EXISTS IN A LANGUAGE ONCE IT IS TRANSLATED (owner, 2026-09-09)
 * -------------------------------------------------------------------------
 * The first version of this script emitted a directory for every locale listed
 * in locales.json whether or not a dictionary existed, and the switcher offered
 * all twelve. Nine of them had no dictionary at all, so /bn/ was the English
 * page at a Bengali URL: the owner picked Bengali, the menu did not move, and
 * nothing else on the page moved either. That is worse than not offering it.
 *
 * So coverage is measured before anything is written, and it is measured PER
 * PAGE, not per site. A page is written in a locale only if that locale
 * translates at least `minCoverage` of the units on that page (default 0.9).
 * Per page rather than per site because a site-wide bar holds the whole
 * language hostage to its longest tail: a blog archive can easily be a fifth of
 * a site's units, and there is no reason the product pages should wait for it.
 * The
 * consequences of a page not qualifying are followed through everywhere:
 *
 *   - the page is not written in that locale, so there is no half-English URL
 *   - the switcher on every page offers only the locales that have THAT page
 *   - links pointing at it from inside the locale stay on the English URL,
 *     so a reader is never sent to a 404
 *   - it gets no hreflang alternate in that locale
 *
 * A locale ships at all only if its home page qualifies, because a language
 * whose front door is missing has no entry point. Everything withheld is named
 * in the build output with the number it reached.
 *
 * WHAT IT DOES TO EACH PAGE
 *   - replaces every unit and readable attribute with its translation
 *   - sets <html lang>
 *   - rewrites internal links so a visitor stays inside their language
 *   - writes hreflang alternates for every shipped locale plus x-default, on
 *     the English pages as well, because hreflang has to be reciprocal
 *   - points canonical at the locale's own URL
 *   - adds noindex to any locale not yet marked reviewed, so Google only ever
 *     sees a language a person has read (owner's decision, 2026-09-09)
 *   - prunes the switcher down to the languages that actually shipped
 *   - marks the file so the extractor never reads its own output back in
 *
 * PLACEHOLDERS
 * A unit's inline tags travel as <0>…</0>. A translation that drops or invents
 * one is rejected and the English is kept, because a lost </0> silently eats the
 * rest of a paragraph and no gate downstream would catch it.
 *
 * Run:  node packages/shared-ui/scripts/i18n-build.mjs <site-dir>
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { walk, toUnit, narrow, norm, translatable, id, VOID } from './i18n-extract.mjs';

const ASSET = /\.(css|js|mjs|json|xml|txt|png|jpe?g|webp|avif|svg|gif|ico|pdf|woff2?|mp4|webm|zip)$/i;

/** Below this share of the site's distinct units, a language does not ship. */
const DEFAULT_MIN_COVERAGE = 0.9;

function* htmlFiles(dir, locales) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (locales.has(e)) continue;
      yield* htmlFiles(p, locales);
    } else if (e.endsWith('.html')) yield p;
  }
}

/** Same placeholder shape the extractor produced, with the real tags put back. */
function restore(translated, tags) {
  let out = translated;
  let ok = true;
  out = out.replace(/<(\d+)\/>/g, (_m, n) => tags[+n] ?? ((ok = false), ''));
  out = out.replace(/<(\d+)>/g, (_m, n) => tags[+n] ?? ((ok = false), ''));
  out = out.replace(/<\/(\d+)>/g, (_m, n) => {
    const open = tags[+n];
    if (!open) { ok = false; return ''; }
    const name = /^<\s*([a-zA-Z][\w-]*)/.exec(open);
    return name ? `</${name[1]}>` : ((ok = false), '');
  });
  // A stray placeholder the translator invented, or one it failed to close.
  if (/<\/?\d+\/?>/.test(out)) ok = false;
  return ok ? out : null;
}

// U+00A0 goes back out as &nbsp;. It arrives as a real character so a translator
// can see and keep it; written raw it is invisible in the source and easy to
// lose on the next edit.
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00A0/g, '&nbsp;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

/** The translation for a key, or undefined. Entries are { en, t } or a bare string. */
function lookup(dict, key) {
  const entry = dict[key];
  const t = typeof entry === 'string' ? entry : entry && entry.t;
  return t || undefined;
}

/** Strip alternates from a previous run so re-running never duplicates them. */
const stripAlternates = (html) => html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>\n?/g, '');

/** The page path a site-root href points at, or null if it is not a page. */
function pageTarget(href) {
  const clean = href.split('?')[0].split('#')[0];
  if (!clean.startsWith('/') || clean.startsWith('//')) return null;
  if (ASSET.test(clean)) return null;
  return clean.endsWith('/') ? clean : clean + '/';
}

function main() {
  const siteDir = process.argv[2];
  if (!siteDir) { console.error('usage: node i18n-build.mjs <site-dir>'); process.exit(1); }
  const dist = join(siteDir, 'dist');
  const i18nDir = join(siteDir, 'i18n');
  const cfgPath = join(i18nDir, 'locales.json');
  if (!existsSync(cfgPath)) { console.log('i18n-build: no i18n/locales.json, skipping.'); return; }
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  const site = cfg.site.replace(/\/$/, '');
  const minCoverage = typeof cfg.minCoverage === 'number' ? cfg.minCoverage : DEFAULT_MIN_COVERAGE;
  const locales = cfg.locales.filter((l) => l.code !== 'en');
  const codes = new Set(locales.map((l) => l.code));

  const dicts = new Map();
  for (const l of locales) {
    const p = join(i18nDir, `${l.code}.json`);
    dicts.set(l.code, existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {});
  }

  // Last run's directories go regardless, so a page or a language that fell
  // below the bar cannot linger as a stale copy of an older build.
  for (const code of codes) rmSync(join(dist, code), { recursive: true, force: true });

  const pages = [...htmlFiles(dist, codes)];

  // Pass 1: read every English page once, collect its edits and its key set.
  // Coverage has to be known before a single locale file is written, and it has
  // to be known for every page before any page is written, because a page's
  // links depend on which OTHER pages exist in the same language.
  const pageEdits = new Map();
  const pageKeys = new Map();
  const pagePath = new Map();
  for (const file of pages) {
    const english = readFileSync(file, 'utf8');
    const edits = [];
    walk(
      english,
      (s2, e2) => {
        const [a, b] = narrow(english, s2, e2);
        const { text, tags } = toUnit(english.slice(a, b));
        if (translatable(text)) edits.push({ start: a, end: b, key: id(text), en: text, tags, unit: true });
      },
      (s2, e2, value) => {
        const t = norm(value);
        if (translatable(t)) edits.push({ start: s2, end: e2, key: id(t), en: t, attr: true });
      },
    );
    edits.sort((a, b) => a.start - b.start);
    pageEdits.set(file, edits);
    pageKeys.set(file, new Set(edits.map((ed) => ed.key)));
    pagePath.set(file, ('/' + relative(dist, file).replace(/\\/g, '/')).replace(/index\.html$/, ''));
  }

  // The gate, page by page.
  const qualified = new Map(locales.map((l) => [l.code, new Set()]));
  // Distinct units, not occurrences. A header string sits on all 79 pages, so
  // counting occurrences reports the site chrome as half the site: that is the
  // arithmetic that let the first version of this claim 45% while the body copy
  // was untouched. One unit, counted once, however many pages carry it.
  const allKeys = new Set();
  for (const file of pages) for (const k of pageKeys.get(file)) allKeys.add(k);
  const localeStats = new Map(locales.map((l) => [l.code, { pages: 0, have: 0 }]));
  for (const l of locales) {
    const dict = dicts.get(l.code);
    const st = localeStats.get(l.code);
    for (const k of allKeys) if (lookup(dict, k)) st.have++;
    for (const file of pages) {
      const keys = pageKeys.get(file);
      let have = 0;
      for (const k of keys) if (lookup(dict, k)) have++;
      if (!keys.size || have / keys.size >= minCoverage) {
        qualified.get(l.code).add(pagePath.get(file));
        st.pages++;
      }
    }
  }
  // A language with no home page has no front door, so it does not ship at all.
  const shipping = locales.filter((l) => qualified.get(l.code).has('/'));
  const shipped = new Set(shipping.map((l) => l.code));
  for (const l of locales) if (!shipped.has(l.code)) qualified.get(l.code).clear();

  /** Where a link should point for a reader inside `code`. */
  function localisePath(path, code) {
    if (code === 'en') return path;
    const target = pageTarget(path);
    if (!target) return path;                                  // asset, external, anchor
    if (!qualified.get(code) || !qualified.get(code).has(target)) return path; // untranslated: stay in English
    return `/${code}${path}`;
  }

  /**
   * Write the switcher's list: English plus the languages that have THIS page.
   * Generated rather than pruned, so running the step twice is the same as
   * running it once. The <details> stays hidden until there is a real choice.
   */
  function renderSwitcher(html, path, current) {
    const here = shipping.filter((l) => qualified.get(l.code).has(path));
    const entries = here.length
      ? [{ code: 'en', label: 'English', english: 'English' }, ...here]
      : [];

    // Astro scopes a component's CSS by stamping data-astro-cid-xxxx on every
    // element it renders, and the selectors it emits require that attribute.
    // These entries are written after the build, so without copying the scope
    // off the <ul> they match none of the switcher's own rules: the list lost
    // its flex row, its padding and its gap, and every entry rendered as
    // "हिन्दीHindi", the native name and the English name run together.
    const listTag = /<ul\b[^>]*\bdata-i18n-list\b[^>]*>/.exec(html);
    const cid = listTag && /\bdata-astro-cid-[\w-]+/.exec(listTag[0]);
    const scope = cid ? ` ${cid[0]}` : '';

    const items = entries.map((l) => {
      const href = l.code === 'en' ? path : `/${l.code}${path}`;
      const cur = l.code === current ? ' aria-current="true"' : '';
      return `<li data-i18n-entry="${l.code}"${scope}><a class="langsw__item" data-i18n-to="${l.code}"`
        + ` hreflang="${l.code}" lang="${l.code}" href="${href}"${cur}${scope}>`
        + `<span class="langsw__native"${scope}>${escAttr(l.label)}</span>`
        + `<span class="langsw__english"${scope}>${escAttr(l.english)}</span></a></li>`;
    }).join('');

    let out = html.replace(/(<ul\b[^>]*\bdata-i18n-list\b[^>]*>)[\s\S]*?(<\/ul>)/, `$1${items}$2`);
    out = out.replace(/(<details\b[^>]*\bdata-i18n-switcher\b[^>]*?)\s+hidden(?=[\s>])/, '$1');
    if (!entries.length) {
      out = out.replace(/(<details\b[^>]*\bdata-i18n-switcher\b[^>]*?)(\s*\/?>)/, '$1 hidden$2');
    }
    out = out.replace(/(<details\b[^>]*\bdata-i18n-switcher\b[^>]*)data-i18n-current="[^"]*"/, `$1data-i18n-current="${current}"`);
    return out;
  }

  function alternatesFor(path) {
    const here = shipping.filter((l) => qualified.get(l.code).has(path));
    if (!here.length) return '';
    return [
      `<link rel="alternate" hreflang="x-default" href="${site}${path}" />`,
      `<link rel="alternate" hreflang="en" href="${site}${path}" />`,
      ...here.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${site}/${l.code}${path}" />`),
    ].join('\n');
  }

  const stats = new Map(shipping.map((l) => [l.code, { done: 0, missing: 0, rejected: 0 }]));

  for (const file of pages) {
    const path = pagePath.get(file);
    const english = readFileSync(file, 'utf8');
    const edits = pageEdits.get(file);

    for (const l of shipping) {
      if (!qualified.get(l.code).has(path)) continue;
      const dict = dicts.get(l.code);
      const st = stats.get(l.code);
      let out = '';
      let cursor = 0;
      for (const ed of edits) {
        if (ed.start < cursor) continue; // overlapping range, keep the outer one
        out += english.slice(cursor, ed.start);
        // A dictionary entry is { en, t }: the English is carried beside the
        // translation so a native reviewer can read the file without also
        // holding the English site open. A bare string is accepted too.
        const tr = lookup(dict, ed.key);
        let replacement = null;
        if (tr) {
          if (ed.unit) {
            replacement = restore(tr, ed.tags);
            if (replacement === null) st.rejected++;
          } else {
            replacement = escAttr(tr);
          }
        }
        if (replacement === null || replacement === undefined) {
          if (!tr) st.missing++;
          out += english.slice(ed.start, ed.end);
        } else {
          st.done++;
          out += replacement;
        }
        cursor = ed.end;
      }
      out += english.slice(cursor);

      // Locale plumbing.
      out = out.replace(/<html([^>]*)\blang="[^"]*"/i, `<html$1lang="${l.code}"`);
      out = out.replace(/<html(?![^>]*\blang=)/i, `<html lang="${l.code}"`);
      out = out.replace(/<html/i, `<html data-i18n-generated="${l.code}"`);

      // Links stay inside the language only where the language has the page.
      out = out.replace(/\b(href|action)="(\/[^"#][^"]*|\/)"/g, (m, a, p) => `${a}="${localisePath(p, l.code)}"`);
      // The switcher is the one place that must point OUT of this language.
      out = renderSwitcher(out, path, l.code);

      // Canonical and alternates.
      out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${site}/${l.code}${path}" />`);
      out = stripAlternates(out);
      const alts = alternatesFor(path);
      if (alts) out = out.replace(/<\/head>/i, `${alts}\n</head>`);

      // Unreviewed languages are live for visitors and invisible to search
      // until a native reader has passed them.
      if (!l.reviewed) {
        out = out.replace(/<meta name="robots"[^>]*>/i, '');
        out = out.replace(/<\/head>/i, '<meta name="robots" content="noindex, follow" />\n</head>');
      }

      // A void element has no closing tag, so one in the output means a
      // placeholder was rebuilt as an open/close pair and every tag after it
      // is nested one level too deep. It cost a blog card its thumbnail and
      // swallowed the card text; it must never leave the build again.
      const stray = new RegExp(`</(${[...VOID].join('|')})\\s*>`, 'i').exec(out);
      if (stray) {
        console.error(`i18n-build: ${l.code}${path} rebuilt a void element as a pair: ${stray[0]}`);
        process.exitCode = 1;
      }

      const dest = join(dist, l.code, relative(dist, file));
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, out);
    }

    // The English page is rewritten too: its switcher must not offer a language
    // that does not have this page, and hreflang has to point both ways.
    let root = renderSwitcher(english, path, 'en');
    root = stripAlternates(root);
    const alts = alternatesFor(path);
    if (alts) root = root.replace(/<\/head>/i, `${alts}\n</head>`);
    if (root !== english) writeFileSync(file, root);
  }

  // Sitemaps: reviewed locales only, and only the pages that exist in them.
  const reviewed = shipping.filter((l) => l.reviewed);
  for (const l of reviewed) {
    const urls = [...qualified.get(l.code)]
      .filter((p) => !p.endsWith('404.html'))
      .sort()
      .map((p) => `  <url><loc>${site}/${l.code}${p}</loc></url>`)
      .join('\n');
    writeFileSync(join(dist, `sitemap-${l.code}.xml`),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  }
  // A language that stopped shipping must not leave its sitemap behind.
  for (const l of locales) {
    if (!reviewed.some((r) => r.code === l.code)) rmSync(join(dist, `sitemap-${l.code}.xml`), { force: true });
  }
  const idxPath = join(dist, 'sitemap-index.xml');
  if (existsSync(idxPath) && reviewed.length) {
    const idx = readFileSync(idxPath, 'utf8');
    const add = reviewed
      .filter((l) => !idx.includes(`sitemap-${l.code}.xml`))
      .map((l) => `<sitemap><loc>${site}/sitemap-${l.code}.xml</loc></sitemap>`)
      .join('');
    if (add) writeFileSync(idxPath, idx.replace('</sitemapindex>', `${add}</sitemapindex>`));
  }

  console.log(`i18n-build: ${pages.length} page(s), ${allKeys.size} distinct unit(s), bar ${(minCoverage * 100).toFixed(0)}% of a page's units`);
  for (const l of locales) {
    const st = localeStats.get(l.code);
    const pct = allKeys.size ? ((st.have / allKeys.size) * 100).toFixed(1) : '0.0';
    if (shipped.has(l.code)) {
      const s2 = stats.get(l.code);
      console.log(`  ${l.code}: ${st.pages}/${pages.length} page(s) shipped, ${pct}% of units${l.reviewed ? '' : ', noindex'}${s2.rejected ? `, ${s2.rejected} rejected` : ''}`);
    } else {
      const why = st.pages ? `home page not translated (${st.pages} other page(s) ready)` : 'nothing translated';
      console.log(`  ${l.code}: withheld, ${pct}% of units, ${why}`);
    }
  }
}

main();
