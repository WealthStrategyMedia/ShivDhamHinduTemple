// Date text for events and programs. Dates are always shown in the temple's own
// time zone (Orlando), so a visitor elsewhere never sees an event land on the
// wrong day. No imports, so this file can be tested on its own.
const TEMPLE_TZ = 'America/New_York';

/** A single day, e.g. "Mon, September 14, 2026". */
export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: TEMPLE_TZ,
  });
}

function zoned(iso: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TEMPLE_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return { year: get('year'), month: get('month'), day: get('day'), hour: Number(get('hour')) };
}

const HOUR_MS = 3_600_000;

/**
 * What to print as an event's date: one day ("Mon, September 14, 2026"), or,
 * for an event that spans several days, the range ("September 14–20, 2026",
 * "September 28 – October 2, 2026", "December 30, 2026 – January 2, 2027").
 *
 * An evening event that simply runs past midnight (ends before 5 AM, within
 * 14 hours of starting) is still one day.
 */
export function formatEventWhen(event: { eventDate: string; endAt: string | null }): string {
  if (!event.endAt) return formatEventDate(event.eventDate);

  const start = zoned(event.eventDate);
  const end = zoned(event.endAt);
  const sameDay = start.year === end.year && start.month === end.month && start.day === end.day;
  const pastMidnightOnly = end.hour < 5 && new Date(event.endAt).getTime() - new Date(event.eventDate).getTime() < 14 * HOUR_MS;
  if (sameDay || pastMidnightOnly) return formatEventDate(event.eventDate);

  if (start.year !== end.year) return `${start.month} ${start.day}, ${start.year} – ${end.month} ${end.day}, ${end.year}`;
  if (start.month !== end.month) return `${start.month} ${start.day} – ${end.month} ${end.day}, ${end.year}`;
  return `${start.month} ${start.day}–${end.day}, ${end.year}`;
}
