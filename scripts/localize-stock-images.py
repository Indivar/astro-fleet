#!/usr/bin/env python3
"""
Bring hotlinked stock photos (Unsplash, Pexels) in-house.

Why: a hotlinked image is a dependency on someone else's server. If the photo
is removed or the URL scheme changes, the page silently shows a broken image,
and every visitor pays a third-party connection and cookie for it. It also
needs that host in your Content-Security-Policy img-src.

What it does, per site:
  1. Finds every Unsplash / Pexels photo URL referenced in src/.
  2. Downloads a large rendition once into  sites/<site>/_media/stock-originals/
     (kept as the archival original, committed).
  3. Writes optimised WebP renditions (640 and 1280 wide, quality 80) into
     sites/<site>/public/images/stock/.
  4. Rewrites every literal URL in src/ to the local file, keeping the 640 or
     1280 size closest to the `w=` the URL asked for.
  5. Writes a manifest.json beside the originals (url, provider, licence, date).

If a site builds URLs from bare ids in a helper (say `unsplash(id)`), the
literal-URL scan cannot see them. Pass `--helper-id-regex` with a file and a
regex whose first group is the id; the helper itself is yours to rewrite:

  python3 scripts/localize-stock-images.py acme.com \\
      --helper-id-regex unsplash:src/lib/images.ts:"'([0-9a-f]{13}-[0-9a-f]{12})'"

Usage:  python3 scripts/localize-stock-images.py <site> [<site> ...]
        python3 scripts/localize-stock-images.py --check   # fail if any built site still hotlinks

Requires Pillow (`pip install pillow`).
Idempotent: existing originals are not re-downloaded; renditions are rebuilt.
Licences: the Unsplash License and the Pexels License both permit free
commercial use and self-hosting without attribution. Check the photo page if
it was taken from anywhere else.
"""
from __future__ import annotations
import io, json, re, sys, time, urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIDTHS = (640, 1280)
QUALITY = 80
ORIGINAL_W = 1920
UA = {"User-Agent": "Mozilla/5.0 (astro-fleet image localiser)"}
SRC_SUFFIXES = {".ts", ".tsx", ".js", ".mjs", ".astro", ".md", ".mdx", ".mdoc", ".json", ".yaml", ".yml"}

UNSPLASH_RE = re.compile(r"https://images\.unsplash\.com/photo-([0-9a-f]+-[0-9a-f]+)[^\"'\s)]*")
PEXELS_RE = re.compile(r"https://images\.pexels\.com/photos/(\d+)/[^\"'\s)]*")


def fetch(url: str) -> bytes:
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception:  # noqa: BLE001
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(url)


def source_url(provider: str, pid: str) -> str:
    if provider == "unsplash":
        return f"https://images.unsplash.com/photo-{pid}?w={ORIGINAL_W}&q=85&fit=crop&auto=format"
    return f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w={ORIGINAL_W}"


def local_name(provider: str, pid: str, w: int) -> str:
    return f"/images/stock/{provider}-{pid}-{w}.webp"


def source_files(site_dir: Path):
    for p in (site_dir / "src").rglob("*"):
        if p.suffix in SRC_SUFFIXES and p.is_file():
            yield p


def collect_ids(site_dir: Path) -> set[tuple[str, str]]:
    ids: set[tuple[str, str]] = set()
    for p in source_files(site_dir):
        t = p.read_text(errors="ignore")
        ids.update(("unsplash", m) for m in UNSPLASH_RE.findall(t))
        ids.update(("pexels", m) for m in PEXELS_RE.findall(t))
    return ids


def collect_helper_ids(site_dir: Path, specs: list[str]) -> set[tuple[str, str]]:
    """`provider:relative/file:regex` entries; the regex's first group is the id."""
    ids: set[tuple[str, str]] = set()
    for spec in specs:
        provider, rel, pattern = spec.split(":", 2)
        if provider not in ("unsplash", "pexels"):
            sys.exit(f"--helper-id-regex provider must be unsplash or pexels: {spec}")
        f = site_dir / rel
        if not f.exists():
            sys.exit(f"--helper-id-regex file not found: {f}")
        ids.update((provider, m) for m in re.findall(pattern, f.read_text()))
    return ids


def process_site(site: str, helper_specs: list[str]) -> None:
    from PIL import Image

    site_dir = ROOT / "sites" / site
    if not site_dir.is_dir():
        sys.exit(f"no such site: sites/{site}")
    originals = site_dir / "_media/stock-originals"
    out = site_dir / "public/images/stock"
    manifest_path = originals / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}

    ids = collect_ids(site_dir) | collect_helper_ids(site_dir, helper_specs)
    print(f"\n{site}: {len(ids)} stock photos referenced")
    if not ids:
        return
    originals.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)
    failed = []
    for provider, pid in sorted(ids):
        key = f"{provider}-{pid}"
        orig = originals / f"{key}.jpg"
        if not orig.exists():
            try:
                data = fetch(source_url(provider, pid))
                img = Image.open(io.BytesIO(data)).convert("RGB")
                img.save(orig, "JPEG", quality=90, optimize=True)
                manifest[key] = {"provider": provider, "id": pid, "source": source_url(provider, pid),
                                 "licence": f"{provider.capitalize()} License (free commercial use, no attribution required)",
                                 "fetched": date.today().isoformat(), "width": img.width, "height": img.height}
                print(f"  fetched  {key} {img.width}x{img.height}")
            except Exception as e:  # noqa: BLE001
                failed.append((key, str(e)[:80]))
                print(f"  FAILED   {key}: {e}")
                continue
        img = Image.open(orig)
        for w in WIDTHS:
            dst = out / f"{key}-{w}.webp"
            if dst.exists():
                continue
            im = img.copy()
            if im.width > w:
                im.thumbnail((w, w * 4), Image.LANCZOS)
            im.save(dst, "WEBP", quality=QUALITY, method=6)
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")

    # ---- rewrite literal URLs in src/ ---------------------------------------
    def repl(provider):
        def _r(m: re.Match) -> str:
            w = re.search(r"[?&]w=(\d+)", m.group(0))
            return local_name(provider, m.group(1), 640 if w and int(w.group(1)) <= 640 else 1280)
        return _r

    rewritten = 0
    for p in source_files(site_dir):
        t = p.read_text(errors="ignore")
        t2 = PEXELS_RE.sub(repl("pexels"), UNSPLASH_RE.sub(repl("unsplash"), t))
        if t2 != t:
            p.write_text(t2); rewritten += 1

    n_orig = len(list(originals.glob("*.jpg")))
    n_webp = len(list(out.glob("*.webp")))
    mb_orig = sum(f.stat().st_size for f in originals.glob("*.jpg")) / 1e6
    mb_webp = sum(f.stat().st_size for f in out.glob("*.webp")) / 1e6
    print(f"  originals {n_orig} ({mb_orig:.1f} MB) | webp renditions {n_webp} ({mb_webp:.1f} MB) | source files rewritten {rewritten} | failed {len(failed)}")
    for k, e in failed:
        print(f"    failed: {k} {e}")
    if helper_specs:
        print("  helper ids fetched; now point the helper at /images/stock/<provider>-<id>-<640|1280>.webp yourself")
    if n_webp:
        print(f"  next: python3 scripts/responsive-images.py {site}   (adds AVIF and the smaller widths)")


def check() -> int:
    bad = 0
    for dist in sorted((ROOT / "sites").glob("*/dist")):
        for p in dist.rglob("*.html"):
            t = p.read_text(errors="ignore")
            for m in re.findall(r'<img[^>]+src="(https://images\.(?:unsplash|pexels)\.com[^"]*)"', t):
                bad += 1
                print(f"HOTLINK {p.relative_to(ROOT)} -> {m[:80]}")
    print(f"{bad} hotlinked stock image(s) in built sites")
    return 1 if bad else 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--check" in args:
        sys.exit(check())
    helper_specs = []
    sites = []
    i = 0
    while i < len(args):
        if args[i] == "--helper-id-regex":
            helper_specs.append(args[i + 1]); i += 2
        else:
            sites.append(args[i]); i += 1
    if not sites:
        sys.exit(__doc__)
    for s in sites:
        process_site(s, helper_specs)
