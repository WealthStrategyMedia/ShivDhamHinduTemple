// Build-time view of the temple's Programs feed on Tweeble. The feed decides
// which programs exist: each one gets its own page (at a flat URL derived from
// its title, e.g. "Yoga Classes" -> /yoga-classes/) and a nav link. Anything
// that changes faster than a deploy (cover photos, whose signed URLs expire
// within the hour, plus price and next session) is refreshed in the browser.
import { getCollection } from 'astro:content';
import { TWEEBLE } from './site';
import type { TweebleProgram } from './tweeble-client';
import snapshot from '../data/programs-snapshot.json';

export interface ProgramPage {
  slug: string;
  program: TweebleProgram;
}

// Sub-pages that already own a URL; a program slug must never shadow one.
const ROUTE_DIRS = Object.keys(import.meta.glob('../pages/*/index.astro')).map((key) => key.split('/')[2]);

// Where a program has a related page on this site, link to it from the
// program's own page (keyed by lower-cased program title).
export const PROGRAM_EXTRA_LINKS: Record<string, { label: string; href: string }> = {
  'summer camp': { label: 'Summer Camp Registration Form', href: '/summer-camp-registration-form/' },
};

async function fetchPrograms(): Promise<TweebleProgram[]> {
  try {
    const res = await fetch(TWEEBLE.api.programs, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('unexpected response shape');
    return data;
  } catch (err) {
    // A Tweeble hiccup must not block a deploy; fall back to the last saved copy.
    console.warn(`[programs] Could not fetch the Tweeble programs feed (${err}); using the saved snapshot.`);
    return snapshot as TweebleProgram[];
  }
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

let cache: Promise<ProgramPage[]> | undefined;

export function getProgramPages(): Promise<ProgramPage[]> {
  cache ??= (async () => {
    const programs = await fetchPrograms();
    const taken = new Set<string>([
      ...ROUTE_DIRS,
      ...(await getCollection('pages')).map((entry) => entry.id.replace(/\/index$/, '')),
    ]);
    return programs.map((program) => {
      const base = slugify(program.title) || 'program';
      let slug = base;
      for (let n = 1; taken.has(slug); n++) slug = n === 1 ? `${base}-program` : `${base}-program-${n}`;
      taken.add(slug);
      return { slug, program };
    });
  })();
  return cache;
}

/** program id -> its page URL, for cards that should link to the on-site page. */
export async function getProgramUrlMap(): Promise<Record<string, string>> {
  const pages = await getProgramPages();
  return Object.fromEntries(pages.map(({ slug, program }) => [program.id, `/${slug}/`]));
}
