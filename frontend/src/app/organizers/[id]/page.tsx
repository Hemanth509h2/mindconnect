import { notFound } from "next/navigation";
import { cache } from "react";
import { apiOrNull } from "@/lib/api";
import type { OrganizerProfile } from "@/lib/types";
import { EventCard } from "@/components/EventCard";

const getOrganizer = cache((id: string) => apiOrNull<OrganizerProfile>(`/api/organizers/${encodeURIComponent(id)}`));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const organizer = await getOrganizer((await params).id);
  return { title: organizer ? (organizer.orgName ?? organizer.name) : "Organizer" };
}

export default async function OrganizerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const organizer = await getOrganizer((await params).id);
  if (!organizer) notFound();

  const now = new Date();
  const upcoming = organizer.events.filter((e) => new Date(e.endsAt) >= now).reverse();
  const past = organizer.events.filter((e) => new Date(e.endsAt) < now);

  return (
    <div className="container-page py-12">
      <div className="card relative overflow-hidden p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-lavender/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-teal-mist font-display text-2xl font-semibold text-teal-dark">
              {(organizer.orgName ?? organizer.name).charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm text-muted">Organizer</p>
              <h1 className="mt-1 text-4xl font-semibold">{organizer.orgName ?? organizer.name}</h1>
              {organizer.orgName && <p className="mt-1 text-muted">{organizer.name}</p>}
              {organizer.bio && <p className="mt-4 max-w-2xl whitespace-pre-line">{organizer.bio}</p>}
              {organizer.website && (
                <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-teal">
                  Visit website ↗
                </a>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 lg:w-80">
            {[
              { value: upcoming.length, label: "Upcoming" },
              { value: past.length, label: "Past events" },
              { value: organizer.events.reduce((sum, e) => sum + e.registeredCount, 0), label: "Registrations" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col-reverse rounded-xl bg-ivory p-4 text-center">
                <dt className="mt-1 text-xs text-muted">{s.label}</dt>
                <dd className="font-display text-3xl font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {[
        { title: "Upcoming events", list: upcoming },
        { title: "Past events", list: past },
      ].map(
        (group) =>
          group.list.length > 0 && (
            <section key={group.title} className="mt-12">
              <h2 className="text-2xl font-semibold">{group.title}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.list.map((e) => (
                  <EventCard key={e.slug} event={e} />
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}
