#!/usr/bin/env python3
"""
Pre-generate responsive renditions for every raster image a site serves.

For each photo under sites/<site>/public (jpg/jpeg/png/webp), writes
  public/images/_r/<slug>-<w>.avif  and  <slug>-<w>.webp
at widths 480 / 768 / 1200 / 1920 (never upscaled), plus a manifest at
  public/images/_r/manifest.json   { "/images/foo.jpg": {w,h,widths,formats,alpha} }
The originals stay where they are (they remain the <img src> fallback).
The shared Astro integration (packages/shared-ui/src/utils/responsive-images.mjs)
reads the manifest after the build and rewrites <img> tags into <picture>
with srcset/sizes, width/height and lazy loading.

Renditions are committed, so nothing is generated at build or request time.
Re-running only produces missing files; delete public/images/_r to rebuild.

Skipped on purpose: SVG/GIF/ICO, anything under _r/, social/OG images
(og-*.{jpg,png}, */og/*), favicons and files narrower than 320 px (icons, logos
at their display size). Images with transparency get WebP only (AVIF alpha is
fine too but WebP keeps the tooling simple and the files are small).

Requires Python 3 and Pillow 10+ (`pip install pillow`). Pillow's AVIF
encoder is built in from 11.0; older wheels need `pip install pillow-avif-plugin`.

Usage: python3 scripts/responsive-images.py <site> [<site> ...]
       python3 scripts/responsive-images.py --all        # every site under sites/
       python3 scripts/responsive-images.py --check      # every img in dist >150 KB must carry srcset
"""
from __future__ import annotations
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIDTHS = (480, 768, 1200, 1920)
Q_WEBP, Q_AVIF = 80, 55
MIN_SOURCE_W = 320
SKIP_RE = re.compile(r"(^|/)(og[-_.]|og/|favicon|apple-touch|icon-|icons?/|_r/|maskable)", re.I)


def slug(rel: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", rel.lower().rsplit(".", 1)[0]).strip("-")


def process_site(site: str) -> None:
    from PIL import Image, features

    pub = ROOT / "sites" / site / "public"
    if not pub.is_dir():
        sys.exit(f"no such site: sites/{site}/public")
    if not features.check("avif"):
        sys.exit("Pillow has no AVIF encoder: upgrade to Pillow 11+ or `pip install pillow-avif-plugin`")
    out = pub / "images/_r"
    out.mkdir(parents=True, exist_ok=True)
    mpath = out / "manifest.json"
    manifest = json.loads(mpath.read_text()) if mpath.exists() else {}
    made = skipped = 0
    for p in sorted(pub.rglob("*")):
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        rel = "/" + p.relative_to(pub).as_posix()
        if SKIP_RE.search(rel):
            skipped += 1; continue
        try:
            im = Image.open(p)
            im.load()
        except Exception as e:  # noqa: BLE001
            print(f"  unreadable {rel}: {e}"); continue
        w, h = im.size
        if w < MIN_SOURCE_W:
            skipped += 1; continue
        alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        widths = [x for x in WIDTHS if x < w] + [min(w, 1920)]
        widths = sorted(set(widths))
        formats = ["webp"] if alpha else ["avif", "webp"]
        s = slug(rel.lstrip("/"))
        base = im.convert("RGBA" if alpha else "RGB")
        for tw in widths:
            r = base.copy()
            if r.width > tw:
                r.thumbnail((tw, tw * 4), Image.LANCZOS)
            for fmt in formats:
                dst = out / f"{s}-{tw}.{fmt}"
                if dst.exists():
                    continue
                if fmt == "webp":
                    r.save(dst, "WEBP", quality=Q_WEBP, method=6)
                else:
                    r.save(dst, "AVIF", quality=Q_AVIF, speed=6)
                made += 1
        manifest[rel] = {"slug": s, "w": w, "h": h, "widths": widths, "formats": formats, "alpha": alpha}
    if not manifest:
        # Nothing to serve responsively; leave no empty folder behind.
        if not any(out.iterdir()):
            out.rmdir()
        print(f"{site:24s} no raster images under public/ (svg, icons and og images are skipped)")
        return
    mpath.write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")
    total = sum(f.stat().st_size for f in out.glob("*") if f.suffix in (".avif", ".webp")) / 1e6
    print(f"{site:24s} sources={len(manifest):4d} renditions written now={made:4d} total _r={total:6.1f} MB skipped={skipped}")


def check() -> int:
    bad = 0
    for dist in sorted((ROOT / "sites").glob("*/dist")):
        for html in dist.rglob("*.html"):
            t = html.read_text(errors="ignore")
            t = re.sub(r"<picture\b[\s\S]*?</picture>", "", t, flags=re.I)  # already responsive
            for tag in re.findall(r"<img\b[^>]*>", t):
                m = re.search(r'src="(/[^"]+\.(?:jpe?g|png|webp))"', tag, re.I)
                if not m or "srcset=" in tag:
                    continue
                f = dist / m.group(1).lstrip("/")
                if f.exists() and f.stat().st_size > 150_000:
                    bad += 1
                    print(f"UNOPTIMISED {html.relative_to(ROOT)} {m.group(1)} {f.stat().st_size // 1000} KB")
    print(f"{bad} large image(s) served without srcset")
    return 1 if bad else 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--check" in args:
        sys.exit(check())
    if "--all" in args:
        args = sorted(p.name for p in (ROOT / "sites").iterdir() if (p / "public").is_dir())
    if not args:
        sys.exit(__doc__)
    for site in args:
        process_site(site)
