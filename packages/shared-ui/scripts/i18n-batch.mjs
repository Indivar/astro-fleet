/**
 * i18n-batch: hand the translator work in slices and take it back safely.
 *
 * A real site's dictionary runs to thousands of units and is written over many
 * sittings, so the job has to be resumable and every handback has to be
 * checked. This script is the only thing that writes a dictionary.
 *
 * WHY IT VALIDATES ON THE WAY IN
 * A unit's inline tags travel as numbered placeholders: "Built <0>here</0>
 * since 1960." A translation that drops <0> or invents <3> is rejected by
 * i18n-build at the end, which means the loss shows up as an English sentence
 * on a Hindi page days later and nobody knows why. Checking at merge time turns
 * that into an error the translator sees while the unit is still in front of
 * them.
 *
 *   next   <site> <locale> [count]   write the next untranslated slice to a file
 *   merge  <site> <locale> <file>    fold {key: "translation"} back in
 *   status <site>                    coverage per locale
 *
 * Run from the repo root, e.g.
 *   node packages/shared-ui/scripts/i18n-batch.mjs next sites/example.com es 120
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PH = /<\/?(\d+)\/?>/g;

/** The multiset of placeholder tokens in a string, order-independent. */
function placeholders(s) {
  const out = [];
  for (const m of s.matchAll(PH)) out.push(m[0]);
  return out.sort();
}

const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

function load(p, fallback) {
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback;
}

function dictPaths(siteDir, locale) {
  const dir = join(siteDir, 'i18n');
  return { dir, strings: join(dir, 'strings.json'), dict: join(dir, `${locale}.json`) };
}

/** Keep the file sorted by English text so a reviewer reads it like a document. */
function writeDict(path, dict) {
  const keys = Object.keys(dict).sort((a, b) => dict[a].en.localeCompare(dict[b].en, 'en'));
  const body = keys.map((k) => ` ${JSON.stringify(k)}: {\n  "en": ${JSON.stringify(dict[k].en)},\n  "t": ${JSON.stringify(dict[k].t)}\n }`);
  writeFileSync(path, `{\n${body.join(',\n')}\n}\n`);
}

/**
 * Page order for translating: home first, then whichever page is closest to
 * being finished. A page ships in a language on its own units alone, so
 * finishing pages beats finishing the longest paragraphs: it turns work into
 * live pages instead of into a percentage that ships nothing.
 */
function pageOrder(strs, pageMap, dict) {
  const done = (k) => Boolean(lookupT(dict, k));
  const rows = Object.keys(pageMap).map((path) => {
    const keys = pageMap[path].filter((k) => strs[k]);
    const left = keys.filter((k) => !done(k));
    return { path, total: keys.length, left: left.length, keys: left };
  });
  rows.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : 0) || a.left - b.left || a.path.localeCompare(b.path));
  return rows;
}

function lookupT(dict, k) {
  const e = dict[k];
  const t = typeof e === 'string' ? e : e && e.t;
  return t || undefined;
}

function cmdPages(siteDir, locale) {
  const { strings, dict: dictPath, dir } = dictPaths(siteDir, locale);
  const strs = load(strings, null);
  const pageMap = load(join(dir, 'pages.json'), null);
  if (!strs || !pageMap) { console.error('run i18n-extract first'); process.exit(1); }
  const dict = load(dictPath, {});
  const rows = pageOrder(strs, pageMap, dict);
  const ready = rows.filter((r) => !r.total || (r.total - r.left) / r.total >= 0.9);
  for (const r of rows) {
    const pct = r.total ? (((r.total - r.left) / r.total) * 100).toFixed(0) : '100';
    console.log(`  ${String(pct).padStart(3)}%  ${String(r.left).padStart(4)} left  ${r.path}`);
  }
  console.log(`${locale}: ${ready.length}/${rows.length} page(s) at or above 90%`);
}

function cmdNext(siteDir, locale, count) {
  const { strings, dict: dictPath, dir } = dictPaths(siteDir, locale);
  const strs = load(strings, null);
  if (!strs) { console.error(`no ${strings}; run i18n-extract first`); process.exit(1); }
  const dict = load(dictPath, {});
  const pageMap = load(join(dir, 'pages.json'), null);

  const picked = [];
  const seen = new Set();
  if (pageMap) {
    for (const row of pageOrder(strs, pageMap, dict)) {
      for (const k of row.keys) {
        if (seen.has(k) || picked.length >= count) continue;
        seen.add(k);
        picked.push(k);
      }
      if (picked.length >= count) break;
    }
  } else {
    for (const k of Object.keys(strs).filter((k) => !lookupT(dict, k))) {
      if (picked.length >= count) break;
      picked.push(k);
    }
  }

  const slice = picked.map((k) => ({ k, en: strs[k].en }));
  const outDir = join(siteDir, 'i18n', '.batches');
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `${locale}-next.json`);
  writeFileSync(out, JSON.stringify(slice, null, 1) + '\n');
  const chars = slice.reduce((n, u) => n + u.en.length, 0);
  const left = Object.keys(strs).filter((k) => !lookupT(dict, k)).length - slice.length;
  console.log(`${out}\n${slice.length} unit(s), ${chars.toLocaleString()} chars. ${left} still untranslated after this batch.`);
}

function cmdMerge(siteDir, locale, file) {
  const { strings, dict: dictPath } = dictPaths(siteDir, locale);
  const strs = load(strings, null);
  const dict = load(dictPath, {});
  const incoming = JSON.parse(readFileSync(file, 'utf8'));

  let added = 0;
  const problems = [];
  for (const [k, t] of Object.entries(incoming)) {
    const src = strs[k];
    if (!src) { problems.push(`${k}: not a key in strings.json`); continue; }
    if (typeof t !== 'string' || !t.trim()) { problems.push(`${k}: empty translation`); continue; }
    // U+FFFD means bytes were lost somewhere between the translator and here,
    // and a combining vowel sign with nothing to attach to means an Indic
    // syllable lost its consonant. Both render as a black diamond or a stray
    // mark on the page and neither is visible in a diff at a glance.
    if (t.includes('\uFFFD')) { problems.push(`${k}: replacement character U+FFFD, text was corrupted in transit`); continue; }
    if (/(^|\s)[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0A01-\u0A03\u0A3E-\u0A4F]/.test(t)) {
      problems.push(`${k}: combining mark with no base character (dropped consonant)`);
      continue;
    }
    const want = placeholders(src.en);
    const got = placeholders(t);
    if (!same(want, got)) {
      problems.push(`${k}: placeholders ${JSON.stringify(want)} -> ${JSON.stringify(got)}\n    en: ${src.en}\n    t:  ${t}`);
      continue;
    }
    dict[k] = { en: src.en, t };
    added++;
  }

  writeDict(dictPath, dict);
  const total = Object.keys(strs).length;
  const have = Object.keys(strs).filter((k) => dict[k] && dict[k].t).length;
  console.log(`merged ${added} into ${dictPath} -> ${have}/${total} (${((have / total) * 100).toFixed(1)}%)`);
  if (problems.length) {
    console.log(`\nREJECTED ${problems.length}, still untranslated:`);
    for (const p of problems) console.log('  ' + p);
    process.exitCode = 1;
  }
}

/**
 * Drop dictionary entries whose key is no longer in strings.json. A unit's key
 * is a hash of its English, so editing the English retires the old key and
 * leaves its translation stranded: harmless to the build, but it inflates the
 * coverage denominator's cousin (the file) and hides how much is really done.
 */
function cmdPrune(siteDir) {
  const { strings, dir } = dictPaths(siteDir, 'en');
  const strs = load(strings, null);
  if (!strs) { console.error(`no ${strings}`); process.exit(1); }
  const cfg = load(join(dir, 'locales.json'), { locales: [] });
  for (const l of cfg.locales.filter((x) => x.code !== 'en')) {
    const p = join(dir, `${l.code}.json`);
    const d = load(p, null);
    if (!d) continue;
    const dead = Object.keys(d).filter((k) => !strs[k]);
    if (!dead.length) continue;
    for (const k of dead) delete d[k];
    writeDict(p, d);
    console.log(`${l.code}: pruned ${dead.length} stranded entr${dead.length === 1 ? 'y' : 'ies'}`);
  }
}

function cmdStatus(siteDir) {
  const { strings, dir } = dictPaths(siteDir, 'en');
  const strs = load(strings, null);
  if (!strs) { console.error(`no ${strings}`); process.exit(1); }
  const cfg = load(join(dir, 'locales.json'), { locales: [] });
  const total = Object.keys(strs).length;
  console.log(`${siteDir}: ${total} units`);
  for (const l of cfg.locales.filter((x) => x.code !== 'en')) {
    const d = load(join(dir, `${l.code}.json`), {});
    const have = Object.keys(strs).filter((k) => d[k] && d[k].t).length;
    console.log(`  ${l.code} ${String(have).padStart(5)}/${total}  ${((have / total) * 100).toFixed(1)}%`);
  }
}

const [cmd, siteDir, a, b] = process.argv.slice(2);
if (cmd === 'next') cmdNext(siteDir, a, Number(b) || 100);
else if (cmd === 'merge') cmdMerge(siteDir, a, b);
else if (cmd === 'status') cmdStatus(siteDir);
else if (cmd === 'pages') cmdPages(siteDir, a);
else if (cmd === 'prune') cmdPrune(siteDir);
else { console.error('usage: i18n-batch.mjs next|merge|status <site-dir> ...'); process.exit(1); }
