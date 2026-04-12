/**
 * site-config.ts
 * ---------------
 * Central configuration for the Starter site.
 * Edit this file to customise your site's identity, navigation,
 * footer, contact details, and social links.
 *
 * All values here are passed into shared-ui components (BaseLayout,
 * Header, Footer) so a single change propagates site-wide.
 */

import type { MenuItem } from '@astro-fleet/shared-ui/src/components/Header.astro';
import type {
  FooterColumn,
  ContactInfo,
  SocialLink,
} from '@astro-fleet/shared-ui/src/components/Footer.astro';

// ---------------------------------------------------------------------------
// Site identity
// ---------------------------------------------------------------------------

/** The human-readable name of your site, used in the <title>, header, and footer. */
export const SITE_NAME = 'Starter Site';

/** A short tagline displayed in the footer beneath the site name. */
export const TAGLINE = 'Built with Astro Fleet';

/** Absolute URL path to the logo image rendered in the header.
 *  Use '/favicon.svg' to fall back to the SVG favicon, or swap in
 *  a PNG/WebP logo at any time. Set to undefined to show a text logo. */
export const LOGO_SRC = '/favicon.svg';

// ---------------------------------------------------------------------------
// Header navigation
// ---------------------------------------------------------------------------

/**
 * Top-level navigation items shown in the header.
 * Each item requires a `label` (link text) and `href` (URL path).
 * Add optional `children` arrays to create dropdown sub-menus.
 *
 * Example with dropdown:
 *   { label: 'Products', href: '/products/', children: [
 *     { label: 'Widget A', href: '/products/widget-a/' },
 *   ]}
 */
export const navigation: MenuItem[] = [
  { label: 'Home',     href: '/'          },
  { label: 'About',    href: '/about/'    },
  { label: 'Services', href: '/services/' },
  { label: 'Contact',  href: '/contact/'  },
];

// ---------------------------------------------------------------------------
// Footer columns
// ---------------------------------------------------------------------------

/**
 * Three link columns rendered in the footer grid.
 * Each column has a `title` heading and an array of `{ label, href }` links.
 * Remove a column object to reduce to two columns, or add a fourth as needed.
 */
export const footerColumns: FooterColumn[] = [
  {
    title: 'Company',
    links: [
      { label: 'About Us',  href: '/about/'   },
      { label: 'Services',  href: '/services/' },
      { label: 'Contact',   href: '/contact/'  },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Web Development',   href: '/services/' },
      { label: 'Cloud Hosting',     href: '/services/' },
      { label: 'SEO Optimization',  href: '/services/' },
      { label: 'Analytics',         href: '/services/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog',          href: '#' },
      { label: 'Changelog',     href: '#' },
      { label: 'Support',       href: '#' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Contact information
// ---------------------------------------------------------------------------

/**
 * Contact details rendered in the footer's contact section.
 * All fields are optional — omit any you don't want displayed.
 */
export const contactInfo: ContactInfo = {
  /** Primary email address shown in the footer. */
  email: 'hello@example.com',

  /** Phone number shown in the footer (include country code for clarity). */
  phone: '+1 (555) 123-4567',

  /** Physical or mailing address displayed in the footer. */
  address: '123 Main Street, Anytown',
};

// ---------------------------------------------------------------------------
// Social media links
// ---------------------------------------------------------------------------

/**
 * Social media links rendered as icon buttons in the footer.
 * Supported `platform` values (matched to built-in SVG icons in Footer.astro):
 *   'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'whatsapp'
 *
 * Set `url` to your actual profile URL.
 * Remove any entries you don't need.
 */
export const socialLinks: SocialLink[] = [
  { platform: 'twitter',  url: 'https://twitter.com/example'  },
  { platform: 'linkedin', url: 'https://linkedin.com/company/example' },
];
