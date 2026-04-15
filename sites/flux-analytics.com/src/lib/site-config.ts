import type { MenuItem } from '@astro-fleet/shared-ui/src/components/Header.astro';
import type {
  FooterColumn,
  ContactInfo,
  SocialLink,
} from '@astro-fleet/shared-ui/src/components/Footer.astro';

export const SITE_NAME = 'Flux';
export const TAGLINE = 'Product analytics for engineering teams';
export const LOGO_SRC = '/favicon.svg';

export const navigation: MenuItem[] = [
  { label: 'Product', href: '/services/', children: [
    { label: 'Event Pipeline',   href: '/services/' },
    { label: 'Session Replay',   href: '/services/' },
    { label: 'Funnels & Cohorts',href: '/services/' },
    { label: 'SQL Workbench',    href: '/services/' },
  ]},
  { label: 'Pricing',  href: '/services/' },
  { label: 'Docs',     href: '/about/'    },
  { label: 'Changelog',href: '/about/'    },
  { label: 'Sign in',  href: '/contact/'  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Event Pipeline',    href: '/services/' },
      { label: 'Session Replay',    href: '/services/' },
      { label: 'Funnels & Cohorts', href: '/services/' },
      { label: 'SQL Workbench',     href: '/services/' },
      { label: 'Pricing',           href: '/services/' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'SDKs',          href: '#' },
      { label: 'Status',        href: '#' },
      { label: 'Changelog',     href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About',   href: '/about/'   },
      { label: 'Careers', href: '#'         },
      { label: 'Blog',    href: '#'         },
      { label: 'Security',href: '#'         },
    ],
  },
];

export const contactInfo: ContactInfo = {
  email: 'hello@flux.dev',
  phone: '',
  address: 'Remote · San Francisco · Berlin',
};

export const socialLinks: SocialLink[] = [
  { platform: 'twitter',  url: 'https://twitter.com/fluxanalytics' },
  { platform: 'linkedin', url: 'https://linkedin.com/company/flux' },
  { platform: 'youtube',  url: 'https://youtube.com/@flux' },
];
