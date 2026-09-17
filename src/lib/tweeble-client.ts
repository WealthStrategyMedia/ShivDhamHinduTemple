// Client-side fetching for Tweeble's public API. This runs in the browser
// (bundled into page scripts), never at build time — the API's cover-image
// URLs are pre-signed and expire within the hour, and the temple adds new
// events/services/posts on Tweeble between deploys, so this data has to be
// pulled fresh on every page load rather than baked into the static build.
import { TWEEBLE } from './site';

export interface TweebleEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  endAt: string | null;
  venueName: string | null;
  venueAddress: string | null;
  coverImageUrl: string | null;
  ticketPriceCents: number;
  gaIncludes: string[];
  vipEnabled: boolean;
  vipPriceCents: number | null;
  vipIncludes: string[];
  url: string;
}

export interface TweebleService {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  purchaseKind: string;
  subscriptionCadence: string | null;
  coverPhotoUrl: string | null;
  url: string;
}

export interface TweebleBlogPost {
  id: string;
  title: string;
  subtitle: string | null;
  body: string;
  authorName: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
  url: string;
}

// Products and Fundraising Goals have no live entries on Tweeble yet, so
// their exact field names haven't been confirmed against real data the way
// events/services/blog were. These types are a best guess by analogy to
// the confirmed `services` shape (for products) and typical crowdfunding
// fields (for fundraising) — `pick()` below reads several plausible key
// names per field so the pages still render correctly if Tweeble's actual
// field names differ slightly once real entries appear. `[key: string]:
// unknown` keeps TypeScript from rejecting whatever extra fields show up.
export interface TweebleProduct {
  id: string;
  [key: string]: unknown;
}

export interface TweebleFundraisingGoal {
  id: string;
  [key: string]: unknown;
}

export interface TweebleMembershipPackage {
  id: string;
  [key: string]: unknown;
}

export interface TweebleReview {
  id: string;
  [key: string]: unknown;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tweeble API request failed (${res.status})`);
  return res.json();
}

export const fetchTweebleEvents = () => getJson<TweebleEvent[]>(TWEEBLE.api.events);
export const fetchTweebleServices = () => getJson<TweebleService[]>(TWEEBLE.api.services);
export const fetchTweebleBlog = () => getJson<TweebleBlogPost[]>(TWEEBLE.api.blog);
export const fetchTweebleProducts = () => getJson<TweebleProduct[]>(TWEEBLE.api.products);
export const fetchTweebleFundraising = () => getJson<TweebleFundraisingGoal[]>(TWEEBLE.api.fundraising);
export const fetchTweebleMembership = () => getJson<TweebleMembershipPackage[]>(TWEEBLE.api.membership);
export const fetchTweebleReviews = () => getJson<TweebleReview[]>(TWEEBLE.api.reviews);

/** Returns the first defined, non-null value found under any of `keys` on `obj`. */
export function pick<T = unknown>(obj: Record<string, unknown>, keys: string[]): T | undefined {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key] as T;
  }
  return undefined;
}

export function formatCents(cents: number): string {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

// A multi-day event (e.g. a 3-day mela) is only "past" once it's actually
// over — its end date, not its start date. A single-day event has no
// separate end, so its own date is both start and end.
export function isEventPast(event: TweebleEvent, now: number = Date.now()): boolean {
  const end = event.endAt ?? event.eventDate;
  return new Date(end).getTime() < now;
}

// Every card below is built from third-party text, so anything going into
// innerHTML gets escaped here rather than trusted as markup.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}
