import { site } from "./site";

const tz = site.timeZone;

type DateLike = Date | string;
const toDate = (d: DateLike) => (typeof d === "string" ? new Date(d) : d);

const dateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, day: "numeric", month: "short", year: "numeric" });
const dayFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });
const inputFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: tz,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatDate(d: DateLike) {
  return dateFmt.format(toDate(d));
}

export function formatTime(d: DateLike) {
  return timeFmt.format(toDate(d));
}

export function formatDateTime(value: DateLike) {
  const d = toDate(value);
  return `${dayFmt.format(d)}, ${timeFmt.format(d)}`;
}

/** "Wed, 28 Oct 2026 · 9:30 am – 1:00 pm", or "28 Oct 2026 – 30 Oct 2026" for multi-day events. */
export function formatEventWhen(startsAt: DateLike, endsAt: DateLike) {
  const start = toDate(startsAt);
  const end = toDate(endsAt);
  if (dateFmt.format(start) === dateFmt.format(end)) {
    return `${dayFmt.format(start)} · ${timeFmt.format(start)} – ${timeFmt.format(end)}`;
  }
  return `${dateFmt.format(start)} – ${dateFmt.format(end)}`;
}

/** Date → value for <input type="datetime-local">, in the site time zone. */
export function toDateTimeLocal(d: DateLike) {
  const p = Object.fromEntries(inputFmt.formatToParts(toDate(d)).map((part) => [part.type, part.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** <input type="datetime-local"> value (site time zone) → Date. */
export function fromDateTimeLocal(value: string) {
  return new Date(`${value}:00${site.tzOffset}`);
}

export function formatPrice(price: number) {
  return price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;
}

/** "Closes today", "Closes in 3 days", or null once past. */
export function closesIn(deadline: DateLike, now = new Date()) {
  const ms = toDate(deadline).getTime() - now.getTime();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}
