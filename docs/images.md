# Images

Every photo is served at the size the slot needs, in a modern format, from your
own host, with the renditions generated once and committed. No hotlinks, no
resizing at request time, and no page that ships a 1 MB JPEG into a 300 px
card.

The pieces are a Python script that writes the renditions, an Astro integration
that rewrites the built HTML to use them, and two checks that fail when either
was skipped. Pages keep writing a plain `<img>`.

## Requirements

Python 3 and Pillow (`pip install pillow`) are the only extras. Pillow 11 has an
AVIF encoder built in; on older wheels add `pip install pillow-avif-plugin`. The
build itself needs neither: the integration reads files that are already in the
repo, so CI and other contributors need nothing installed.

There is no Node version of the generator. Sharp would do the same job, but two
implementations drift, and the Python one is thirty lines around Pillow.

## The pipeline

1. **Originals** stay in `sites/<site>/public/images/...`. They remain the
   `<img src>` fallback for any browser that gets none of the sources.
2. **`python3 scripts/responsive-images.py <site>`** writes AVIF and WebP
   renditions at 480, 768, 1200 and 1920 px (never upscaled) into
   `public/images/_r/`, plus a `manifest.json` beside them recording each
   original's size and which widths exist. Images with transparency get WebP
   only. Skipped on purpose: SVG, GIF, OG and social images, favicons and icons,
   anything narrower than 320 px. Re-running only fills gaps; delete `_r/` to
   regenerate. `--all` does every site under `sites/`.
3. **`responsiveImages()`** from
   `@astro-fleet/shared-ui/utils/responsive-images.mjs`, listed in each site's
   `astro.config.mjs`, runs after the build. It rewrites every
   `<img src="/images/x.jpg">` that has renditions into `<picture>` with AVIF
   and WebP `srcset`, a `sizes` hint, `width` and `height` (no layout shift),
   `loading="lazy"` and `decoding="async"`. Markdown images get the same
   treatment because it runs on the finished HTML, not on templates.
4. **Checks.** `python3 scripts/responsive-images.py --check` fails if any
   built page serves an image over 150 KB without `srcset`.
   `python3 scripts/localize-stock-images.py --check` fails on any Unsplash or
   Pexels hotlink in built HTML. `python3 scripts/image-weight.py` prints, per
   site, the image bytes a browser would download per page before and after,
   at 375 px and 1440 px, and names the heaviest page.

The starter ships one placeholder photo in `public/images/` with its
renditions, so the whole path can be seen working in the build log
(`responsive-images: 1 <img> rewritten in 1 pages`) before you add your own.

## Per-image control in templates

All optional, on the `<img>`:

- `data-sizes="100vw"` (or any `sizes` string) tells the browser how wide the
  slot is. The default is `(max-width: 768px) 100vw, 50vw`, which errs towards
  a slightly larger file on desktop grids and never a blurry one. Heroes should
  say `100vw`; a three-up card grid `(max-width: 768px) 100vw, 33vw`; a
  fixed-width column `(max-width: 768px) 100vw, 800px`.
- `fetchpriority="high"` marks the LCP image. It is not lazy-loaded and `sizes`
  defaults to `100vw`.
- `loading="eager"` is kept as written.
- `data-no-picture` leaves the `<img>` alone (a lightbox overlay, a tracking
  pixel, an image a script swaps at run time).

The default `sizes` can be changed site-wide:
`responsiveImages({ sizes: '(max-width: 640px) 100vw, 60vw' })`.

## Adding a photo

Put the original in `public/images/`, run
`python3 scripts/responsive-images.py <site>`, commit the new `_r/` files with
it, build. Nothing else to do. The originals and renditions of a fifty-photo
site come to a few megabytes, which is cheaper in the repo than a build step
that has to run on every machine.

## Stock photos

A hotlinked Unsplash or Pexels URL is a dependency on someone else's server: if
the photo is removed the page silently shows a broken image, every visitor pays
a third-party connection for it, and the host has to be allowed in your
Content-Security-Policy.

`python3 scripts/localize-stock-images.py <site>` finds every such URL under
`src/`, downloads a 1920 px original once into `_media/stock-originals/` (with
a `manifest.json` recording source, licence and date), writes 640 and 1280 px
WebP renditions into `public/images/stock/`, and rewrites the URLs in `src/` to
the local files. Then run `responsive-images.py` on the site to add AVIF and the
smaller widths.

If a site builds URLs from bare ids in a helper function, the literal-URL scan
cannot see them. Pass `--helper-id-regex provider:file:regex` (first group is
the id) to fetch those too, then point the helper at
`/images/stock/<provider>-<id>-<640|1280>.webp` yourself.

Both the Unsplash License and the Pexels License permit self-hosting for
commercial use without attribution. Photos from anywhere else: check first.

## Lightboxes and galleries

Show the small rendition and load the original only when the visitor opens it.
A page that swaps a gallery image at run time must also remove the `<source>`
siblings the build step added, or the browser keeps the old `srcset` and the
swap appears not to work. Simplest is `data-no-picture` on images a script
controls.

## SVG

Large SVGs are not touched by any of this. Minify them with
`bunx svgo --multipass`, and verify the result with a rendered pixel diff
rather than by eye: an SVG "logo" can carry hundreds of kilobytes of invisible
embedded raster.
