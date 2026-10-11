/**
 * Simulated booking data for the demo. Nothing here touches a real calendar,
 * mailbox or meeting: the slots are made up from today's date.
 */

export const SIM = {
  leadName: "Alex",
  leadEmail: "alex@yourcompany.co.uk",
  callLength: "20-minute call",
  where: "Zoom",
  timezone: "UK time",
  /** Bookable times each weekday, 24h "HH:MM". */
  times: ["09:30", "11:00", "13:30", "15:00", "16:30"],
} as const;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type Day = { key: string; date: Date; weekend: boolean };

/** Two Monday-first weeks starting the week after today. */
export function bookingDays(today = new Date()): Day[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const toMonday = (8 - start.getDay()) % 7 || 7;
  start.setDate(start.getDate() + toMonday);
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, date: d, weekend: d.getDay() === 0 || d.getDay() === 6 };
  });
}

/** Deterministic "taken" slots so the calendar looks lived-in. */
export function isTaken(dayKey: string, time: string): boolean {
  let h = 0;
  for (const ch of dayKey + time) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 3 === 0;
}

export function freeTimes(dayKey: string): string[] {
  return SIM.times.filter((t) => !isTaken(dayKey, t));
}

/** 2:30 pm — 12-hour, lower-case, no leading zero (design system). */
export function time12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** Wed 14 Oct 2026 */
export function shortDate(d: Date): string {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Wednesday 14 Oct 2026 */
export function longDate(d: Date): string {
  return `${DAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayName(d: Date): string {
  return DAYS[d.getDay()];
}

export type Booking = { day: Day; time: string };

export function bookingLabel(b: Booking): string {
  return `${shortDate(b.day.date)}, ${time12(b.time)}`;
}
