/**
 * i18n-extract: pull every translatable unit out of a built site.
 *
 * WHY THE BUILT HTML AND NOT THE SOURCE
 * -------------------------------------
 * A site of eighty hand-written .astro pages with the copy inline, taken into
 * even a handful of languages by duplicating the source, means hundreds of page
 * files nobody can keep in step, and an English copy fix silently leaves every
 * translation stale. No two sites in a fleet are built the same way either, so
 * anything that reads the source has to understand all of them.
 *
 * So English stays the single source of truth. The build produces the English
 * site exactly as it does today; this script reads `dist/`, lifts the strings,
 * and `i18n-build.mjs` writes translated copies into `dist/<locale>/`. A unit
 * with no translation falls back to English, so a half-finished dictionary
 * still produces a working page rather than a broken one.
 *
 * WHY BLOCKS AND NOT TEXT NODES
 * -----------------------------
 * The first version of this script extracted text nodes, and the top of its
 * output was "of", "or", "to", "The": fragments left either side of a <strong>
 * or an <a>. Translating those separately produces nonsense in any language and
 * especially in one whose word order differs from English, which is all eleven
 * of ours. So a unit is a leaf block (a <p>, an <h2>, an <li>) taken whole, with
 * its inline tags replaced by numbered placeholders:
 *
 *     <p>Built <strong>here</strong> since <a href="/x">1960</a>.</p>
 *       ->  "Built <0>here</0> since <1>1960</1>."
 *
 * The translator moves the placeholders wherever the target language needs
 * them, and the rebuild puts the real tags back. A translation that loses or
 * invents a placeholder is rejected by `i18n-build.mjs` rather than shipped.
 *
 * WHAT IS NEVER TRANSLATED
 * ------------------------
 * script, style, code, pre, svg, JSON-LD. Model numbers (MK8D, HLP 180, CM-40),
 * email addresses, phone numbers, URLs and bare figures. Translating "MK8D" is
 * how a machine becomes unfindable, and translating a phone number is how it
 * becomes wrong.
 *
 * KEYS
 * ----
 * A unit's id is a hash of its English text, so one sentence repeated on twelve
 * pages is translated once, and editing the English produces a new id that
 * shows up as untranslated rather than quietly keeping the old translation.
 *
 * Run:  node packages/shared-ui/scripts/i18n-extract.mjs <site-dir>
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

/** Never look inside these. */
export const SKIP = new Set(['script', 'style', 'code', 'pre', 'noscript', 'svg', 'template', 'canvas']);

/** Tags that may sit inside one translatable unit and become placeholders. */
export const INLINE = new Set([
  'a', 'abbr', 'b', 'br', 'cite', 'em', 'i', 'mark', 'q', 's', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'wbr',
]);

/** Elements that hold prose directly. A unit is one of these with no block child. */
export const BLOCK = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'td', 'th',
  'summary', 'figcaption', 'caption', 'blockquote', 'label', 'legend',
  'button', 'option', 'title',
]);

/** Containers we descend into but never treat as a unit themselves. */
export const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export const TEXT_ATTRS = ['alt', 'title', 'placeholder', 'aria-label', 'aria-description'];

export const META_KEYS = new Set([
  'description', 'og:title', 'og:description', 'og:image:alt',
  'twitter:title', 'twitter:description', 'twitter:image:alt',
  'apple-mobile-web-app-title',
]);

export const id = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, '\u00A0')
   .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
   .replace(/&hellip;/g, '…').replace(/&middot;/g, '·');

/**
 * Collapse runs of ordinary whitespace, but never touch U+00A0. A non-breaking
 * space is content, not layout: the split-word hero headlines put one inside
 * each word span so the words do not run together, and collapsing it to a
 * plain space made every translated headline read as one long word.
 */
export const norm = (s) => decode(s).replace(/[^\S\u00A0]+/g, ' ').trim();

/**
 * Is this worth translating, or is it an identifier wearing words? Deliberately
 * conservative: when in doubt it stays in English, because a wrongly translated
 * part number costs more than an untranslated label.
 */
export function translatable(raw) {
  const s = raw.replace(/<\/?\d+>/g, '').trim();
  if (s.length < 3) return false;
  if (!/\p{L}{2}/u.test(s)) return false;
  if (/^[\p{L}]{1,4}[\s-]?\d[\d\w\s-]*$/u.test(s) && s.length <= 16) return false; // MK8D, HLP 180
  if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(s)) return false;
  if (/^(https?:\/\/|www\.|mailto:|tel:)/i.test(s)) return false;
  if (/^\+?[\d\s()-]{6,}$/.test(s)) return false;
  if (/^[\d\s.,%:/+-]+$/.test(s)) return false;
  if (/^[A-Z0-9&+/-]{2,8}$/.test(s)) return false;   // ISO, SS 304, BOPP, MS
  if (/^[±~<>]?\d[\d.,\/x×\s-]*\s*[A-Za-z%°\/]{1,6}$/.test(s)) return false; // 7 kW, ±1mm, 2 HP
  return true;
}

/**
 * Tokenise once and hand back every translatable unit and attribute with its
 * exact byte range, so extraction and rebuild can never disagree about what a
 * unit is.
 *
 * onUnit(start, end, innerHtml)      a leaf block's inner HTML
 * onAttr(start, end, value, kind)    an attribute value
 */
/**
 * Does this element contain a block element anywhere inside it?
 *
 * Whether something is a leaf block has to be decided when it opens, not after
 * it closes. The case-study cards are `<a class="cs-card"><h3>…</h3><p>…</p></a>`:
 * <a> is an inline tag, so it was made a unit, and every heading and paragraph
 * inside it was then "inside a unit" and never became a unit of its own. The
 * card link shipped with its title translated and its body in English on a live
 * page. Looking ahead costs one scan and settles it before anything is pushed.
 *
 * `from` is the index just past the open tag. An element that never closes
 * counts as containing a block, so malformed markup is left alone.
 */
export function hasBlockDescendant(html, from, name) {
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  re.lastIndex = from;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[2].toLowerCase();
    if (!m[1] && !m[4] && SKIP.has(tag)) {
      const close = new RegExp(`</${tag}\\s*>`, 'i').exec(html.slice(re.lastIndex));
      if (!close) return true;
      re.lastIndex += close.index + close[0].length;
      continue;
    }
    if (VOID.has(tag) || m[4]) continue;
    if (!m[1]) {
      if (BLOCK.has(tag)) return true;
      if (tag === name) depth++;
    } else if (tag === name) {
      if (depth === 0) return false;
      depth--;
    }
  }
  return true;
}

/**
 * Is this plain container really a sentence with a decoration in it?
 *
 * `<div class="hero__badge"><span class="dot"></span>Computer-vision grading</div>`
 * is a caption, not a layout box, but neither the <div> (not a block tag) nor
 * the empty <span> is a unit, so the words fell through both tests and shipped
 * in English on every translated home page. The test is direct text with
 * letters, plus nothing inside but inline tags and icons: a container of <a>
 * elements with no text of its own is still a menu and still not a unit.
 *
 * `from` is the index just past the container's open tag. Bails at the first
 * block child, so a page wrapper costs one tag to reject.
 */
export function plainTextHost(html, from, name) {
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  re.lastIndex = from;
  let depth = 0;
  let cursor = from;
  let text = '';
  let m;
  while ((m = re.exec(html))) {
    if (depth === 0) text += html.slice(cursor, m.index);
    const tag = m[2].toLowerCase();
    // An icon is opaque: skip its whole subtree without judging its children.
    if (!m[1] && !m[4] && SKIP.has(tag)) {
      const close = new RegExp(`</${tag}\\s*>`, 'i').exec(html.slice(re.lastIndex));
      if (!close) return false;
      re.lastIndex += close.index + close[0].length;
      cursor = re.lastIndex;
      continue;
    }
    if (VOID.has(tag) || m[4]) {
      if (!INLINE.has(tag) && !VOID.has(tag)) return false;
      cursor = re.lastIndex;
      continue;
    }
    if (!m[1]) {
      if (!INLINE.has(tag)) return false;   // a block child: this is a layout box
      depth++;
    } else if (tag === name && depth === 0) {
      return /\p{L}{2}/u.test(text);
    } else {
      depth--;
      if (depth < 0) return false;
    }
    cursor = re.lastIndex;
  }
  return false;
}

export function walk(html, onUnit, onAttr) {
  const tagRe = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  /** @type {{name:string,contentStart:number,hasBlockChild:boolean,isUnit:boolean}[]} */
  const stack = [];
  const skip = [];
  let inJsonLd = false;
  let m;

  while ((m = tagRe.exec(html))) {
    const [full, closing, rawName, attrs, selfClose] = m;
    const name = rawName.toLowerCase();
    const voidEl = VOID.has(name) || !!selfClose;

    if (!closing) {
      if (name === 'script') inJsonLd = /type\s*=\s*["']application\/ld\+json["']/i.test(attrs);
      // `data-i18n-skip` opts an element and its contents out entirely. The
      // language switcher uses it: its entries are already in their own
      // scripts, and "हिन्दी" must never be translated into Hindi.
      if ((SKIP.has(name) || /\sdata-i18n-skip\b/.test(attrs)) && !voidEl) skip.push(name);

      // Attributes are readable even inside a block we are treating as a unit,
      // but not inside a skipped element or JSON-LD.
      if (attrs && !skip.length && !inJsonLd) {
        const attrRe = /([\w:-]+)\s*=\s*"([^"]*)"/g;
        let a;
        while ((a = attrRe.exec(attrs))) {
          const key = a[1].toLowerCase();
          const abs = m.index + 1 + rawName.length + a.index;
          const valStart = abs + a[0].indexOf('"') + 1;
          if (TEXT_ATTRS.includes(key)) onAttr(valStart, valStart + a[2].length, a[2], key);
          else if (name === 'meta' && key === 'content') {
            const which = (/(?:name|property)\s*=\s*"([^"]+)"/i.exec(attrs) || [])[1];
            if (which && META_KEYS.has(which.toLowerCase())) onAttr(valStart, valStart + a[2].length, a[2], `meta:${which.toLowerCase()}`);
          }
        }
      }

      if (!voidEl && !skip.length && !inJsonLd) {
        const insideUnit = stack.some((f) => f.isUnit);
        // A unit is a leaf block, OR an inline element that has no block around
        // it at all. The second case is the site header: `<nav><a>Products</a>`
        // has no <p> or <li> anywhere, and without this rule every nav label in
        // a hand-written header is silently untranslatable.
        // A unit is one element taken whole, so it must not contain another
        // block: `<a class="card"><h3>…</h3><p>…</p></a>` is a card, not a
        // sentence, and `<li>…<ul>…</ul></li>` is a menu, not a line.
        const isUnit = !insideUnit && !SKIP.has(name) && (
          ((BLOCK.has(name) || INLINE.has(name)) && !hasBlockDescendant(html, tagRe.lastIndex, name)) ||
          // A plain container that holds its own words, e.g. the hero badge.
          plainTextHost(html, tagRe.lastIndex, name)
        );
        if (!isUnit && (BLOCK.has(name) || !INLINE.has(name))) {
          for (const f of stack) if (f.isUnit) f.hasBlockChild = true;
        }
        stack.push({ name, contentStart: tagRe.lastIndex, hasBlockChild: false, isUnit, pending: [] });
      }
    } else {
      if (name === 'script') inJsonLd = false;
      const si = skip.lastIndexOf(name);
      if (si !== -1) { skip.splice(si); continue; }
      const i = stack.map((f) => f.name).lastIndexOf(name);
      if (i !== -1) {
        const frame = stack[i];
        // Text sitting directly in a plain container with no child tags at all
        // (`<div class="nav-heading">Poultry</div>`) is a unit too. Without
        // this the mega-menu headings had no way to be translated.
        if (!frame.isUnit) {
          const inner = html.slice(frame.contentStart, m.index);
          const host = stack.slice(0, i).reverse().find((f) => f.isUnit);
          // An inline element inside a host block may carry inline markup of its
          // own, because that becomes placeholders like in any other unit: the
          // nav trigger is `<a>Products<svg/></a>`. Anything else must be plain
          // text, or we would hand the translator a layout wrapper: a <div> of
          // <a> elements is a menu, not a sentence.
          const usable = host && INLINE.has(frame.name)
            ? !frame.hasBlockChild
            : !inner.includes('<');
          if (usable && /\p{L}{2}/u.test(inner.replace(/<[^>]*>/g, ''))) {
            // Text sitting directly in a plain container with no child tags at
            // all (`<div class="nav-heading">Poultry</div>`) is a unit too.
            if (!host) onUnit(frame.contentStart, m.index, inner);
            // Inside a block we are still hoping to take whole, hold it back.
            // If that block turns out to have a block child after all, this is
            // the only chance the text gets. The site header is the case:
            // `<li><a>Products<svg/></a><ul class="dropdown">…</ul></li>`. The
            // <li> is disqualified by the dropdown, the <a> label sits inside
            // it, and before this every desktop nav trigger was untranslatable
            // while its own aria-label was translated right next to it.
            else host.pending.push([frame.contentStart, m.index, inner]);
          }
        }
        if (frame.isUnit && frame.hasBlockChild) {
          for (const [ps, pe, pinner] of frame.pending) onUnit(ps, pe, pinner);
        }
        if (frame.isUnit && !frame.hasBlockChild) {
          // A block whose entire content is one inline element ("<li><a>About</a></li>")
          // would otherwise be extracted as "<0>About</0>", which asks the
          // translator to carry a placeholder that never moves. Narrow to the
          // inner content instead, so the string is just "About" and the <a>
          // stays where it is.
          const [s2, e2] = narrow(html, frame.contentStart, m.index);
          onUnit(s2, e2, html.slice(s2, e2));
        }
        stack.splice(i);
      }
    }
  }
}

/**
 * If a range's whole content is a single wrapping element, return the range of
 * that element's content instead. Applied repeatedly, so "<a><span>x</span></a>"
 * narrows to "x".
 */
export function narrow(html, start, end) {
  for (let guard = 0; guard < 6; guard++) {
    const inner = html.slice(start, end);
    const open = /^\s*<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)>/.exec(inner);
    if (!open) break;
    const name = open[1].toLowerCase();
    if (VOID.has(name) || SKIP.has(name)) break;
    const closeRe = new RegExp(`</${name}\\s*>\\s*$`, 'i');
    const close = closeRe.exec(inner);
    if (!close) break;
    // Only narrow when that element really is the only child: no sibling of the
    // same tag closing early inside it.
    const body = inner.slice(open[0].length, close.index);
    let depth = 0, balanced = true;
    const re = new RegExp(`<(/?)${name}\\b[^>]*>`, 'gi');
    let mm;
    while ((mm = re.exec(body))) { depth += mm[1] ? -1 : 1; if (depth < 0) { balanced = false; break; } }
    if (!balanced || depth !== 0) break;
    start = start + open[0].length;
    end = start + body.length;
  }
  return [start, end];
}

/**
 * Turn a leaf block's inner HTML into a translatable string: inline tags become
 * numbered placeholders, and the tags themselves are kept so the rebuild can
 * put them back exactly.
 */
export function toUnit(inner) {
  const tags = [];
  let out = '';
  let i = 0;
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  const open = [];
  while ((m = re.exec(inner))) {
    out += inner.slice(i, m.index);
    const name = m[2].toLowerCase();
    // An icon inside a link is one opaque thing, not a nest of placeholders.
    // Without this, "View all products" arrives at the translator as
    // "View all products<0><1></1></0>" and every arrow icon on the site adds
    // two placeholders a person has to carry through a sentence.
    if (!m[1] && SKIP.has(name) && !m[4]) {
      const close = new RegExp(`</${name}\\s*>`, 'i');
      const rest = inner.slice(re.lastIndex);
      const c = close.exec(rest);
      const end = c ? re.lastIndex + c.index + c[0].length : inner.length;
      tags.push(inner.slice(m.index, end));
      out += `<${tags.length - 1}/>`;
      re.lastIndex = end;
      i = end;
      continue;
    }
    if (!m[1]) {
      // An element with nothing inside it is a decoration, not a wrapper: the
      // hero badge's dot is `<span class="dot"></span>`. Left as a pair it
      // reaches the translator as "<0></0>Computer-vision grading", asking a
      // person to carry two tokens that can never hold anything between them.
      const empty = new RegExp(`^</${name}\\s*>`, 'i').exec(inner.slice(re.lastIndex));
      if (empty && !m[4] && !VOID.has(name)) {
        tags.push(m[0] + empty[0]);
        out += `<${tags.length - 1}/>`;
        re.lastIndex += empty[0].length;
        i = re.lastIndex;
        continue;
      }
      // Every void element is a placeholder that stands alone. Only <br> and
      // tags written self-closing were treated that way before, so an <img> or
      // a <source> inside a unit was pushed onto the open stack and never
      // popped: the next real closing tag popped the wrong one, and the
      // rebuilt page came out with </img>, </source> and a thumbnail that
      // never closed, swallowing the card text that followed it.
      if (name === 'br' || m[4] || VOID.has(name)) {
        tags.push(m[0]);
        out += `<${tags.length - 1}/>`;
      } else {
        tags.push(m[0]);
        const n = tags.length - 1;
        open.push(n);
        out += `<${n}>`;
      }
    } else {
      const n = open.pop();
      out += n === undefined ? '' : `</${n}>`;
    }
    i = re.lastIndex;
  }
  out += inner.slice(i);
  return { text: norm(out), tags };
}

function* htmlFiles(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (e.endsWith('.html')) yield p;
  }
}

function main() {
  const siteDir = process.argv[2];
  if (!siteDir) { console.error('usage: node i18n-extract.mjs <site-dir>'); process.exit(1); }
  const dist = join(siteDir, 'dist');
  if (!existsSync(dist)) { console.error(`i18n-extract: no dist/ in ${siteDir}. Build the site first.`); process.exit(1); }

  // Translation is opt-in. A site declares its languages in i18n/locales.json,
  // and without that file this writes nothing and says nothing: a site that
  // never wants a second language should not find strings.json in its tree or
  // a line about units in its build log. i18n-build.mjs already skips on the
  // same file, so the pair is on or off together.
  if (!existsSync(join(siteDir, 'i18n', 'locales.json'))) return;

  const strings = new Map();
  const byPage = new Map();
  let pages = 0;

  for (const file of htmlFiles(dist)) {
    const rel = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
    if (/^\/[a-z]{2}(-[a-z]{2})?\//.test(rel)) continue; // a locale we generated
    pages++;
    const here = new Set();
    byPage.set(rel, here);
    const html = readFileSync(file, 'utf8');
    const add = (s, kind) => {
      if (!translatable(s)) return;
      const k = id(s);
      const rec = strings.get(k) || { en: s, kind, pages: new Set() };
      rec.pages.add(rel);
      strings.set(k, rec);
      here.add(k);
    };
    walk(
      html,
      (_s, _e, inner) => add(toUnit(inner).text, 'unit'),
      (_s, _e, value, kind) => add(norm(value), kind),
    );
  }

  const outDir = join(siteDir, 'i18n');
  mkdirSync(outDir, { recursive: true });
  const sorted = [...strings.entries()].sort((a, b) => b[1].pages.size - a[1].pages.size);
  const out = {};
  for (const [k, v] of sorted) out[k] = { en: v.en, kind: v.kind, count: v.pages.size, pages: [...v.pages].sort().slice(0, 6) };
  writeFileSync(join(outDir, 'strings.json'), JSON.stringify(out, null, 2) + '\n');

  // Which units sit on which page. strings.json lists only the first six pages
  // per unit so it stays readable; the gate and the batching tool need the
  // whole picture, because a page ships in a language on its own units alone.
  const pageMap = {};
  for (const k of [...byPage.keys()].sort()) pageMap[k] = [...byPage.get(k)].sort();
  writeFileSync(join(outDir, 'pages.json'), JSON.stringify(pageMap) + '\n');

  const words = sorted.reduce((n, [, v]) => n + v.en.split(/\s+/).length, 0);
  console.log(`i18n-extract: ${sorted.length} units (${words} words) from ${pages} page(s) -> ${relative(process.cwd(), join(outDir, 'strings.json'))}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
