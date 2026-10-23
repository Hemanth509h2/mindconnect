import Link from "next/link";
import { notFound } from "next/navigation";
import { apiOrNull } from "@/lib/api";
import { requireOrganizer } from "@/lib/auth";
import type { EditableEvent } from "@/lib/types";
import { updateEvent } from "@/app/actions/events";
import { EventForm } from "@/components/EventForm";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOrganizer();
  const { id } = await params;
  const event = await apiOrNull<EditableEvent>(`/api/organizer/events/${encodeURIComponent(id)}`);
  if (!event) notFound();

  return (
    <div className="container-page max-w-3xl py-12">
      <Link href="/organizer" className="text-sm text-muted hover:text-teal">← Organizer dashboard</Link>
      <h1 className="mt-3 text-3xl font-semibold">Edit event</h1>
      <p className="mt-1 mb-8 text-muted">
        {event.registrationCount > 0
          ? `${event.registrationCount} people have registered — let them know if you change the date or venue.`
          : "Changes go live as soon as you save."}
      </p>
      <EventForm action={updateEvent.bind(null, event.id)} event={event} />
    </div>
  );
}
