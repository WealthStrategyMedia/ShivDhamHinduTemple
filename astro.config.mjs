// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Pages that render `noindex` in BaseLayout — keep this in sync with those
// pages so the sitemap never lists a URL search engines are told to skip.
const NOINDEX_PATHS = [
  '/donation-confirmation/',
  '/donation-failed/',
  '/order-confirmation/',
  '/order-failed/',
  '/events/archive/',
  '/puja-bookings/archive/',
];

export default defineConfig({
  site: 'https://shivatempleorlando.org',
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.some((p) => new URL(page).pathname === p),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  image: {
    // Local uploads are pre-optimised at build time by sharp.
    responsiveStyles: true,
  },
});
