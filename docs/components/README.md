# Components

Every component in Astro Fleet, one page each. Each page tells you what the thing is, when to use it, every setting in plain words, a complete example you can copy, and the mistakes people usually make.

**New here?** Read [How components work](#how-components-work) below first. It is short, and it explains the three ideas that apply to all of them.


## All components

| Component | What it is |
|---|---|
| [Banner](./Banner.md) | A strip across the very top of the page for one short announcement. |
| [Breadcrumb](./Breadcrumb.md) | The 'Home > Services > Web design' trail near the top of a page. |
| [ComparisonTable](./ComparisonTable.md) | A grid comparing options down the side against features across the top, with ticks and crosses. |
| [ContactForm](./ContactForm.md) | An enquiry form with name, email, message, spam protection and success and failure messages. |
| [CTABlock](./CTABlock.md) | A full-width band with a heading and one or two buttons, used to ask for the next step. |
| [FAQ](./FAQ.md) | An accordion of questions that open when clicked. No JavaScript at all. |
| [FeatureGrid](./FeatureGrid.md) | A grid of small cards, each with an icon, a title and a line of text. |
| [Footer](./Footer.md) | The bottom of every page: link columns, contact details, social icons and the copyright line. |
| [Header](./Header.md) | The sticky bar at the top: logo, navigation with dropdowns, optional search and language controls, and a call-to-action button. |
| [HeroSlider](./HeroSlider.md) | A rotating set of full-width panels at the top of a page, with dots to move between them. |
| [LogoCloud](./LogoCloud.md) | A quiet row of customer or partner logos. |
| [Newsletter](./Newsletter.md) | A single email field and a subscribe button. |
| [PricingTable](./PricingTable.md) | Side-by-side plan cards with a price, a feature list and a button on each. |
| [ProductCard](./ProductCard.md) | A card for one physical product: photo, name, category, a headline spec and buttons. |
| [SectionDivider](./SectionDivider.md) | A decorative shape between two sections: a wave, a curve, an angle. |
| [SEOHead](./SEOHead.md) | Everything that goes in the invisible `<head>` of a page: the title, the description, social preview tags and structured data. |
| [ServiceCard](./ServiceCard.md) | A card for one service: title, description and a link through to the detail page. |
| [StatsBar](./StatsBar.md) | A horizontal strip of numbers: years in business, projects delivered, that sort of thing. |
| [TeamGrid](./TeamGrid.md) | Cards for the people in your company: photo, name, role, short bio and links. |
| [TestimonialSlider](./TestimonialSlider.md) | A carousel of customer quotes with names, companies and star ratings. |
| [Timeline](./Timeline.md) | A vertical list of dated events running down the page. |
| [TrustBar](./TrustBar.md) | A compact row of short trust signals: certifications, guarantees, a headline number. |
| [Analytics](./Analytics.md) | Google Analytics behind a consent banner. Nothing loads and no cookie is set until the visitor agrees. |
| [SiteSearch](./SiteSearch.md) | Search across every page of the site, using an index built at publish time. No server needed. |

## Layouts

| Layout | What it is |
|---|---|
| [BaseLayout](./BaseLayout.md) | Page wrapper |
| [IndustryLayout](./IndustryLayout.md) | Page wrapper |
| [ProductLayout](./ProductLayout.md) | Page wrapper |

---

## How components work

Three ideas cover all of them.

**1. You pass settings in, the component does the rest.** Every component takes a list of settings, called props. You never edit the component itself.

```astro
---
import CTABlock from '@astro-fleet/shared-ui/src/components/CTABlock.astro';
---
<CTABlock
  heading="Ready to start?"
  primaryButton={{ text: 'Book a call', href: '/contact' }}
/>
```

Text settings go in quotes. Numbers, lists, `true`/`false` and objects go in curly braces. A setting with no value means `true`, so `showLanguages` and `showLanguages={true}` are the same thing.

**2. Colours and fonts come from your design tokens, not from the component.** Change your preset in one place and every component follows. Nothing here needs editing to rebrand a site. See [Design tokens](../design-tokens.md).

**3. Styles cannot leak.** Each component's CSS is scoped to itself, so two components can both use a class called `.title` without colliding.

### Changing how one looks

Override it from the page that uses it:

```astro
<style>
  .cta-block { background: var(--color-accent); }
</style>
```

Or set a variable on a wrapper around it:

```astro
<div style="--color-accent: #e11d48;">
  <CTABlock heading="Sale ends Friday" primaryButton={{ text: 'Shop', href: '/sale' }} />
</div>
```

---

## See also

- [Getting started](../getting-started.md) — clone to deployed, in nine steps
- [Adding a site](../adding-a-site.md) — put a second brand in the same repo
- [Design tokens](../design-tokens.md) — colours, fonts and spacing
- [Translating a site](../i18n.md) — optional second language
- [SEO recipes](../seo-recipes.md) — structured data and meta tags
- [Deployment](../deployment.md) — going live
