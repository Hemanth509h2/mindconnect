import Link from "next/link";
import { api } from "@/lib/api";
import { isOrganizer, requireUser } from "@/lib/auth";
import { EVENT_MODES, labelOf } from "@/lib/constants";
import { formatEventWhen } from "@/lib/format";
import type { MyRegistration } from "@/lib/types";
import { cancelRegistration } from "@/app/actions/registrations";
import { ConfirmButton } from "@/components/ConfirmButton";
import { BecomeOrganizerForm } from "@/components/ProfileForms";

export const metadata = { title: "My registrations" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const registrations = await api<MyRegistration[]>("/api/me/registrations");

  const now = new Date();
  const active = registrations.filter((r) => r.status === "REGISTERED" && r.event.status !== "CANCELLED");
  const upcoming = active.filter((r) => new Date(r.event.endsAt) >= now).reverse();
  const past = active.filter((r) => new Date(r.event.endsAt) < now);
  const cancelled = registrations.filter((r) => !active.includes(r));

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Hi, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-muted">Your event registrations, all in one place.</p>

      <Section title="Upcoming" empty={<>Nothing booked yet. <Link href="/events" className="font-semibold text-teal">Find an event →</Link></>}>
        {upcoming.map((r) => (
          <RegistrationRow key={r.id} registration={r}>
            {r.event.meetingLink && (
              <a href={r.event.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">
                Join link
              </a>
            )}
            <form action={cancelRegistration.bind(null, r.id, r.event.slug)}>
              <ConfirmButton message={`Cancel your registration for "${r.event.title}"?`}>Cancel</ConfirmButton>
            </form>
          </RegistrationRow>
        ))}
      </Section>

      {past.length > 0 && (
        <Section title="Attended">
          {past.map((r) => (
            <RegistrationRow key={r.id} registration={r} />
          ))}
        </Section>
      )}

      {cancelled.length > 0 && (
        <Section title="Cancelled">
          {cancelled.map((r) => (
            <RegistrationRow key={r.id} registration={r}>
              <span className="chip bg-rose-mist text-rose">
                {r.event.status === "CANCELLED" ? "Event cancelled" : "You cancelled"}
              </span>
            </RegistrationRow>
          ))}
        </Section>
      )}

      {!isOrganizer(user) && (
        <section id="host" className="card mt-12 bg-lavender-mist/50 p-6">
          <h2 className="text-2xl font-semibold">Want to host your own events?</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Therapists, colleges, NGOs and wellness teams can list workshops, webinars and conferences for free.
          </p>
          <BecomeOrganizerForm />
        </section>
      )}
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty?: React.ReactNode; children: React.ReactNode }) {
  const hasItems = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">{hasItems ? children : <div className="card p-6 text-sm text-muted">{empty}</div>}</div>
    </section>
  );
}

function RegistrationRow({ registration: r, children }: { registration: MyRegistration; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link href={`/events/${r.event.slug}`} className="font-semibold hover:text-teal">
          {r.event.title}
        </Link>
        <p className="mt-1 text-sm text-muted">
          {formatEventWhen(r.event.startsAt, r.event.endsAt)} · {r.event.mode === "ONLINE" ? labelOf(EVENT_MODES, r.event.mode) : r.event.city}
        </p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
