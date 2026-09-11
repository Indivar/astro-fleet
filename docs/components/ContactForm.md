# ContactForm

> An enquiry form with name, email, message, spam protection and success and failure messages.

**Use it for:** Contact pages, quote requests, product enquiry pages. It is the main way a visitor becomes a lead.

**Reach for something else if** you need file uploads, payments or multi-step logic. This is a single-screen enquiry form on purpose.

---

## Add it to a page

**1. Import it** in the frontmatter, the block between the two `---` lines at the top of your `.astro` file:

```astro
---
import ContactForm from '@astro-fleet/shared-ui/src/components/ContactForm.astro';
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
| `formAction` | Where the form sends its data. Your own endpoint or a form service. | no | `/api/enquiry` |
| `machineName` | Pre-fills the 'Product interest' field. Use it on a product page so you know what they were looking at. | no | empty |
| `machineSlug` | Sent along invisibly, so you can identify the exact page. | no | none |
| `industries` | Supply a list and you get a dropdown. Leave it out and there is no dropdown. | no | no dropdown |
| `showWhatsApp` | Adds a WhatsApp button beside the send button. | no | `false` |
| `whatsAppNumber` | Your number in international format, e.g. `+15551234567`. | no | — |
| `whatsAppMessage` | The message pre-typed for them. | no | — |
| `heading` | Title above the form. | no | `Send Us an Enquiry` |
| `description` | A line under the heading. | no | none |
| `successText` | What the visitor reads after a successful send. Promise a real timeframe. | no | a generic thank you |
| `errorText` | What they read if it fails. Give them another way to reach you. | no | a generic error |

Settings are passed like HTML attributes. Text goes in quotes; numbers, lists, `true`/`false` and objects go in curly braces. A setting written with no value means `true`.

---

## Common mistakes

- Leaving `formAction` at its default without building an endpoint. The form will appear to work and the enquiry will go nowhere. Send yourself a test the day you launch, every time.
- Writing 'We'll be in touch soon' in `successText`. Say when. 'We reply within one working day' sets an expectation you can keep.
- An `errorText` that only apologises. Put your email address in it, or you lose the lead.
- Removing the hidden anti-spam field. It is invisible to people and catches most bots.

---

## Full reference

A full enquiry form with fields for name, company, email, phone, optional industry dropdown, product interest, and message. Includes built-in validation styling (`:invalid:not(:placeholder-shown)`), an off-screen honeypot, two hidden status lines for a submit handler to reveal, and an optional WhatsApp CTA for markets where WhatsApp is preferred.

**When to use:** Contact pages, product inquiry pages, demo request forms. The form is provider-agnostic — set `formAction` to your own API endpoint, Formspree, Netlify Forms, or any backend.

```ts
export interface Props {
  formAction?:      string;     // default: '/api/enquiry'
  machineName?:     string;     // pre-fills the Product Interest field
  machineSlug?:     string;     // added as a hidden field
  showWhatsApp?:    boolean;    // default: false
  whatsAppNumber?:  string;     // international format, e.g. '+15551234567'
  whatsAppMessage?: string;     // pre-filled WhatsApp message
  heading?:         string;     // default: 'Send Us an Enquiry'
  description?:     string;
  industries?:      string[];   // renders a <select> dropdown when provided
  successText?:     string;     // status line a handler shows after a 2xx
  errorText?:       string;     // status line after anything else; say what to do instead
}
```

**Spam.** The form carries an off-screen text field named `_hp`. Visitors never
see it (it is positioned off-canvas, `tabindex="-1"`, `aria-hidden`), so a
submission that arrives with `_hp` filled in came from a bot. Reject those at
the endpoint. Your endpoint still needs rate limiting; a honeypot is a filter,
not a wall.

**States.** Two lines sit under the submit button, hidden until something
happens:

```html
<p data-cf-status="success" role="status" hidden>Thank you. We reply within one working day.</p>
<p data-cf-status="error"   role="alert"  hidden>We could not send that just now. Please email or call us instead.</p>
```

Set the copy with `successText` and `errorText`. The error line should say what
to do instead, not apologise.

**Basic usage:**

```astro
---
import ContactForm from '@astro-fleet/shared-ui/src/components/ContactForm.astro';
---
<ContactForm
  heading="Get in Touch"
  description="We'll respond within one business day."
  formAction="/api/contact"
/>
```

**With industry dropdown and WhatsApp:**

```astro
<ContactForm
  heading="Request a Quote"
  description="Tell us about your requirements."
  formAction="https://formspree.io/f/yourformid"
  showWhatsApp={true}
  whatsAppNumber="+15551234567"
  whatsAppMessage="Hi, I'd like a quote for..."
  industries={['Manufacturing', 'Retail', 'Healthcare', 'Finance', 'Other']}
/>
```

**Connecting to form providers:**
- **Formspree:** `formAction="https://formspree.io/f/your-form-id"`
- **Netlify Forms:** add `data-netlify="true"` to the form via a slot or custom integration
- **Custom API:** `formAction="/api/contact"` and handle the POST on your backend
- **Site-owned handler:** leave `formAction="#"` and post from a script on the page, as below

**A site-owned submit handler.** The component is plain HTML and owns nothing
about the request. A page that wants to post JSON, show the status lines and
count the lead adds a `<script>` beside the component. The starter's
`src/pages/contact.astro` carries a working one; the shape is:

```ts
const FORM_ENDPOINT = 'https://example.com/api/enquiry';

function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('#enquiry-form form');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';
  const field = (name: string) => {
    const el = form.elements.namedItem(name) as HTMLInputElement | null;
    return el && 'value' in el ? el.value.trim() : '';
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector<HTMLButtonElement>('.contact-form__submit');
    const ok = form.querySelector<HTMLElement>('[data-cf-status="success"]');
    const err = form.querySelector<HTMLElement>('[data-cf-status="error"]');
    if (ok) ok.hidden = true;
    if (err) err.hidden = true;
    if (button) button.disabled = true;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: field('name'), company: field('company'), email: field('email'),
          phone: field('phone'), message: field('message'), _hp: field('_hp'),
        }),
      });
      if (!res.ok) throw new Error(`form endpoint ${res.status}`);
      if (ok) ok.hidden = false;
      form.reset();
      // Only after a 2xx. A lead that never arrived is not a lead.
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'generate_lead', { form: 'contact' });
    } catch {
      if (err) err.hidden = false;
    } finally {
      if (button) button.disabled = false;
    }
  });
}
initContactForm();
document.addEventListener('astro:page-load', initContactForm);
```

Four things in it are deliberate:

1. **The button is disabled while the request is in flight** and re-enabled in
   `finally`, so a slow endpoint cannot collect the same enquiry twice and a
   failed one leaves the button usable.
2. **The analytics event fires only after a 2xx.** Firing on click counts
   submissions the endpoint never received, and every dashboard downstream
   inherits the lie. With the built-in `Analytics` component,
   `window.track('generate_lead', ...)` does the same and is a no-op until
   consent.
3. **`_hp` is sent as-is.** The endpoint rejects the submission if it has a
   value. Do not filter it out client-side; the bot's script is what you are
   catching.
4. **It re-binds on `astro:page-load`** and guards with `data-bound`, so it
   survives view transitions and cannot attach twice.

The endpoint's origin has to be in `connect-src` (and `form-action`) in
`public/_headers`, or the browser blocks the request and the visitor sees the
error line for no reason they can fix. See `docs/deployment.md`, "Security
headers".

**CSS variables consumed:** `--color-accent`, `--color-cta`, `--color-primary`, `--cta-radius`, `--font-heading`, `--font-body`

---

---

[← All components](./README.md) · [Design tokens](../design-tokens.md) · [Getting started](../getting-started.md)
