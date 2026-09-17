import type { CollectionEntry } from 'astro:content';
import festivals2026 from '../data/festivals-2026.json';
import { matchFestival } from '../data/festival-glossary';

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  items: Array<{
    label: string;
    href?: string; // linked to a matching /events/<slug>/ page when we can identify one
    highlight?: boolean; // this day matches a fully-modeled event entry (dated or recurring)
  }>;
}

// Words too generic to establish a match on their own — "Maha Shivratri"
// and a random "Maha Lakshmi Vratamam" entry share only "maha" and are
// otherwise unrelated, so common Sanskrit/English filler is ignored and
// matching runs on each title's distinctive words only.
const STOPWORDS = new Set([
  'maha', 'shri', 'sri', 'pooja', 'puja', 'the', 'of', 'and', 'day', 'festival',
  'celebration', 'vratam', 'vrat', 'begins', 'ends', 'start', 'starts',
]);

/**
 * Matches a panchang festival name (from the temple's real 2026 observance
 * calendar) against the titles of our `events` content collection, so a
 * calendar day like "Pradosham" links straight to /events/pradosham-pooja/
 * instead of being a dead label. Requires every distinctive word of the
 * (shorter) event title to appear in the panchang name — full containment,
 * not loose overlap — so a single shared generic word like "Maha" can't
 * link two unrelated observances.
 */
function findMatchingEvent(
  festivalName: string,
  events: CollectionEntry<'events'>[],
): CollectionEntry<'events'> | undefined {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w && !STOPWORDS.has(w));
  const nameWords = new Set(normalize(festivalName));
  if (nameWords.size === 0) return undefined;

  for (const event of events) {
    const titleWords = normalize(event.data.title);
    if (titleWords.length === 0) continue;
    const allPresent = titleWords.every((w) => nameWords.has(w));
    if (allPresent) return event;
  }
  return undefined;
}

/**
 * Builds a day -> events lookup for the whole year by merging:
 *  - the temple's real 2026 panchang (every tithi/observance, from
 *    src/data/festivals-2026.json)
 *  - our modeled `events` collection, so a day that matches a page
 *    someone can actually read/register on links there
 *  - dated (non-recurring) events that fall outside the panchang list
 *    (e.g. a one-off Tweeble-sourced event)
 */
export function buildCalendar(events: CollectionEntry<'events'>[]): Map<string, CalendarDay> {
  const days = new Map<string, CalendarDay>();

  const getDay = (date: string): CalendarDay => {
    let day = days.get(date);
    if (!day) {
      day = { date, items: [] };
      days.set(date, day);
    }
    return day;
  };

  for (const entry of festivals2026 as { date: string; festivals: string[] }[]) {
    const day = getDay(entry.date);
    for (const name of entry.festivals) {
      const match = findMatchingEvent(name, events);
      day.items.push({
        label: name,
        href: match ? `/events/${match.id}/` : `/religious-dates-and-festivals/${matchFestival(name).slug}/`,
        highlight: Boolean(match),
      });
    }
  }

  // Dated events not already represented via a panchang name match (e.g.
  // future events added from a Tweeble link with their own exact date).
  for (const event of events) {
    if (!event.data.start) continue;
    const date = event.data.start.toISOString().slice(0, 10);
    const day = getDay(date);
    const alreadyListed = day.items.some((i) => i.href === `/events/${event.id}/`);
    if (!alreadyListed) {
      day.items.push({ label: event.data.title, href: `/events/${event.id}/`, highlight: true });
    }
  }

  return days;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function buildMonthGrid(year: number, month: number, calendar: Map<string, CalendarDay>) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = firstOfMonth.getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: Array<{ date: string; dayNumber: number; inMonth: boolean; day?: CalendarDay }> = [];

  // Leading days from previous month for a full first week.
  const daysInPrevMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    cells.push({ date: '', dayNumber, inMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date, dayNumber: d, inMonth: true, day: calendar.get(date) });
  }

  // Trailing days to complete the final week.
  let trailing = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: '', dayNumber: trailing++, inMonth: false });
  }

  return cells;
}
