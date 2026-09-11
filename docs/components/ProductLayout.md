# ProductLayout

A layout wraps a whole page: it supplies the `<head>`, the header, the footer and the page shell, so your page file only holds its own content.

---

Extends `BaseLayout`. Adds breadcrumb navigation, a two-column layout (content + sidebar), a related products slot, and an automatic `CTABlock` at the bottom.

**Additional props (on top of BaseLayout):**

```ts
export interface Props extends BaseLayoutProps {
  breadcrumbs?:        BreadcrumbItem[];
  category?:           string;
  showCTA?:            boolean;
  ctaHeading?:         string;
  ctaDescription?:     string;
  ctaPrimaryButton?:   { text: string; href: string };
  ctaSecondaryButton?: { text: string; href: string };
}
```

**Named slots:** `head`, `hero`, `sidebar`, `related`, `footer-scripts`

---

---

[← All components](./README.md) · [Getting started](../getting-started.md)
