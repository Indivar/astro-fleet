#!/usr/bin/env python3
"""
Image weight a browser would actually download per page, before vs after
responsive images. Reads built HTML in sites/<site>/dist, resolves each
<picture>/<img> the way a browser does for a given viewport (sizes hint,
srcset widths, AVIF preferred), and sums the file sizes on disk.

Usage: python3 scripts/image-weight.py [site ...]     (default: every site with a dist/)
Prints per site: pages sampled, KB before (original <img src> files) and
KB after at 375 px and 1440 px, plus the heaviest page.

Run `bun run build` first; this reads dist/, not src/.
"""
from __future__ import annotations
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DPR = 2  # phones and most laptops today


def slot_px(sizes: str, vw: int) -> float:
    # minimal `sizes` evaluator: "(max-width: 768px) 100vw, 50vw" / "100vw" / "600px"
    for part in [p.strip() for p in sizes.split(",")]:
        m = re.match(r"\((max|min)-width:\s*(\d+)px\)\s+(.+)", part)
        if m:
            kind, px, val = m.group(1), int(m.group(2)), m.group(3)
            if (kind == "max" and vw <= px) or (kind == "min" and vw >= px):
                return length(val, vw)
        else:
            return length(part, vw)
    return vw


def length(v: str, vw: int) -> float:
    v = v.strip()
    if v.endswith("vw"):
        return vw * float(v[:-2]) / 100
    if v.endswith("px"):
        return float(v[:-2])
    return vw


def pick(srcset: str, need_px: float) -> str:
    cands = []
    for item in srcset.split(","):
        item = item.strip()
        if not item:
            continue
        url, w = item.rsplit(" ", 1)
        cands.append((int(w[:-1]), url))
    cands.sort()
    for w, url in cands:
        if w >= need_px:
            return url
    return cands[-1][1]


def size_of(dist: Path, url: str) -> int:
    f = dist / url.split("?")[0].lstrip("/")
    return f.stat().st_size if f.exists() else 0


def page_weight(dist: Path, html: str, vw: int | None) -> int:
    total = 0
    pictures = re.findall(r"<picture\b[\s\S]*?</picture>", html, re.I)
    rest = re.sub(r"<picture\b[\s\S]*?</picture>", "", html, flags=re.I)
    for pic in pictures:
        img = re.search(r'<img\b[^>]*\ssrc="([^"]+)"', pic)
        if not img:
            continue
        if vw is None:  # "before": what the plain <img> would have fetched
            total += size_of(dist, img.group(1)); continue
        src = re.search(r'<source[^>]+type="image/avif"[^>]*srcset="([^"]+)"[^>]*sizes="([^"]+)"', pic) or \
              re.search(r'<source[^>]+type="image/webp"[^>]*srcset="([^"]+)"[^>]*sizes="([^"]+)"', pic)
        if not src:
            total += size_of(dist, img.group(1)); continue
        total += size_of(dist, pick(src.group(1), slot_px(src.group(2), vw) * DPR))
    for tag in re.findall(r"<img\b[^>]*>", rest, re.I):
        m = re.search(r'\ssrc="(/[^"]+)"', tag)
        if m:
            total += size_of(dist, m.group(1))
    return total


def main(sites: list[str]) -> None:
    if not sites:
        sites = sorted(p.parent.name for p in (ROOT / "sites").glob("*/dist"))
    print(f"{'site':24s} {'pages':>5s} {'before KB':>10s} {'@375 KB':>9s} {'@1440 KB':>9s}  heaviest page @375")
    for s in sites:
        dist = ROOT / "sites" / s / "dist"
        if not dist.is_dir():
            print(f"{s:24s} no dist/ (run the build first)"); continue
        pages = sorted(p for p in dist.rglob("index.html") if "/_r/" not in str(p))
        before = after375 = after1440 = 0
        worst = (0, "")
        for p in pages:
            h = p.read_text(errors="ignore")
            b, a375, a1440 = page_weight(dist, h, None), page_weight(dist, h, 375), page_weight(dist, h, 1440)
            before += b; after375 += a375; after1440 += a1440
            if a375 > worst[0]:
                worst = (a375, "/" + p.relative_to(dist).parent.as_posix().rstrip(".") + "/")
        n = max(len(pages), 1)
        print(f"{s:24s} {len(pages):5d} {before/n/1000:10.0f} {after375/n/1000:9.0f} {after1440/n/1000:9.0f}  {worst[1]} {worst[0]/1000:.0f} KB")


if __name__ == "__main__":
    main(sys.argv[1:])
