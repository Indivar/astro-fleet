# Deployment

Three deployment paths are supported. All of them consume the same static output from `sites/<domain>/dist/` produced by `bun run build --filter=<domain>`.

---

## Common prerequisites (all paths)

- **Bun** — [bun.sh](https://bun.sh)
- **Git**
- **Node.js 18+**
- A working build: `bun run build --filter=<domain>` completes without errors

---

## Option 1 — Cloudflare Pages (recommended)

Cloudflare Pages is free, globally distributed, and requires zero server management. Each site gets its own Pages project. Deployments go live in seconds.

### Prerequisites

- Cloudflare account (free tier is sufficient — [dash.cloudflare.com](https://dash.cloudflare.com))
- `wrangler` CLI: `bun add -g wrangler`
- **API token** — Cloudflare dashboard → My Profile → API Tokens → Create Token → use the "Edit Cloudflare Workers" template. Copy the token.
- **Account ID** — visible on the right-hand sidebar of any zone overview page in the Cloudflare dashboard.
- One Pages project per site (created in step 3 below)
- DNS for the domain added to Cloudflare, with the custom domain linked to the Pages project

### Step-by-step

**1. Install wrangler globally**

```bash
bun add -g wrangler
```

**2. Authenticate**

```bash
wrangler login
```

This opens a browser to authorise. Alternatively set environment variables:

```bash
export CLOUDFLARE_API_TOKEN=<your-token>
export CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

**3. Create a Pages project (once per site)**

```bash
wrangler pages project create acme-com
```

Choose "Direct upload" when prompted. The project name can be anything — by convention use the domain with hyphens.

**4. Build the site**

```bash
bun run build --filter=acme.com
```

**5. Deploy to staging (preview)**

```bash
wrangler pages deploy sites/acme.com/dist \
  --project-name=acme-com \
  --branch=staging \
  --commit-dirty=true
```

Wrangler prints a preview URL (`https://staging.<hash>.acme-com.pages.dev`). Use this to verify before promoting.

**6. Deploy to production**

```bash
wrangler pages deploy sites/acme.com/dist \
  --project-name=acme-com \
  --branch=main \
  --commit-dirty=true
```

Traffic on the `main` branch is served from your production domain.

**7. Add a custom domain**

In the Cloudflare dashboard: Pages project → Custom Domains → Add a domain. Enter `acme.com` and `www.acme.com`. Cloudflare creates the DNS records automatically if the domain is already on Cloudflare.

### Staging vs production summary

| Branch flag | Behaviour |
|-------------|-----------|
| `--branch=staging` | Preview deployment — unique URL, not the production domain |
| `--branch=main` | Production deployment — served from custom domain |

### One canonical host

Attaching both `acme.com` and `www.acme.com` to a Pages project makes both
answer 200, with no redirect between them. Every page now exists at two URLs.
Search engines treat that as duplicate content: the `<link rel="canonical">`
that `BaseLayout` emits is a hint, and a hint loses to a second live copy often
enough that rankings split between the two hosts.

Pick one. The canonical host is whatever `site:` says in `astro.config.mjs`;
the other host should answer `301` to it. Cloudflare does this with a Single
Redirect rule on the zone, and `scripts/cf-canonical-redirects.py` creates one
per zone from a list you fill in:

```bash
cp infrastructure/zones.example.json infrastructure/zones.json   # gitignored
# edit: name, zone_id, from, canonical (canonical must match astro.config.mjs)
export CLOUDFLARE_API_TOKEN=...
python3 scripts/cf-canonical-redirects.py            # create the rules
python3 scripts/cf-canonical-redirects.py --check    # HEAD each `from` host; needs no token
```

The token needs **Zone → Single Redirect → Edit** on each zone, which the
"Edit Cloudflare Workers" template does not include. The script is idempotent:
a zone that already has the rule is skipped. `--check` is worth running after
any DNS or Pages change, because a domain re-attached in the dashboard comes
back without the redirect.

Query strings are preserved and the path is kept, so `http://acme.com/pricing/?utm_source=x`
lands on `https://www.acme.com/pricing/?utm_source=x`.

### Security headers

`public/_headers` in the starter sets the full set: HSTS,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, `No-Vary-Search`, cache lifetimes, and an enforced
`Content-Security-Policy`. Cloudflare Pages and Netlify both read the file as
is. Vercel wants the same values in `vercel.json`; Caddy sets them in the
Caddyfile.

The CSP starts at `'self'` plus the inline styles and scripts Astro emits.
**Every host a page talks to has to be added to it**, or the browser blocks
the request and the only sign is a line in the console:

| The page does this | Add the host to |
|---|---|
| Posts the contact form to an endpoint | `connect-src` (fetch) and `form-action` (a plain submit) |
| Loads GA4 through the `Analytics` component | `script-src`: `https://www.googletagmanager.com`; `connect-src`: `https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com`; `img-src`: `https://*.google-analytics.com` |
| Has Cloudflare Web Analytics switched on in the dashboard | `script-src`: `https://static.cloudflareinsights.com`; `connect-src`: `https://cloudflareinsights.com` |
| Embeds a map, video or calendar | `frame-src` (the starter sets it to `'none'`) |
| Shows an image from another host | `img-src` |

The Cloudflare beacon is the one that catches people: it is injected at the
edge, not by anything in the repo, so a CSP that was correct on staging blocks
it in production and page views quietly stop counting.

**After any change to `_headers`, verify it on the live site in a real
browser**, not with `curl`: open the page, submit the form, and read the
console. `curl -I` shows the header arrived; only the browser shows what it
blocked. A response header that is right and a form that no longer submits
look identical from the terminal.

---

## Option 2 — Vercel or Netlify

Both platforms support static Astro sites on their free tiers with automatic HTTPS and global CDN.

### Prerequisites

- Account on [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com) (free tier)
- CLI installed and logged in (see below)

### Vercel

**Install and login:**

```bash
bun add -g vercel
vercel login
```

**Deploy (first time — configures the project):**

```bash
cd sites/acme.com
vercel
```

When prompted:

- Root directory: `sites/acme.com` (or `.` if you are already inside it)
- Build command: `bun run build`
- Output directory: `dist`
- Override settings: Yes, set output to `dist`

**Subsequent deploys:**

```bash
bun run build --filter=acme.com
cd sites/acme.com && vercel --prod
```

**Add custom domain:**

Vercel dashboard → project → Settings → Domains → Add. Follow the DNS instructions.

### Netlify

**Install and login:**

```bash
bun add -g netlify-cli
netlify login
```

**Deploy (first time):**

```bash
bun run build --filter=acme.com
netlify deploy --dir=sites/acme.com/dist
```

Netlify prints a draft URL. Inspect it, then promote to production:

```bash
netlify deploy --dir=sites/acme.com/dist --prod
```

**Add custom domain:**

Netlify dashboard → Site settings → Domain management → Add custom domain. Update your DNS with the CNAME Netlify provides.

---

## Option 3 — Self-hosted (Traefik + Caddy on a VPS)

Run all your sites from a single VPS. Traefik handles SSL (via Let's Encrypt) and routes traffic. Caddy serves the static files with gzip, immutable caching headers, and security headers.

### Prerequisites

- **VPS** — Hetzner CX22 (~$5/month) is the tested baseline: 2 vCPU, 4 GB RAM, 40 GB SSD. Any Ubuntu/Debian host works.
- **SSH access** to the server as root or a sudo user
- **Docker and Docker Compose** installed on the server (`apt install docker.io docker-compose-plugin`)
- **DNS A records** for each domain pointing at the VPS IP address (and `www.` CNAME or A record too)
- **Ports 80 and 443 open** in the VPS firewall
- **An email address** for Let's Encrypt certificate notifications

### Step-by-step

**1. On your local machine — generate the infrastructure config**

```bash
./scripts/setup-infra.sh acme.com,shop.acme.com
```

The script:
- Generates `infrastructure/Caddyfile` with a routing block per domain
- Copies `infrastructure/.env.example` to `infrastructure/.env` and fills in random secrets
- Prints the volume mount lines you need to add to `docker-compose.yml`

**2. Edit infrastructure/.env**

```bash
# infrastructure/.env
ACME_EMAIL=you@example.com       # required — Let's Encrypt sends cert expiry notices here
POSTGRES_USER=fleet
POSTGRES_PASSWORD=<generated>
POSTGRES_DB=fleet
```

Set `ACME_EMAIL` to a real address.

**3. Add volume mounts to docker-compose.yml**

Open `infrastructure/docker-compose.yml`. Find the `caddy` service `volumes` section and add a mount for each site (the script printed these lines):

```yaml
caddy:
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile:ro
    - caddy_data:/data
    - caddy_config:/config
    # add one line per site:
    - ../sites/acme.com/dist:/srv/acme.com:ro
    - ../sites/shop.acme.com/dist:/srv/shop.acme.com:ro
```

Also add Traefik routing labels for each site in the same `caddy` service `labels` section:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.acme.rule=Host(`acme.com`) || Host(`www.acme.com`)"
  - "traefik.http.routers.acme.entrypoints=websecure"
  - "traefik.http.routers.acme.tls.certresolver=letsencrypt"
  - "traefik.http.routers.shop.rule=Host(`shop.acme.com`)"
  - "traefik.http.routers.shop.entrypoints=websecure"
  - "traefik.http.routers.shop.tls.certresolver=letsencrypt"
  # global HTTP→HTTPS redirect (already present in the template):
  - "traefik.http.routers.caddy-http.rule=HostRegexp(`{host:.+}`)"
  - "traefik.http.routers.caddy-http.entrypoints=web"
  - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
  - "traefik.http.routers.caddy-http.middlewares=redirect-to-https"
  - "traefik.http.services.caddy.loadbalancer.server.port=80"
```

**4. Build all sites locally**

```bash
bun run build
```

**5. Copy the built files and config to the server**

```bash
rsync -avz --delete \
  infrastructure/ \
  sites/acme.com/dist/ \
  sites/shop.acme.com/dist/ \
  user@<vps-ip>:/opt/astro-fleet/
```

Adjust paths to match where you want the files on the server.

**6. Start the stack**

```bash
ssh user@<vps-ip>
cd /opt/astro-fleet/infrastructure
docker compose up -d
```

Traefik requests Let's Encrypt certificates on first startup. Allow 30–60 seconds for certificates to be issued.

**7. Verify**

```bash
curl -I https://acme.com
# HTTP/2 200
```

Check Traefik logs if a certificate is not issued:

```bash
docker compose logs traefik --follow
```

### Updating a site

Build locally, rsync the new `dist/` directory, then reload Caddy:

```bash
bun run build --filter=acme.com
rsync -avz --delete sites/acme.com/dist/ user@<vps-ip>:/opt/astro-fleet/sites/acme.com/dist/
ssh user@<vps-ip> "docker compose -f /opt/astro-fleet/infrastructure/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile"
```

Caddy hot-reloads without dropping connections.

### Adding a new site to an existing stack

1. Run `./scripts/new-site.sh newsite.com` locally and build it.
2. Re-run `./scripts/setup-infra.sh acme.com,shop.acme.com,newsite.com` — this regenerates the Caddyfile with the new domain.
3. Add the new volume mount and Traefik labels to `docker-compose.yml`.
4. Rsync everything and restart: `docker compose up -d --force-recreate caddy`.
