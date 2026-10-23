import Link from "next/link";
import { api } from "@/lib/api";
import type { EventPage } from "@/lib/types";
import { EVENT_MODES, EVENT_TYPES, TOPICS } from "@/lib/constants";
import { EventCard } from "@/components/EventCard";

export const metadata = { title: "Explore events" };

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = {
    q: one(sp.q),
    type: one(sp.type),
    mode: one(sp.mode),
    topic: one(sp.topic),
    price: one(sp.price),
    when: one(sp.when) || "upcoming",
  };
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const query = new URLSearchParams(Object.entries({ ...filters, page: String(page) }).filter(([, v]) => v));
  const { events, total, pages } = await api<EventPage>(`/api/events?${query}`);

  const hrefWith = (changes: Record<string, string>) => {
    const params = new URLSearchParams(
      Object.entries({ ...filters, ...changes }).filter(([k, v]) => v && !(k === "when" && v === "upcoming")),
    );
    const qs = params.toString();
    return qs ? `/events?${qs}` : "/events";
  };
  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== "when").length;

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-semibold">Explore events</h1>
      <p className="mt-2 text-muted">Workshops, webinars, conferences and conclaves on mental health and wellbeing.</p>

      {/* Type tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {[{ value: "", label: "All" }, ...EVENT_TYPES.map((t) => ({ value: t.value, label: `${t.label}s` }))].map((t) => (
          <Link
            key={t.value}
            href={hrefWith({ type: t.value, page: "" })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              filters.type === t.value ? "bg-teal text-white" : "border border-line bg-white hover:border-teal"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside>
          <details className="card p-5 lg:block" open>
            <summary className="flex items-center justify-between font-semibold">
              Filters {activeFilters > 0 && <span className="chip bg-teal-mist text-teal-dark">{activeFilters}</span>}
            </summary>
            <form action="/events" className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="q">Search</label>
                <input id="q" name="q" defaultValue={filters.q} className="input" placeholder="Title, topic or city" />
              </div>
              {filters.type && <input type="hidden" name="type" value={filters.type} />}
              <div>
                <label className="label" htmlFor="topic">Topic</label>
                <select id="topic" name="topic" defaultValue={filters.topic} className="input">
                  <option value="">Any topic</option>
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="mode">Mode</label>
                <select id="mode" name="mode" defaultValue={filters.mode} className="input">
                  <option value="">Any</option>
                  {EVENT_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="price">Fee</label>
                <select id="price" name="price" defaultValue={filters.price} className="input">
                  <option value="">Any</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="when">When</label>
                <select id="when" name="when" defaultValue={filters.when} className="input">
                  <option value="upcoming">Upcoming & ongoing</option>
                  <option value="past">Past events</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1">Apply</button>
                <Link href="/events" className="btn-secondary">Reset</Link>
              </div>
            </form>
          </details>
        </aside>

        {/* Results */}
        <section>
          <p className="mb-4 text-sm text-muted">
            {total} {total === 1 ? "event" : "events"} found
          </p>
          {events.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="font-semibold">No events match these filters.</p>
              <Link href="/events" className="mt-2 inline-block text-sm text-teal">Clear filters</Link>
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link href={hrefWith({ page: String(page - 1) })} className="btn-secondary btn-sm">← Previous</Link>
              )}
              <span className="px-3 text-sm text-muted">Page {page} of {pages}</span>
              {page < pages && (
                <Link href={hrefWith({ page: String(page + 1) })} className="btn-secondary btn-sm">Next →</Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
