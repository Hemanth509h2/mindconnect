import Link from "next/link";
import { api } from "@/lib/api";
import { requireOrganizer } from "@/lib/auth";
import { EVENT_TYPES, labelOf } from "@/lib/constants";
import { formatEventWhen } from "@/lib/format";
import type { EventSummary } from "@/lib/types";
import { deleteEvent, setEventStatus } from "@/app/actions/events";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "Organizer dashboard" };

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gold-mist text-ink",
  PUBLISHED: "bg-teal-mist text-teal-dark",
  CANCELLED: "bg-rose-mist text-rose",
  ENDED: "bg-beige text-muted",
};

export default async function OrganizerDashboard() {
  const user = await requireOrganizer();
  const events = await api<EventSummary[]>("/api/organizer/events");

  const now = new Date();
  const isEnded = (e: EventSummary) => new Date(e.endsAt) < now;
  const stats = [
    { label: "Events", value: events.length },
    { label: "Live now", value: events.filter((e) => e.status === "PUBLISHED" && !isEnded(e)).length },
    { label: "Drafts", value: events.filter((e) => e.status === "DRAFT").length },
    { label: "Total registrations", value: events.reduce((sum, e) => sum + e.registeredCount, 0) },
  ];

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{user.orgName ?? user.name}</p>
          <h1 className="text-3xl font-semibold">Organizer dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/organizers/${user.id}`} className="btn-secondary">Public profile</Link>
          <Link href="/organizer/events/new" className="btn-primary">+ New event</Link>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Your events</h2>
        {events.length === 0 ? (
          <div className="card mt-4 p-10 text-center">
            <p className="font-semibold">You haven&apos;t created any events yet.</p>
            <Link href="/organizer/events/new" className="btn-primary mt-4">Create your first event</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {events.map((e) => {
              const status = e.status === "PUBLISHED" && isEnded(e) ? "ENDED" : e.status;
              return (
                <div key={e.id} className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`chip ${statusStyles[status]}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                      <span className="text-xs text-muted">{labelOf(EVENT_TYPES, e.type)}</span>
                    </div>
                    <Link href={`/events/${e.slug}`} className="mt-2 block font-semibold hover:text-teal">{e.title}</Link>
                    <p className="mt-1 text-sm text-muted">{formatEventWhen(e.startsAt, e.endsAt)}</p>
                  </div>
                  <Link href={`/organizer/events/${e.id}/registrations`} className="shrink-0 text-sm lg:w-36 lg:text-center">
                    <span className="font-display text-2xl font-semibold">{e.registeredCount}</span>
                    <span className="text-muted">{e.capacity !== null ? ` / ${e.capacity}` : ""} registered</span>
                  </Link>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link href={`/organizer/events/${e.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                    <Link href={`/organizer/events/${e.id}/registrations`} className="btn-secondary btn-sm">Attendees</Link>
                    {e.status === "DRAFT" && (
                      <form action={setEventStatus.bind(null, e.id, "PUBLISHED")}>
                        <SubmitButton className="btn-primary btn-sm">Publish</SubmitButton>
                      </form>
                    )}
                    {e.status === "PUBLISHED" && !isEnded(e) && (
                      <form action={setEventStatus.bind(null, e.id, "CANCELLED")}>
                        <ConfirmButton message={`Cancel "${e.title}"? Registered participants will see it as cancelled.`}>Cancel event</ConfirmButton>
                      </form>
                    )}
                    {e.status === "CANCELLED" && !isEnded(e) && (
                      <form action={setEventStatus.bind(null, e.id, "PUBLISHED")}>
                        <SubmitButton className="btn-secondary btn-sm">Restore</SubmitButton>
                      </form>
                    )}
                    {e.status === "DRAFT" && e.registeredCount === 0 && (
                      <form action={deleteEvent.bind(null, e.id)}>
                        <ConfirmButton message={`Delete the draft "${e.title}"? This can't be undone.`}>Delete</ConfirmButton>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
