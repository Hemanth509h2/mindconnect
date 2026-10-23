import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-beige/60">
      <div className="container-page">
        <div className="my-8 flex flex-col gap-2 rounded-2xl bg-lavender-mist px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>Need to talk to someone right now?</strong> {site.helpline.note}
          </p>
          <p className="shrink-0 font-semibold text-lavender-deep">
            {site.helpline.name}:{" "}
            {site.helpline.numbers.map((n, i) => (
              <span key={n}>
                {i > 0 && " / "}
                <a href={`tel:${n.replace(/-/g, "")}`} className="underline underline-offset-2">
                  {n}
                </a>
              </span>
            ))}
          </p>
        </div>

        <div className="grid gap-8 pb-10 sm:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted">{site.tagline}</p>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-semibold">Explore</p>
            <ul className="space-y-2 text-muted">
              <li><Link href="/events?type=WORKSHOP" className="hover:text-teal">Workshops</Link></li>
              <li><Link href="/events?type=WEBINAR" className="hover:text-teal">Webinars</Link></li>
              <li><Link href="/events?type=CONFERENCE" className="hover:text-teal">Conferences</Link></li>
              <li><Link href="/events?type=CONCLAVE" className="hover:text-teal">Conclaves</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-semibold">Organizers</p>
            <ul className="space-y-2 text-muted">
              <li><Link href="/host" className="hover:text-teal">Host an event</Link></li>
              <li><Link href="/organizer" className="hover:text-teal">Organizer dashboard</Link></li>
              <li><a href={site.social.instagram} className="hover:text-teal">Instagram</a></li>
              <li><a href={site.social.linkedin} className="hover:text-teal">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <p className="border-t border-line py-5 text-xs text-muted">
          © {new Date().getFullYear()} {site.name}. Events listed here are run by independent organizers and are not a
          substitute for professional care.
        </p>
      </div>
    </footer>
  );
}
