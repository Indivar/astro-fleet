import type { MenuItem } from '@astro-fleet/shared-ui/src/components/Header.astro';
import type {
  FooterColumn,
  ContactInfo,
  SocialLink,
} from '@astro-fleet/shared-ui/src/components/Footer.astro';

export const SITE_NAME = 'Olive & Vine';
export const TAGLINE = 'Wood-fired Mediterranean · est. 2014';
export const LOGO_SRC = '/favicon.svg';

export const navigation: MenuItem[] = [
  { label: 'Menu',           href: '/services/' },
  { label: 'Our Story',      href: '/about/'    },
  { label: 'Private Events', href: '/about/'    },
  { label: 'Visit',          href: '/contact/'  },
  { label: 'Reservations',   href: '/contact/'  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: 'Dine With Us',
    links: [
      { label: 'Dinner Menu',     href: '/services/' },
      { label: 'Weekend Brunch',  href: '/services/' },
      { label: 'Wine List',       href: '/services/' },
      { label: 'Private Events',  href: '/about/'    },
    ],
  },
  {
    title: 'Visit',
    links: [
      { label: 'Reservations',    href: '/contact/'  },
      { label: 'Opening Hours',   href: '/contact/'  },
      { label: 'Location & Map',  href: '/contact/'  },
      { label: 'Gift Cards',      href: '#'          },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story',   href: '/about/' },
      { label: 'The Kitchen', href: '/about/' },
      { label: 'Press',       href: '#'       },
      { label: 'Careers',     href: '#'       },
    ],
  },
];

export const contactInfo: ContactInfo = {
  email: 'reservations@oliveandvine.com',
  phone: '+1 (415) 555 0142',
  address: '1847 Valencia Street, San Francisco, CA 94110',
};

export const socialLinks: SocialLink[] = [
  { platform: 'instagram', url: 'https://instagram.com/oliveandvine' },
  { platform: 'facebook',  url: 'https://facebook.com/oliveandvine'  },
];
