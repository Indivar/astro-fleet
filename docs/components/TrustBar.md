# TrustBar

> A compact row of short trust signals: certifications, guarantees, a headline number.

**Use it for:** Just under a hero, or above a form, where a moment of reassurance helps.

**Reach for something else if** you would be listing things every competitor also has.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import TrustBar from '@astro-fleet/shared-ui/src/components/TrustBar.astro';
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
| `items` | The signals, each with `text` and an optional icon. | yes | — |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Claiming certifications you do not hold. This one has legal consequences, not just reputational ones.
- Six items squeezed into one row on a phone.
- Vague claims like 'Best quality'. Name the standard or the number.

---

## Full reference

A compact horizontal bar of trust indicators — certifications, stats, or awards. Renders with a subtle grid background using `--color-primary`. Icons are optional and injected as raw SVG strings.

**When to use:** Directly below the hero, above the fold, to establish immediate credibility. Keep it to 3–5 items for readability.

```ts
export interface TrustItem {
  icon?: string;   // raw SVG string injected via set:html
  text:  string;
}

export interface Props {
  items: TrustItem[];
}
```

**Usage:**

```astro
---
import TrustBar from '@astro-fleet/shared-ui/src/components/TrustBar.astro';
---
<TrustBar
  items={[
    { text: 'ISO 9001 Certified' },
    { text: '500+ Clients Worldwide' },
    { text: '99.9% Uptime SLA' },
    { text: '24/7 Support' },
  ]}
/>
```

**CSS variables consumed:** `--color-primary`, `--color-accent`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
