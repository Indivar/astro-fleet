# Newsletter

> A single email field and a subscribe button.

**Use it for:** Blog pages, article footers, anywhere someone might want to hear from you again.

**Reach for something else if** you are not going to send anything. An empty list is a promise broken slowly.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import Newsletter from '@astro-fleet/shared-ui/src/components/Newsletter.astro';
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
| `formAction` | Where the email is sent. Your mailing-list provider gives you this URL. | no | `#` |
| `heading` | Title. | no | `Stay in the loop` |
| `description` | One line on what they will get and how often. | no | a generic line |
| `buttonText` | The button label. | no | `Subscribe` |
| `placeholder` | Grey hint text in the field. | no | `you@company.com` |
| `variant` | `default` or `filled` for a tinted panel. | no | `default` |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Leaving `formAction` at `#`. The form does nothing and nobody will tell you.
- Not saying how often you send. 'Monthly' doubles sign-ups against saying nothing.
- Asking for a name as well. Every extra field costs subscribers.

---

## Full reference

An email capture form for lead generation and mailing list signups. Provider-agnostic — set `formAction` to your Mailchimp, ConvertKit, Buttondown, Loops, or custom endpoint. Includes built-in privacy text and a `filled` variant for use on white backgrounds.

**When to use:** Bottom of blog posts, above the footer on content pages, or as a standalone section on the home page. The `filled` variant adds a subtle background so the form stands out from white page sections.

```ts
export interface Props {
  heading?:     string;     // default: 'Stay in the loop'
  description?: string;     // default: 'Get product updates and engineering insights...'
  formAction?:  string;     // default: '#'
  buttonText?:  string;     // default: 'Subscribe'
  placeholder?: string;     // default: 'you@company.com'
  variant?:     'default' | 'filled';   // default: 'default'
}
```

**Basic usage:**

```astro
---
import Newsletter from '@astro-fleet/shared-ui/src/components/Newsletter.astro';
---
<Newsletter
  heading="Engineering insights, weekly"
  description="One email per week. Architecture deep-dives, performance tips, and what we shipped. Unsubscribe anytime."
  buttonText="Subscribe"
  variant="filled"
/>
```

**Connecting to email providers:**

```astro
<!-- Buttondown -->
<Newsletter formAction="https://buttondown.email/api/emails/embed-subscribe/yourname" />

<!-- ConvertKit -->
<Newsletter formAction="https://app.convertkit.com/forms/FORM_ID/subscriptions" />

<!-- Mailchimp -->
<Newsletter formAction="https://yourlist.us1.list-manage.com/subscribe/post?u=XXXX&id=YYYY" />
```

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--cta-radius`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
