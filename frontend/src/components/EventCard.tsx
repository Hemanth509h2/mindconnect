import Link from "next/link";
import { EVENT_MODES, EVENT_TYPES, labelOf } from "@/lib/constants";
import { closesIn, formatEventWhen, formatPrice } from "@/lib/format";
import type { EventSummary } from "@/lib/types";
import { EventBanner } from "./EventBanner";

export function EventCard({ event }: { event: EventSummary }) {
  const registered = event.registeredCount;
  const seatsLeft = event.capacity !== null ? Math.max(event.capacity - registered, 0) : null;
  const closing = closesIn(event.registrationDeadline);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <EventBanner event={event} className="h-36 w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          <span className="chip bg-teal-mist text-teal-dark">{labelOf(EVENT_TYPES, event.type)}</span>
          <span className="chip bg-lavender-mist text-lavender-deep">{labelOf(EVENT_MODES, event.mode)}</span>
          <span className="chip bg-gold-mist text-ink">{formatPrice(event.price)}</span>
        </div>
        <h3 className="line-clamp-2 text-lg leading-snug font-semibold group-hover:text-teal">{event.title}</h3>
        <p className="text-sm text-muted">by {event.organizer.orgName ?? event.organizer.name}</p>
        <div className="mt-auto space-y-1 text-sm">
          <p>{formatEventWhen(event.startsAt, event.endsAt)}</p>
          <p className="text-muted">{event.mode === "ONLINE" ? "Online" : event.city}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted">
          <span className="whitespace-nowrap">
            {registered} registered
            {seatsLeft !== null && ` · ${seatsLeft === 0 ? "Full" : `${seatsLeft} seats left`}`}
          </span>
          <span className={`whitespace-nowrap ${closing ? "font-medium text-rose" : ""}`}>{closing ?? "Registration closed"}</span>
        </div>
      </div>
    </Link>
  );
}
