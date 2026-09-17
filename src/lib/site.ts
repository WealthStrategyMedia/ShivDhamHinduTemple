/**
 * Central site constants. Pulled from the legacy WordPress site's
 * public contact page — update here if any of it changes and every
 * page (footer, contact page, structured data) stays in sync.
 */
export const SITE = {
  name: 'Shri Shiv Dham Hindu Temple',
  shortName: 'Shiv Dham',
  tagline: 'A home for devotion, culture, and community in Central Florida',
  url: 'https://shivdhamhindutemple.org',

  email: 'info@shivatempleorlando.org',
  phone: '+1 407-779-5128',
  phoneHref: 'tel:+14077795128',

  address: {
    street: '460 Oberry Hoover Rd',
    city: 'Orlando',
    state: 'FL',
    zip: '32825',
    full: '460 Oberry Hoover Rd, Orlando, FL 32825',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=460+Oberry+Hoover+Rd+Orlando+FL+32825',
  },

  social: {
    facebook: 'https://www.facebook.com/shivtempleorlando',
    instagram: 'https://www.instagram.com/shivtempleorlando',
    x: 'https://x.com/ShivDhamOrlando',
    youtube: 'https://www.youtube.com/@shrishivdhamhindutemple',
  },
} as const;

// The temple's full events, services, membership, and blog hub lives on
// Tweeble, a separate platform — not a login system on this site. Every
// "Temple Hub" link/button on the site points to this one directory page,
// and the three public API endpoints below feed the live Events, Services,
// and Blog pages so they always reflect what's current on Tweeble.
const TWEEBLE_TENANT_ID = 'a40c7dc3-e6fc-4a90-9451-860aa942a765';
export const TWEEBLE = {
  name: 'Tweeble',
  tenantId: TWEEBLE_TENANT_ID,
  hubUrl: `https://www.tweeble.com/directory/${TWEEBLE_TENANT_ID}`,
  api: {
    events: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/events`,
    services: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/services`,
    blog: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/blog`,
    products: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/products`,
    fundraising: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/fundraising`,
    membership: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/membership-packages`,
    reviews: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/reviews`,
    donate: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/donate`,
    volunteer: `https://www.tweeble.com/api/public/${TWEEBLE_TENANT_ID}/volunteer`,
  },
  donateUrl: `https://www.tweeble.com/directory/${TWEEBLE_TENANT_ID}#donate`,
} as const;

export const NAV = [
  {
    label: 'About',
    href: '/about-us/',
    children: [
      { label: 'About Us', href: '/about-us/' },
      { label: 'Mission & Vision', href: '/mission-and-vision/' },
      { label: "Guruji's Biography", href: '/guruji-biography/' },
      { label: 'Temple Staff', href: '/temple-staff/' },
      { label: 'Brahmrishi Mission Centres', href: '/brahmrishi-mission-centres-india-and-abroad/' },
    ],
  },
  {
    label: 'Deities',
    href: '/deities/',
    children: [
      { label: 'Shri Ganapati', href: '/deities/shri-ganapati/' },
      { label: 'Shri Shiva', href: '/deities/shri-shiva/' },
      { label: 'Shri Durga', href: '/deities/shri-durga/' },
      { label: 'Shri Hanuman', href: '/deities/shri-hanuman/' },
      { label: 'Shri Radha Krishna', href: '/deities/shri-radha-krishna/' },
      { label: 'Shri Navagraha', href: '/deities/shri-navagraha/' },
    ],
  },
  {
    label: 'Worship',
    href: '/prayers/',
    children: [
      { label: 'View Temple Services', href: '/puja-bookings/' },
      { label: 'Prayers & Shlokas', href: '/prayers/' },
      { label: 'Religious Dates & Festivals', href: '/religious-dates-and-festivals/' },
    ],
  },
  { label: 'Store', href: '/temple-store/' },
  {
    label: 'Programs',
    href: '/programs/',
    children: [
      { label: 'All Programs', href: '/programs/' },
      { label: 'Bal Vihar Classes', href: '/bal-vihar-classes/' },
      { label: 'Sadvidya Pathshala', href: '/sadvidya-pathshala/' },
      { label: 'Yoga Classes', href: '/yoga-classes/' },
      { label: 'Music Classes', href: '/music-classes/' },
      { label: 'Language Classes', href: '/language-classes/' },
      { label: 'Dance Classes', href: '/dance-classes/' },
      { label: 'Geetha Classes', href: '/geetha-classes/' },
      { label: 'Summer Camp', href: '/summer-camp/' },
    ],
  },
  {
    label: 'Events',
    href: '/events/',
    children: [
      { label: 'Events Calendar', href: '/events/' },
      { label: 'Blog & News', href: '/blog/' },
      { label: 'Temple Projects', href: '/temple-projects/' },
      { label: 'Fundraising Goals', href: '/fundraising-goals/' },
      { label: 'Membership Drive', href: '/membership-drive/' },
    ],
  },
  {
    label: 'Visit',
    href: '/directions-to-our-temple/',
    children: [
      { label: 'Directions', href: '/directions-to-our-temple/' },
      { label: 'Temple Facilities', href: '/temple-facilities/' },
      { label: 'Gallery', href: '/gallery/' },
      { label: 'Canteen', href: '/canteen/' },
      { label: 'FAQ', href: '/faq/' },
    ],
  },
  {
    label: 'Get Involved',
    href: '/volunteering/',
    children: [
      { label: 'Temple Hub', href: '/temple-hub/' },
      { label: 'Volunteering', href: '/volunteering/' },
      { label: 'Your Voice Matters', href: '/your-voice-matters/' },
      { label: 'Vendor Registration', href: '/vendor-registration/' },
    ],
  },
  { label: 'Contact', href: '/contact-us/' },
] as const;

export const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms & Policies', href: '/terms-and-policies/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Contact Us', href: '/contact-us/' },
] as const;
