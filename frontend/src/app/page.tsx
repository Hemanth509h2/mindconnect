import Link from "next/link";
import { api } from "@/lib/api";
import type { EventPage, EventSummary } from "@/lib/types";
import { EVENT_TYPES, TOPICS, labelOf } from "@/lib/constants";
import { dateTile, formatPrice } from "@/lib/format";
import { EventCard } from "@/components/EventCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ events: upcoming }, stats] = await Promise.all([
    api<EventPage>("/api/events?pageSize=6"),
    api<{ events: number; organizers: number; registrations: number }>("/api/stats"),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-lavender/30 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-teal/15 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 pt-16 pb-16 sm:pt-20 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
          <div>
            <p className="chip bg-teal-mist text-teal-dark">Workshops · Webinars · Conferences · Conclaves</p>
            <h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-6xl lg:text-[3.4rem]">
              Find the mental health events that <span className="text-teal">move you forward</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">
              Learn from therapists, researchers and people with lived experience. Register in a click — or list your own
              event and reach people who care.
            </p>
            <form action="/events" className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
              <input name="q" className="input flex-1 py-3" placeholder="Search anxiety, mindfulness, workplace wellbeing…" />
              <button className="btn-primary py-3">Search events</button>
            </form>
            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6">
              {[
                { value: stats.events, label: "Events listed" },
                { value: stats.organizers, label: "Organizers" },
                { value: stats.registrations, label: "Registrations" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-sm text-muted">{s.label}</dt>
                  <dd className="font-display text-3xl font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ComingUp events={upcoming.slice(0, 4)} />
        </div>
      </section>

      {/* Event types */}
      <section className="container-page">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENT_TYPES.map((t) => (
            <Link key={t.value} href={`/events?type=${t.value}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
              <h3 className="text-xl font-semibold">{t.label}s</h3>
              <p className="mt-2 text-sm text-muted">{t.blurb}</p>
              <p className="mt-4 text-sm font-semibold text-teal">Browse →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section className="container-page mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Upcoming events</h2>
            <p className="mt-1 text-muted">Registrations open now.</p>
          </div>
          <Link href="/events" className="btn-secondary shrink-0">
            View all
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        ) : (
          <div className="card mt-8 p-10 text-center text-muted">
            No upcoming events yet.{" "}
            <Link href="/host" className="font-semibold text-teal">
              Be the first to host one →
            </Link>
          </div>
        )}
      </section>

      {/* Topics */}
      <section className="container-page mt-20">
        <h2 className="text-3xl font-semibold">Explore by topic</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Link
              key={t.value}
              href={`/events?topic=${t.value}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-teal hover:text-teal"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Host CTA */}
      <section className="container-page mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-12 text-white sm:px-12">
          <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-teal/40 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">Running a workshop, webinar or conference?</h2>
            <p className="mt-4 text-white/75">
              List it on Psytrexa for free. Publish in minutes, collect registrations, and download your attendee list
              whenever you need it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/host" className="btn bg-white text-navy hover:bg-teal-mist">
                Host an event
              </Link>
              <Link href="/events" className="btn border border-white/30 text-white hover:bg-white/10">
                See what others are running
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** The hero's right-hand panel: the next few events, or a note when there are none. */
function ComingUp({ events }: { events: EventSummary[] }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-4 rotate-2 rounded-[2rem] bg-gradient-to-br from-teal-mist via-lavender-mist to-gold-mist" />
      <div className="card relative p-6 shadow-lift">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Coming up next</h2>
          <span className="chip bg-teal-mist text-teal-dark">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-teal" />
            Registrations open
          </span>
        </div>

        {events.length > 0 ? (
          <ul className="mt-5 divide-y divide-line">
            {events.map((e) => {
              const { day, month } = dateTile(e.startsAt);
              return (
                <li key={e.slug}>
                  <Link href={`/events/${e.slug}`} className="group flex items-center gap-4 py-3.5">
                    <span className="grid h-14 w-14 shrink-0 place-content-center rounded-xl bg-lavender-mist text-center text-lavender-deep">
                      <span className="font-display text-xl leading-none font-semibold">{day}</span>
                      <span className="mt-1 text-[11px] font-semibold tracking-wide uppercase">{month}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold group-hover:text-teal">{e.title}</span>
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {labelOf(EVENT_TYPES, e.type)} · {e.mode === "ONLINE" ? "Online" : e.city} · {formatPrice(e.price)}
                      </span>
                    </span>
                    <span className="text-muted transition group-hover:translate-x-0.5 group-hover:text-teal" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl bg-beige p-5 text-sm text-muted">
            Nothing scheduled yet — new events appear here as soon as organizers publish them.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-ivory px-4 py-3 text-sm">
          <span className="text-muted">Hosting something?</span>
          <Link href="/host" className="font-semibold text-teal hover:text-teal-dark">
            List it for free →
          </Link>
        </div>
      </div>
    </div>
  );
}
