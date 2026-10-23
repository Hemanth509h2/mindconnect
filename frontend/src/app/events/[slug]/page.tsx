import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { apiOrNull } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { EVENT_MODES, EVENT_TYPES, TOPICS, labelOf } from "@/lib/constants";
import type { EventDetail } from "@/lib/types";
import { closesIn, formatDateTime, formatEventWhen, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { cancelRegistration } from "@/app/actions/registrations";
import { EventBanner } from "@/components/EventBanner";
import { RegisterForm } from "@/components/RegisterForm";
import { ConfirmButton } from "@/components/ConfirmButton";

const getEvent = cache((slug: string) => apiOrNull<EventDetail>(`/api/events/${encodeURIComponent(slug)}`));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  if (!event || event.status === "DRAFT") return {};
  return { title: event.title, description: event.tagline ?? event.description.slice(0, 160) };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, user] = await Promise.all([getEvent(slug), getCurrentUser()]);
  if (!event) notFound();
  const { isOwner, myRegistration: registration, speakers, agenda, topics } = event;
  const isRegistered = registration?.status === "REGISTERED";

  const now = new Date();
  const endsAt = new Date(event.endsAt);
  const registered = event.registeredCount;
  const seatsLeft = event.capacity !== null ? Math.max(event.capacity - registered, 0) : null;
  const organizerName = event.organizer.orgName ?? event.organizer.name;

  // What the registration panel should show, in priority order.
  const panel =
    event.status === "CANCELLED"
      ? "cancelled"
      : isRegistered
        ? "registered"
        : endsAt < now
          ? "ended"
          : event.status === "DRAFT"
            ? "draft"
            : new Date(event.registrationDeadline) <= now
              ? "closed"
              : seatsLeft === 0
                ? "full"
                : user
                  ? "form"
                  : "login";

  return (
    <div className="pb-10">
      {isOwner && (
        <div className="border-b border-line bg-gold-mist">
          <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <span>
              {event.status === "DRAFT" ? "This is a draft — only you can see it." : "You're the organizer of this event."}
            </span>
            <div className="flex gap-2">
              <Link href={`/organizer/events/${event.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
              <Link href={`/organizer/events/${event.id}/registrations`} className="btn-secondary btn-sm">
                Registrations ({registered})
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container-page pt-8">
        <EventBanner event={event} className={`w-full rounded-3xl ${event.bannerUrl ? "h-56 sm:h-72" : "h-24 sm:h-32"}`} />
      </div>

      <div className="container-page mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className="chip bg-teal-mist text-teal-dark">{labelOf(EVENT_TYPES, event.type)}</span>
            <span className="chip bg-lavender-mist text-lavender-deep">{labelOf(EVENT_MODES, event.mode)}</span>
            {event.status === "CANCELLED" && <span className="chip bg-rose-mist text-rose">Cancelled</span>}
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">{event.title}</h1>
          {event.tagline && <p className="mt-3 text-lg text-muted">{event.tagline}</p>}
          <p className="mt-4 text-sm">
            Organized by{" "}
            <Link href={`/organizers/${event.organizer.id}`} className="font-semibold text-teal hover:underline">
              {organizerName}
            </Link>
          </p>

          <dl className="card mt-8 grid gap-5 p-5 sm:grid-cols-2">
            <Fact label="When" value={formatEventWhen(event.startsAt, event.endsAt)} />
            <Fact
              label="Where"
              value={
                event.mode === "ONLINE"
                  ? "Online — link shared after registration"
                  : `${event.venue}, ${event.city}${event.mode === "HYBRID" ? " · also online" : ""}`
              }
            />
            <Fact label="Registration closes" value={formatDateTime(event.registrationDeadline)} />
            <Fact label="Fee" value={formatPrice(event.price)} />
          </dl>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold">About this event</h2>
            <div className="mt-4 leading-relaxed whitespace-pre-line text-ink/90">{event.description}</div>
            {topics.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {topics.map((t) => (
                  <Link key={t} href={`/events?topic=${t}`} className="chip border border-line bg-white hover:border-teal">
                    {labelOf(TOPICS, t)}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {speakers.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Speakers</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {speakers.map((s, i) => (
                  <div key={i} className="card flex gap-4 p-4">
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-lavender-mist font-display text-xl font-semibold text-lavender-deep">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold">{s.name}</p>
                      {s.role && <p className="text-sm text-teal-dark">{s.role}</p>}
                      {s.bio && <p className="mt-1 text-sm text-muted">{s.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {agenda.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Agenda</h2>
              <ol className="mt-5 space-y-0 border-l-2 border-lavender/50 pl-6">
                {agenda.map((a, i) => (
                  <li key={i} className="relative pb-5">
                    <span className="absolute top-1.5 -left-[31px] h-3 w-3 rounded-full border-2 border-white bg-teal" />
                    {a.time && <p className="text-xs font-semibold tracking-wide text-teal-dark uppercase">{a.time}</p>}
                    <p className="font-medium">{a.title}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">About the organizer</h2>
            <div className="card mt-5 p-5">
              <p className="font-semibold">{organizerName}</p>
              {event.organizer.bio && <p className="mt-2 text-sm whitespace-pre-line text-muted">{event.organizer.bio}</p>}
              <div className="mt-3 flex gap-4 text-sm">
                <Link href={`/organizers/${event.organizer.id}`} className="font-semibold text-teal">More events →</Link>
                {event.organizer.website && (
                  <a href={event.organizer.website} className="text-muted hover:text-teal" rel="noopener noreferrer" target="_blank">
                    Website ↗
                  </a>
                )}
              </div>
            </div>
          </section>
        </article>

        {/* Registration panel */}
        <aside id="register" className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-3xl font-semibold">{formatPrice(event.price)}</p>
              {panel === "form" || panel === "login" ? (
                <p className="text-sm font-medium text-rose">{closesIn(event.registrationDeadline)}</p>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              {registered} registered
              {seatsLeft !== null && ` · ${seatsLeft} of ${event.capacity} seats left`}
            </p>
            <div className="mt-5">
              {panel === "registered" && registration && (
                <div className="space-y-4">
                  <p className="alert-success">
                    <strong>You&apos;re registered!</strong> We&apos;ve saved your spot.
                  </p>
                  {event.meetingLink && event.status !== "CANCELLED" && (
                    <div className="rounded-xl bg-lavender-mist p-4 text-sm">
                      <p className="font-semibold">Join online</p>
                      <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="break-all text-lavender-deep underline">
                        {event.meetingLink}
                      </a>
                    </div>
                  )}
                  {endsAt > now && (
                    <form action={cancelRegistration.bind(null, registration.id, event.slug)}>
                      <ConfirmButton message="Cancel your registration for this event?" className="btn-danger w-full">
                        Cancel registration
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              )}
              {panel === "form" && user && (
                <RegisterForm
                  slug={event.slug}
                  price={event.price}
                  defaults={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
                />
              )}
              {panel === "login" && (
                <div className="space-y-2">
                  <Link href={`/login?next=/events/${event.slug}`} className="btn-primary w-full">Log in to register</Link>
                  <Link href={`/signup?next=/events/${event.slug}`} className="btn-secondary w-full">Create a free account</Link>
                </div>
              )}
              {panel === "cancelled" && <p className="alert-error">This event has been cancelled by the organizer.</p>}
              {panel === "ended" && <p className="rounded-xl bg-beige px-4 py-3 text-sm">This event has ended.</p>}
              {panel === "closed" && <p className="rounded-xl bg-beige px-4 py-3 text-sm">Registration has closed.</p>}
              {panel === "full" && <p className="rounded-xl bg-beige px-4 py-3 text-sm">This event is full.</p>}
              {panel === "draft" && (
                <p className="rounded-xl bg-gold-mist px-4 py-3 text-sm">Publish this event to open registrations.</p>
              )}
            </div>
          </div>
          <p className="mt-4 px-2 text-xs text-muted">
            In distress right now? Call {site.helpline.name} at{" "}
            <a href={`tel:${site.helpline.numbers[0]}`} className="font-semibold text-lavender-deep">{site.helpline.numbers[0]}</a>{" "}
            — free and available 24×7.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
