import Link from "next/link";
import { getCurrentUser, isOrganizer } from "@/lib/auth";

export const metadata = { title: "Host an event" };

const steps = [
  { title: "Create your organizer account", text: "Sign up as an organizer with your organisation or practice name." },
  { title: "Describe your event", text: "Add the date, venue or meeting link, speakers, agenda and seat limit." },
  { title: "Publish and share", text: "Your event goes live on MindConnect with its own page to share anywhere." },
  { title: "Manage registrations", text: "See who's coming in real time and download the attendee list as a spreadsheet." },
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
      <div className="max-w-3xl">
        <p className="chip bg-lavender-mist text-lavender-deep">For therapists, colleges, NGOs and wellness teams</p>
        <h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-5xl">
          Bring your mental health event to the people who need it.
        </h1>
        <p className="mt-5 text-lg text-muted">
          Workshops, webinars, conferences and conclaves — list them on MindConnect for free and handle registrations in
          one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={cta.href} className="btn-primary">{cta.label}</Link>
          <Link href="/events" className="btn-secondary">Browse live events</Link>
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
