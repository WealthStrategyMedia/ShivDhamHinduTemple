// Build-time view of the temple's Fundraising Goals feed on Tweeble, which is
// the source of truth for Temple Projects. Each goal gets its own page under
// /temple-projects/ (slug derived from its title). Cover photos, whose signed
// URLs expire within the hour, are loaded in the browser instead.
import { TWEEBLE } from './site';
import type { TweebleFundraisingGoal } from './tweeble-client';
import snapshot from '../data/fundraising-snapshot.json';

export interface GoalPage {
  slug: string;
  goal: TweebleFundraisingGoal;
}

async function fetchGoals(): Promise<TweebleFundraisingGoal[]> {
  try {
    const res = await fetch(TWEEBLE.api.fundraising, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('unexpected response shape');
    return data;
  } catch (err) {
    // A Tweeble hiccup must not block a deploy; fall back to the last saved copy.
    console.warn(`[fundraising] Could not fetch the Tweeble fundraising feed (${err}); using the saved snapshot.`);
    return snapshot as TweebleFundraisingGoal[];
  }
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

let cache: Promise<GoalPage[]> | undefined;

export function getGoalPages(): Promise<GoalPage[]> {
  cache ??= (async () => {
    const goals = await fetchGoals();
    const taken = new Set<string>();
    return goals.map((goal) => {
      const base = slugify(goal.title) || 'project';
      let slug = base;
      for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      taken.add(slug);
      return { slug, goal };
    });
  })();
  return cache;
}

/** goal id -> its on-site page URL. */
export async function getGoalUrlMap(): Promise<Record<string, string>> {
  const pages = await getGoalPages();
  return Object.fromEntries(pages.map(({ slug, goal }) => [goal.id, `/temple-projects/${slug}/`]));
}
