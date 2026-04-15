import type { MenuItem } from '@astro-fleet/shared-ui/src/components/Header.astro';
import type {
  FooterColumn,
  ContactInfo,
  SocialLink,
} from '@astro-fleet/shared-ui/src/components/Footer.astro';

export const SITE_NAME = 'Meridian Advisory';
export const TAGLINE = 'Strategic counsel for boards and executives';
export const LOGO_SRC = '/favicon.svg';

export const navigation: MenuItem[] = [
  { label: 'Industries', href: '/services/', children: [
    { label: 'Financial Services', href: '/services/' },
    { label: 'Healthcare',          href: '/services/' },
    { label: 'Energy & Utilities',  href: '/services/' },
    { label: 'Public Sector',       href: '/services/' },
  ]},
  { label: 'Expertise', href: '/services/' },
  { label: 'Insights',  href: '/about/'    },
  { label: 'About',     href: '/about/'    },
  { label: 'Contact',   href: '/contact/'  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: 'Practice Areas',
    links: [
      { label: 'Strategy & Transformation', href: '/services/' },
      { label: 'M&A Advisory',              href: '/services/' },
      { label: 'Risk & Compliance',         href: '/services/' },
      { label: 'Operations',                href: '/services/' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Financial Services',  href: '/services/' },
      { label: 'Healthcare',          href: '/services/' },
      { label: 'Energy & Utilities',  href: '/services/' },
      { label: 'Public Sector',       href: '/services/' },
    ],
  },
  {
    title: 'Firm',
    links: [
      { label: 'About',         href: '/about/' },
      { label: 'Our People',    href: '/about/' },
      { label: 'Careers',       href: '#'       },
      { label: 'Press',         href: '#'       },
    ],
  },
];

export const contactInfo: ContactInfo = {
  email: 'enquiries@meridianadvisory.com',
  phone: '+44 20 7946 0958',
  address: 'One Canada Square, Canary Wharf, London E14 5AB',
};

export const socialLinks: SocialLink[] = [
  { platform: 'linkedin', url: 'https://linkedin.com/company/meridian-advisory' },
  { platform: 'twitter',  url: 'https://twitter.com/meridianadv' },
];
