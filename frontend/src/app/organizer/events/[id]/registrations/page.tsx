import Link from "next/link";
import { notFound } from "next/navigation";
import { apiOrNull } from "@/lib/api";
import { requireOrganizer } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { Attendee } from "@/lib/types";

export const metadata = { title: "Registrations" };

type Data = { event: { id: string; slug: string; title: string; capacity: number | null }; registrations: Attendee[] };

export default async function RegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOrganizer();
  const { id } = await params;
  const data = await apiOrNull<Data>(`/api/organizer/events/${encodeURIComponent(id)}/registrations`);
  if (!data) notFound();
  const { event, registrations } = data;
  const active = registrations.filter((r) => r.status === "REGISTERED");

  return (
    <div className="container-page py-12">
      <Link href="/organizer" className="text-sm text-muted hover:text-teal">← Organizer dashboard</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Registrations</h1>
          <Link href={`/events/${event.slug}`} className="mt-1 block text-muted hover:text-teal">{event.title}</Link>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm">
            <span className="font-display text-2xl font-semibold">{active.length}</span>
            <span className="text-muted">{event.capacity !== null ? ` / ${event.capacity}` : ""} registered</span>
          </p>
          {registrations.length > 0 && (
            <a href={`/organizer/events/${event.id}/registrations/export`} className="btn-secondary">Download CSV</a>
          )}
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-muted">No one has registered yet. Share your event page to get the word out.</div>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-beige/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Organisation</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {registrations.map((r) => (
                <tr key={r.id} className={r.status === "CANCELLED" ? "text-muted" : ""}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${r.email}`} className="block hover:text-teal">{r.email}</a>
                    <a href={`tel:${r.phone}`} className="text-muted hover:text-teal">{r.phone}</a>
                  </td>
                  <td className="px-4 py-3">{r.organization ?? "—"}</td>
                  <td className="max-w-xs px-4 py-3">{r.note ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`chip ${r.status === "REGISTERED" ? "bg-teal-mist text-teal-dark" : "bg-rose-mist text-rose"}`}>
                      {r.status === "REGISTERED" ? "Registered" : "Cancelled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
