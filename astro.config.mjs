// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://shivdhamhindutemple.org',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  image: {
    // Local uploads are pre-optimised at build time by sharp.
    responsiveStyles: true,
  },
});
