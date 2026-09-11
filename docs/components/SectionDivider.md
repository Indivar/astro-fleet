# SectionDivider

> A decorative shape between two sections: a wave, a curve, an angle.

**Use it for:** Softening the join between two differently-coloured bands.

**Reach for something else if** the sections already sit apart. This is decoration; used often it becomes noise.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import SectionDivider from '@astro-fleet/shared-ui/src/components/SectionDivider.astro';
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
| `shape` | `wave`, `curve`, `angle`, `zigzag`, `rounded` or `arrow`. | no | `wave` |
| `flip` | Mirror it vertically. | no | `false` |
| `fill` | The colour, which must match the section it flows into. | no | your background colour |
| `height` | How tall, in pixels. | no | `64` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- A `fill` that does not match the next section, leaving a visible seam.
- A different shape at every join. Pick one and use it throughout.
- Making it tall on a phone, where it eats the screen.

---

## Full reference

A decorative SVG shape placed between page sections to create visual separation. Six shape presets available, each rendered as a responsive SVG that fills the container width. Flip vertically to use as a section footer.

**When to use:** Between sections with different background colours, between a dark hero and a light content section, or anywhere you want a softer transition than a hard edge.

```ts
export interface Props {
  shape?:  'wave' | 'curve' | 'angle' | 'zigzag' | 'rounded' | 'arrow';  // default: 'wave'
  flip?:   boolean;    // mirror vertically; default: false
  fill?:   string;     // SVG fill colour; default: 'var(--color-background, #ffffff)'
  height?: number;     // pixels; default: 64
}
```

**Between a dark section and a light section:**

```astro
---
import SectionDivider from '@astro-fleet/shared-ui/src/components/SectionDivider.astro';
---
<section style="background: #0f172a; padding: 4rem 1.5rem; color: #fff;">
  <h2>Dark section content</h2>
</section>

<SectionDivider shape="wave" fill="#0f172a" />

<section style="padding: 4rem 1.5rem;">
  <h2>Light section content</h2>
</section>
```

**Available shapes:**
- `wave` — smooth S-curve (default, most organic)
- `curve` — single parabolic arc
- `angle` — sharp V-shape pointing down
- `zigzag` — sawtooth pattern
- `rounded` — wide semicircle
- `arrow` — same as angle but often used flipped

**Using flip for section footer:**

```astro
<SectionDivider shape="curve" fill="#f8fafc" flip={true} />
<section style="background: #f8fafc;">
  <!-- section with light grey background -->
</section>
<SectionDivider shape="curve" fill="#f8fafc" />
```

**Adjusting height:**

```astro
<SectionDivider shape="wave" height={96} />  <!-- taller, more dramatic -->
<SectionDivider shape="wave" height={32} />  <!-- subtle, barely visible -->
```

**CSS variables consumed:** `--color-background` (as default fill)

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
