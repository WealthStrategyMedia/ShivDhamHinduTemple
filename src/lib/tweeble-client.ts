// Client-side access to Tweeble's public API. This runs in the browser, never
// at build time: the API's cover-image URLs are pre-signed and expire within the
// hour, and the temple changes events, services, prices and posts on Tweeble
// between deploys, so this data is always read live. (The site's speed comes from
// starting requests early and painting from a just-confirmed copy: see below.)
import { TWEEBLE } from './site';

export interface TweebleEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  endAt: string | null;
  isPast: boolean;
  isOngoing: boolean;
  locationMode: string | null;
  city: string | null;
  state: string | null;
  locationLabel: string | null;
  coverImageUrl: string | null;
  ticketPriceCents: number;
  gaIncludes: string[];
  vipEnabled: boolean;
  vipPriceCents: number | null;
  vipIncludes: string[];
  sponsorPackages: unknown[];
  url: string;
  /** Tweeble-hosted checkout for this item; shown in an on-site dialog. */
  purchaseUrl: string;
  embedUrl: string;
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
  purchaseUrl: string;
  embedUrl: string;
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

export interface TweebleProgram {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  coverPhotoUrl: string | null;
  priceCents: number;
  isFree: boolean;
  recurrence: string | null;
  startsAt: string | null;
  scheduleLabel: string | null;
  locationLabel: string | null;
  nextOccurrence: string | null;
  minimumAge: number | null;
  url: string;
  purchaseUrl: string;
  embedUrl: string;
}

export interface TweebleFormField {
  id: string;
  preset: string;
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
}

export interface TweebleFormSchema {
  id: string;
  name: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  fields: TweebleFormField[];
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
  title: string;
  shortDescription: string | null;
  description: string;
  targetCents: number;
  raisedCents: number;
  donorCount: number;
  coverPhotoUrl: string | null;
  photoUrls: string[];
  videoUrls: string[];
  url: string;
  purchaseUrl: string;
  embedUrl: string;
}

export interface TweebleMembershipPackage {
  id: string;
  title: string;
  priceCents: number;
  billingInterval: string;
  incentives: string[];
  url: string;
  purchaseUrl: string;
  embedUrl: string;
}

export interface TweebleReview {
  id: string;
  reviewerName: string;
  rating: number;
  message: string;
  createdAt: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Speed. Feeds are requested as early as possible and never twice at once:
//  - BaseLayout starts each page's feed requests in <head> (window.__tw), so the
//    network works while the page is still parsing; getJson picks those up.
//  - Concurrent requests for the same URL share one promise.
//  - loadFeed() paints from a short-lived copy of the last response first, then
//    always confirms against the live feed — so cached data is never more than
//    a moment old on screen, and changes appear as soon as the live answer lands.
// Tweeble's cover-image URLs are signed and expire after about an hour, so the
// cached copy is only trusted for 30 minutes.
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    __tw?: Record<string, Promise<unknown>>;
  }
}

const inflight = new Map<string, { at: number; promise: Promise<unknown> }>();

async function requestJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`Tweeble API request failed (${res.status})`);
  return res.json();
}

function getJson<T>(url: string): Promise<T> {
  const now = Date.now();
  const existing = inflight.get(url);
  if (existing && now - existing.at < 3000) return existing.promise as Promise<T>;

  // Use the request the page already started in <head>, once.
  const early = window.__tw?.[url];
  if (early) delete window.__tw![url];

  const promise = (early ?? requestJson(url)).catch((err) => {
    inflight.delete(url);
    // The early request can fail (offline, blocked); try once more normally.
    if (early) return requestJson(url);
    throw err;
  }) as Promise<T>;
  inflight.set(url, { at: now, promise });
  return promise;
}

const CACHE_PREFIX = 'tw:';
const CACHE_MAX_AGE_MS = 30 * 60 * 1000;

function readCache<T>(url: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + url);
    if (!raw) return null;
    const { t, d } = JSON.parse(raw);
    return Date.now() - t > CACHE_MAX_AGE_MS ? null : (d as T);
  } catch {
    return null;
  }
}

function writeCache(url: string, data: unknown) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + url, JSON.stringify({ t: Date.now(), d: data }));
  } catch {
    // Storage full or unavailable: the site simply skips the instant-paint step.
  }
}

// Signed image URLs change on every request; ignore that when comparing so an
// unchanged feed never causes a redraw (and never re-downloads its images).
const fingerprint = (data: unknown) => JSON.stringify(data).replace(/\?X-Amz-[^"]*/g, '');

/**
 * Paints `render` from the last copy of this feed if we have one (instant),
 * then from the live feed if it differs (always). `render` must fully redraw
 * its section each time it is called. Rejects only if there was nothing to show.
 */
export async function loadFeed<T>(url: string, render: (data: T) => void): Promise<void> {
  const cached = readCache<T>(url);
  if (cached) {
    render(cached);
    performance.mark('tweeble:painted-from-cache');
    try {
      const live = await getJson<T>(url);
      writeCache(url, live);
      performance.mark('tweeble:live-confirmed');
      if (fingerprint(live) !== fingerprint(cached)) render(live);
    } catch {
      // Live check failed: what's already on screen was current moments ago.
    }
    return;
  }
  const live = await getJson<T>(url);
  writeCache(url, live);
  render(live);
  performance.mark('tweeble:painted-from-network');
}

export const fetchTweebleEvents = () => getJson<TweebleEvent[]>(TWEEBLE.api.events);
export const fetchTweebleServices = () => getJson<TweebleService[]>(TWEEBLE.api.services);
export const fetchTweebleBlog = () => getJson<TweebleBlogPost[]>(TWEEBLE.api.blog);
export const fetchTweebleProducts = () => getJson<TweebleProduct[]>(TWEEBLE.api.products);
export const fetchTweebleFundraising = () => getJson<TweebleFundraisingGoal[]>(TWEEBLE.api.fundraising);
export const fetchTweebleMembership = () => getJson<TweebleMembershipPackage[]>(TWEEBLE.api.membership);
export const fetchTweebleReviews = () => getJson<TweebleReview[]>(TWEEBLE.api.reviews);
export const fetchTweeblePrograms = () => getJson<TweebleProgram[]>(TWEEBLE.api.programs);
export const fetchTweebleFormSchema = (formUrl: string) => getJson<TweebleFormSchema>(formUrl);

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

/** Whole-dollar amount for goals, e.g. $10,000. */
export function formatGoalAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

// A multi-day event (e.g. a 3-day mela) is only "past" once it's actually
// over — its end date, not its start date. Tweeble reports this itself
// (`isPast`), computed from the event's end; the date math below is only a
// fallback should that flag ever be missing.
export function isEventPast(event: TweebleEvent, now: number = Date.now()): boolean {
  if (event.isPast === true) return true;
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
