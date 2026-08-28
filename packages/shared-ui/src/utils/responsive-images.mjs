/**
 * responsiveImages(): Astro integration, shared by every site.
 *
 * After the build, rewrites each <img src="/images/....(jpg|png|webp)"> whose
 * file has pre-generated renditions (public/images/_r/manifest.json, made by
 * scripts/responsive-images.py) into:
 *
 *   <picture>
 *     <source type="image/avif" srcset="… 480w, … 768w, …" sizes="…">
 *     <source type="image/webp" srcset="…" sizes="…">
 *     <img src="/images/original.jpg" width height loading decoding …>
 *   </picture>
 *
 * The browser then downloads only the rendition that fits the slot on that
 * screen. Nothing is generated at build time; the files are committed.
 *
 * Per-image control from templates (all optional):
 *   data-sizes="100vw"        the `sizes` hint (default below)
 *   data-no-picture           leave this <img> alone
 *   fetchpriority="high"      kept; such images are treated as above the fold
 *                             (no lazy loading, sizes defaults to 100vw)
 *   loading="eager"           kept (default is lazy)
 *
 * Default sizes: full width on phones, half the viewport on larger screens.
 * That errs on the side of a slightly larger file on desktop grids, never a
 * blurry one.
 *
 * Usage in astro.config.mjs:
 *   import responsiveImages from '@astro-fleet/shared-ui/utils/responsive-images.mjs';
 *   integrations: [sitemap(), responsiveImages()]
 *
 * Options: { sizes: '(max-width: 768px) 100vw, 50vw' }
 */
export default function responsiveImages(opts = {}) {
  const defaultSizes = opts.sizes ?? '(max-width: 768px) 100vw, 50vw';
  return {
    name: 'responsive-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { readdir, readFile, writeFile } = await import('node:fs/promises');
        const { join } = await import('node:path');
        const { fileURLToPath } = await import('node:url');
        const root = fileURLToPath(dir);
        let manifest;
        try {
          manifest = JSON.parse(await readFile(join(root, 'images/_r/manifest.json'), 'utf8'));
        } catch {
          // A site with no photos has no manifest. That is fine, and not worth a warning.
          logger.info('no images/_r/manifest.json; nothing to rewrite (run scripts/responsive-images.py if this site has photos)');
          return;
        }
        const walk = async (d) => {
          const out = [];
          for (const e of await readdir(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) out.push(...(await walk(p)));
            else if (e.name.endsWith('.html')) out.push(p);
          }
          return out;
        };
        const attr = (tag, name) => {
          const m = tag.match(new RegExp(`\\s${name}=("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
          return m ? (m[2] ?? m[3] ?? m[4]) : undefined;
        };
        const hasAttr = (tag, name) => new RegExp(`\\s${name}(=|\\s|/?>)`, 'i').test(tag);
        let rewritten = 0, files = 0;
        for (const file of await walk(root)) {
          const html = await readFile(file, 'utf8');
          // Skip images already inside <picture> by masking those blocks first.
          const pictures = [];
          const masked = html.replace(/<picture\b[\s\S]*?<\/picture>/gi, (m) => {
            pictures.push(m);
            return `\u0000PIC${pictures.length - 1}\u0000`;
          });
          const next = masked.replace(/<img\b[^>]*>/gi, (tag) => {
            if (hasAttr(tag, 'srcset') || hasAttr(tag, 'data-no-picture')) return tag;
            const src = attr(tag, 'src');
            if (!src) return tag;
            const key = src.split('?')[0];
            const meta = manifest[key];
            if (!meta) return tag;
            const high = (attr(tag, 'fetchpriority') || '').toLowerCase() === 'high';
            const sizes = attr(tag, 'data-sizes') ?? (high ? '100vw' : defaultSizes);
            const set = (fmt) => meta.widths.map((w) => `/images/_r/${meta.slug}-${w}.${fmt} ${w}w`).join(', ');
            let img = tag.replace(/\sdata-sizes=("[^"]*"|'[^']*'|[^\s>]+)/i, '');
            if (!hasAttr(img, 'width')) img = img.replace(/<img\b/i, `<img width="${meta.w}" height="${meta.h}"`);
            if (!hasAttr(img, 'loading') && !high) img = img.replace(/<img\b/i, '<img loading="lazy"');
            if (!hasAttr(img, 'decoding')) img = img.replace(/<img\b/i, '<img decoding="async"');
            const sources = meta.formats
              .map((f) => `<source type="image/${f}" srcset="${set(f)}" sizes="${sizes}">`)
              .join('');
            rewritten++;
            return `<picture>${sources}${img}</picture>`;
          });
          const restored = next.replace(/\u0000PIC(\d+)\u0000/g, (_, i) => pictures[Number(i)]);
          if (restored !== html) {
            await writeFile(file, restored);
            files++;
          }
        }
        logger.info(`responsive-images: ${rewritten} <img> rewritten in ${files} pages`);
      },
    },
  };
}
