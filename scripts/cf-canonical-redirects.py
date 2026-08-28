#!/usr/bin/env python3
"""
Create one 301 redirect rule per Cloudflare zone so each site answers on ONE host.

A Pages project with both `acme.com` and `www.acme.com` attached serves 200 on
both, with no redirect between them. That is the same page at two URLs, and
search engines treat it as duplicate content. The canonical host is whatever
the site's astro.config.mjs declares in `site:`; this script only adds the
redirect from the other host to it. Nothing else on the zone changes.

Zones come from a JSON file you fill in (start from infrastructure/zones.example.json):

  { "zones": [ { "name": "acme.com", "zone_id": "...", "from": "acme.com", "canonical": "www.acme.com" } ] }

Usage:
  export CLOUDFLARE_API_TOKEN=...      # needs Zone -> Single Redirect -> Edit on each zone
  python3 scripts/cf-canonical-redirects.py                       # apply, reads infrastructure/zones.json
  python3 scripts/cf-canonical-redirects.py --zones path.json     # apply from another file
  python3 scripts/cf-canonical-redirects.py --check               # only verify with HEAD requests (no token needed)

Idempotent: a zone that already has a rule with the same description is skipped.
"""
import json, os, sys, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
API = "https://api.cloudflare.com/client/v4"


def load_zones(path: Path) -> list[dict]:
    if not path.exists():
        sys.exit(f"{path} not found. Copy infrastructure/zones.example.json to {path} and fill it in.")
    zones = json.loads(path.read_text()).get("zones", [])
    for z in zones:
        for k in ("name", "zone_id", "from", "canonical"):
            if not z.get(k):
                sys.exit(f"zone entry missing '{k}': {z}")
        if z["from"] == z["canonical"]:
            sys.exit(f"{z['name']}: 'from' and 'canonical' are the same host")
    return zones


def api(path, method="GET", data=None):
    req = urllib.request.Request(
        API + path, method=method,
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"},
        data=json.dumps(data).encode() if data is not None else None,
    )
    try:
        return json.load(urllib.request.urlopen(req, timeout=30))
    except urllib.error.HTTPError as e:
        return json.loads(e.read())


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def head(url):
    opener = urllib.request.build_opener(NoRedirect)
    try:
        r = opener.open(urllib.request.Request(url, method="HEAD", headers={"User-Agent": "astro-fleet-check"}), timeout=15)
        return r.status, r.headers.get("Location", "")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location", "")
    except Exception as e:  # noqa: BLE001
        return "ERR", str(e)[:60]


def check(zones) -> bool:
    ok = True
    for z in zones:
        st, loc = head(f"https://{z['from']}/")
        good = st == 301 and loc.startswith(f"https://{z['canonical']}/")
        ok &= good
        print(f"{'OK ' if good else 'BAD'} {z['from']:30s} -> {st} {loc}")
    return ok


def apply(zones) -> None:
    if not TOKEN:
        sys.exit("CLOUDFLARE_API_TOKEN is not set")
    for z in zones:
        src, dst, zid = z["from"], z["canonical"], z["zone_id"]
        desc = f"Canonical host: {src} -> {dst} (301)"
        rule = {
            "description": desc,
            "expression": f'(http.host eq "{src}")',
            "action": "redirect",
            "action_parameters": {"from_value": {
                "status_code": 301,
                "target_url": {"expression": f'concat("https://{dst}", http.request.uri.path)'},
                "preserve_query_string": True,
            }},
            "enabled": True,
        }
        entry = api(f"/zones/{zid}/rulesets/phases/http_request_dynamic_redirect/entrypoint")
        if entry.get("success"):
            existing = entry["result"].get("rules", [])
            if any(r.get("description") == desc for r in existing):
                print(f"skip {z['name']}: rule already present"); continue
            res = api(f"/zones/{zid}/rulesets/{entry['result']['id']}/rules", "POST", rule)
        else:
            res = api(f"/zones/{zid}/rulesets", "POST", {
                "name": "canonical-host-redirect", "kind": "zone",
                "phase": "http_request_dynamic_redirect", "rules": [rule]})
        print(f"{z['name']:24s} {'created' if res.get('success') else res.get('errors')}")


if __name__ == "__main__":
    args = sys.argv[1:]
    zpath = ROOT / "infrastructure/zones.json"
    if "--zones" in args:
        zpath = Path(args[args.index("--zones") + 1])
    zones = load_zones(zpath)
    if "--check" in args:
        sys.exit(0 if check(zones) else 1)
    apply(zones)
    print("\nVerifying live:")
    check(zones)
