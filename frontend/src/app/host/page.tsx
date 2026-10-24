import Link from "next/link";
import { getCurrentUser, isOrganizer } from "@/lib/auth";

export const metadata = { title: "Host an event" };

const steps = [
  { title: "Create your organizer account", text: "Sign up as an organizer with your organisation or practice name." },
  { title: "Describe your event", text: "Add the date, venue or meeting link, speakers, agenda and seat limit." },
  { title: "Publish and share", text: "Your event goes live on Psytrexa with its own page to share anywhere." },
  { title: "Manage registrations", text: "See who's coming in real time and download the attendee list as a spreadsheet." },
];

const features = [
  { title: "Free listing", text: "No fees to publish. Charge your own entry fee, or keep it free." },
  { title: "Seat limits & deadlines", text: "Registration closes on its own when seats fill up or the deadline passes." },
  { title: "Private meeting links", text: "Online links are shown only to people who have registered." },
  { title: "Attendee list as CSV", text: "Download names, emails and phone numbers whenever you need them." },
  { title: "Your own organizer page", text: "One link that shows everything you're running, past and upcoming." },
];

export default async function HostPage() {
  const user = await getCurrentUser();
  const cta = isOrganizer(user)
    ? { href: "/organizer/events/new", label: "Create an event" }
    : user
      ? { href: "/dashboard#host", label: "Become an organizer" }
      : { href: "/signup?role=organizer", label: "Sign up as an organizer" };

  return (
    <div className="container-page py-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
        <div>
          <p className="chip bg-lavender-mist text-lavender-deep">For therapists, colleges, NGOs and wellness teams</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-5xl">
            Bring your mental health event to the people who need it.
          </h1>
          <p className="mt-5 text-lg text-muted">
            Workshops, webinars, conferences and conclaves — list them on Psytrexa for free and handle registrations
            in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={cta.href} className="btn-primary">{cta.label}</Link>
            <Link href="/events" className="btn-secondary">Browse live events</Link>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 -rotate-2 rounded-[2rem] bg-gradient-to-br from-lavender-mist via-teal-mist to-gold-mist" />
          <div className="card relative p-6 shadow-lift">
            <h2 className="text-xl font-semibold">What you get</h2>
            <ul className="mt-5 space-y-4">
              {features.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-mist text-teal-dark" aria-hidden>
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 10.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <span className="block font-semibold">{f.title}</span>
                    <span className="block text-sm text-muted">{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="card p-6">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-mist font-display font-semibold text-teal-dark">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="card mt-12 p-6 text-sm text-muted">
        <p>
          <strong className="text-ink">Listing guidelines:</strong> events should be led or supervised by qualified
          professionals where they involve clinical content, must not promise cures, and should share how participants
          can get urgent help if a session brings up difficult feelings.
        </p>
      </div>
    </div>
  );
}
