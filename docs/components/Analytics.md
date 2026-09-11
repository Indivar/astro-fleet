# Analytics

> Google Analytics behind a consent banner. Nothing loads and no cookie is set until the visitor agrees.

**Use it for:** Any site that needs visitor numbers and has European or UK visitors.

**Reach for something else if** you do not read the numbers. Do not collect data you never look at.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import Analytics from '@astro-fleet/shared-ui/src/components/Analytics.astro';
---
```

**2. Use it** in the page body. The reference below has a complete example you can paste.

**3. Rebuild** and look at the page:

```bash
bun run --filter your-site.com dev
```

---

## Settings

| Setting | What it does | Required? | Default |
|---|---|---|---|
| `(see the reference below)` | This one is configured through `BaseLayout` and your site config rather than by passing props directly. | — | — |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Adding a second analytics snippet by hand. You get double counts and you break the consent gate.
- Assuming consent. The whole point is that nothing loads before the visitor accepts.
- Never checking that events arrive. Open the page, accept, and confirm in the realtime report.

---

## Full reference

Google Analytics 4 behind a consent banner, with the tag loading only after the
visitor accepts.

**Why this is stricter than usual.** The common pattern is Consent Mode v2: load
`gtag.js` immediately with `analytics_storage: denied`, then flip it to granted.
That still fetches Google's script and still sends cookieless pings before
anybody has agreed to anything.

Most privacy policies do not describe that. They say something closer to
"analytics runs only if you agree, and if you decline it does not load". This
component keeps that sentence literally: **nothing is requested from
googletagmanager.com until the visitor accepts.** Consent Mode defaults are still
set before the script arrives, because a granted signal needs something to
update.

The trade is worth stating up front: **your numbers will be lower than a site
that tags everyone.** They will also match what your privacy page says.

**Usage**

```astro
<BaseLayout
  gaId="G-XXXXXXXXXX"
  privacyHref="/privacy/"
  ...
>
```

That is the whole integration. Omit `gaId` and nothing renders at all.

**Props**

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `gaId` | `string` | — | GA4 Measurement ID. Omit and no analytics renders |
| `privacyHref` | `string` | `'/privacy/'` | Where your analytics and cookies section lives |

On the component directly (if you mount it outside `BaseLayout`):

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `id` | `string` | — | The Measurement ID |
| `policyHref` | `string` | `'/privacy/'` | Link in the banner |
| `requireConsent` | `boolean` | `true` | `false` loads the tag immediately. Say so on your privacy page |
| `storageKey` | `string` | `'analytics-consent'` | Change it to re-ask everybody after a policy change |

**Behaviour**

- Global Privacy Control is read as a decline, and the banner never shows.
- The choice is stored in `localStorage`. Pages on the same origin share it, so
  a visitor is never asked twice — including a hand-built static page that sets
  the same key.
- `window.track(name, params)` is available on every page and is a **no-op until
  consent**, so callers never have to check. Events are not queued and replayed:
  an event about what somebody did before they agreed is still an event about
  what they did before they agreed.

**Named events**

```js
window.track('generate_lead', { form: 'quote' });
```

`generate_lead` is GA4's own name for a form submission, so it lands in the
standard reports rather than needing a custom definition.

**Styling**

Every rule is wrapped in `:where()`, so it scores zero specificity and your own
stylesheet always wins without `!important`. Set these on `.cons`:

```css
.cons {
  --consent-bg:     #16233A;
  --consent-ink:    #EDF1EC;   /* buttons, borders */
  --consent-ink-3:  #C9D6E4;   /* body text */
  --consent-accent: #4FC6F2;   /* the policy link */
  --consent-width:  1320px;    /* matches your content width */
  --consent-gut:    24px;
  --consent-scrim:  rgb(15 23 42 / 0.45);
}
```

**Update your privacy page in the same commit.** A privacy page describing
analytics behaviour the site does not have is the most common fault in this
area, and the version that promises a consent banner that was never built is the
worst of them.

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
