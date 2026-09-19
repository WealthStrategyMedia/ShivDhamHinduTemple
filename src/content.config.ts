import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seo = {
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  noindex: z.boolean().default(false),
};

/* Long-form editorial pages: about, mission, facilities, policies, etc. */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().optional(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      order: z.number().default(99),
      section: z.string().optional(),
      ...seo,
    }),
});

/* The six deities enshrined at the temple. */
const deities = defineCollection({
  loader: glob({ base: './src/content/deities', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      sanskrit: z.string().optional(),
      epithet: z.string().optional(),
      summary: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      order: z.number().default(99),
      // Days/festivals especially associated with this deity.
      sacredDays: z.array(z.string()).default([]),
      ...seo,
    }),
});

/* Priests and temple staff. */
const staff = defineCollection({
  loader: glob({ base: './src/content/staff', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      photo: image().optional(),
      languages: z.array(z.string()).default([]),
      order: z.number().default(99),
      ...seo,
    }),
});

/* ------------------------------------------------------------------
   Puja / samskara services. The legacy site modelled these as 84
   WooCommerce products — ~42 rituals duplicated across a "temple" and
   an "at home" variant. Modelling the variants as prices on ONE entry
   halves the content and lets a single page explain the ritual once.
   `stripePriceId` is optional so the catalogue is fully browsable
   before Stripe credentials exist; checkout activates per-variant the
   moment an ID is filled in.
------------------------------------------------------------------- */
const venueVariant = z.object({
  venue: z.enum(['temple', 'home']),
  price: z.number().nullable().default(null),
  stripePriceId: z.string().optional(),
  note: z.string().optional(),
});

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      sanskrit: z.string().optional(),
      category: z.enum([
        'samskara',      // life-cycle rites
        'archana',       // regular worship
        'homam',         // fire rituals
        'shanti',        // remedial / planetary
        'festival',      // festival-specific sponsorship
        'other',
      ]).default('other'),
      summary: z.string(),
      duration: z.string().optional(),
      image: image().optional(),
      variants: z.array(venueVariant).min(1),
      requiresConsultation: z.boolean().default(false),
      order: z.number().default(99),
      /* Why choose Shri Shiv Dham for this particular service — 2-4 short
         reasons shown next to the purchase panel. Falls back to a shared
         set of temple-wide reasons in the template when omitted. */
      whyThisTemple: z.array(z.string()).optional(),
      /* Full override for the purchase button text (e.g. "Register as a
         Vendor" for a non-ceremony listing). When absent, the template
         computes a sensible default from `actionVerb` + title. */
      actionLabel: z.string().optional(),
      actionVerb: z.enum(['book', 'purchase', 'register']).default('book'),
      ...seo,
    }),
});

/* ------------------------------------------------------------------
   Events. The legacy site had 102 entries because every monthly
   Pradosham and Sankata Hara Chaturthi got its own hand-made page.
   Here a recurring puja is ONE entry with a recurrence rule, so the
   temple stops re-creating the same page twelve times a year.

   `source` anticipates the Tweeble pipeline: events authored in
   Tweeble carry source: 'tweeble' plus their canonical URL, and a
   future user-submission flow can write entries with source:
   'submitted' + approved:false without touching this schema.
------------------------------------------------------------------- */
const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().optional(),
      image: image().optional(),
      category: z.enum(['monthly', 'yearly', 'festival', 'class', 'special']).default('special'),

      // Single-occurrence events
      start: z.coerce.date().optional(),
      end: z.coerce.date().optional(),

      // Recurring events (replaces the 102 one-off pages)
      recurrence: z
        .object({
          rule: z.string(),          // human-readable, e.g. "Twice monthly on Pradosham"
          lunarBasis: z.string().optional(), // e.g. "Trayodashi tithi"
        })
        .optional(),

      allDay: z.boolean().default(false),
      location: z.string().default('shiv-dham-hindu-temple-orlando'),
      registrationUrl: z.string().url().optional(),

      // Provenance — see note above.
      source: z.enum(['local', 'tweeble', 'submitted']).default('local'),
      tweebleUrl: z.string().url().optional(),
      approved: z.boolean().default(true),

      featured: z.boolean().default(false),
      ...seo,
    })
    .refine((e) => e.start || e.recurrence, {
      message: 'An event needs either a start date or a recurrence rule.',
    }),
});

/* Where events happen — the temple itself plus offsite venues. */
const locations = defineCollection({
  loader: glob({ base: './src/content/locations', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string().default('FL'),
    zip: z.string(),
    mapUrl: z.string().url().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
});

/* Prayers, shlokas and aarti texts. */
const prayers = defineCollection({
  loader: glob({ base: './src/content/prayers', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    sanskrit: z.string().optional(),
    deity: z.string().optional(),
    occasion: z.string().optional(),
    // A brief, plain-English "what is this and why does it matter" note
    // shown above the prayer text, written for someone with no prior
    // background in Hindu worship.
    summary: z.string().optional(),
    order: z.number().default(99),
    ...seo,
  }),
});

/* Temple Store: festival food and goods ordered in advance for pickup.
   Distinct from `services` (pujas, samskaras, registrations) — these are
   physical items with a flat price, no venue/booking variants. */
const store = defineCollection({
  loader: glob({ base: './src/content/store', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      image: image().optional(),
      price: z.number(),
      unit: z.string().optional(),
      stripePriceId: z.string().optional(),
      order: z.number().default(99),
      ...seo,
    }),
});

export const collections = {
  pages,
  deities,
  staff,
  services,
  events,
  locations,
  prayers,
  store,
};
