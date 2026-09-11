# Banner

> A strip across the very top of the page for one short announcement.

**Use it for:** A sale, a holiday closure, a cookie notice, a 'we have moved' line. One message, one link.

**Reach for something else if** you have more than one thing to say, or the message belongs in the page itself. Two stacked banners get ignored.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import Banner from '@astro-fleet/shared-ui/src/components/Banner.astro';
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
| `text` | The message. Keep it to one sentence. | yes | — |
| `linkText` | Words for the link at the end, e.g. 'See the dates'. | no | no link |
| `linkHref` | Where that link goes. | no | no link |
| `variant` | Colour: `info` (blue), `success` (green), `warning` (amber), `accent` (your brand colour). | no | `info` |
| `dismissible` | Whether visitors can close it. Closing is remembered on their device. | no | `true` |
| `id` | A name for this banner, so closing one does not close the next one you publish. | no | `banner-dismiss` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Reusing the same `id` for a new announcement. Anyone who closed the old one never sees the new one. Give every new banner a new `id`.
- Writing a paragraph. The bar is one line tall on a phone; long text gets cut.
- Using `warning` for something that is not urgent. If everything is amber, nothing is.

---

## Full reference

A top-of-page notification bar for announcements, promotions, or cookie consent. Dismissible via a pure CSS checkbox hack — **no JavaScript required**. The banner stays dismissed for the duration of the page view.

**When to use:** Product launches, maintenance notices, promotional offers, cookie consent banners, or any time-sensitive message that should be visible but dismissible.

```ts
export interface Props {
  text:         string;
  linkText?:    string;      // optional call-to-action text
  linkHref?:    string;      // URL for the link
  variant?:     'info' | 'success' | 'warning' | 'accent';  // default: 'info'
  dismissible?: boolean;     // show close button; default: true
  id?:          string;      // unique ID for dismiss state; default: 'banner-dismiss'
}
```

**Basic usage:**

```astro
---
import Banner from '@astro-fleet/shared-ui/src/components/Banner.astro';
---
<Banner
  text="We've just launched v2.0 with session replay!"
  linkText="See what's new"
  linkHref="/changelog"
  variant="accent"
/>
```

**Multiple banners on one page:** Each banner needs a unique `id` so the dismiss state doesn't conflict:

```astro
<Banner id="cookie-banner" text="We use cookies for analytics." variant="warning" />
<Banner id="promo-banner" text="20% off annual plans this week." variant="accent" linkText="Claim now" linkHref="/pricing" />
```

**Non-dismissible (e.g. maintenance notice):**

```astro
<Banner text="Scheduled maintenance: Saturday 2am–4am UTC." variant="warning" dismissible={false} />
```

**Variant colours:**
- `info` — blue background (#eff6ff)
- `success` — green background (#f0fdf4)
- `warning` — amber background (#fffbeb)
- `accent` — uses your preset's `--color-accent` as a solid background with white text

**CSS variables consumed:** `--color-accent`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
