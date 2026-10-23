import Link from "next/link";
import { requireOrganizer } from "@/lib/auth";
import { createEvent } from "@/app/actions/events";
import { EventForm } from "@/components/EventForm";

export const metadata = { title: "New event" };

export default async function NewEventPage() {
  await requireOrganizer();
  return (
    <div className="container-page max-w-3xl py-12">
      <Link href="/organizer" className="text-sm text-muted hover:text-teal">← Organizer dashboard</Link>
      <h1 className="mt-3 text-3xl font-semibold">Create an event</h1>
      <p className="mt-1 mb-8 text-muted">Save it as a draft to finish later, or publish it to open registrations.</p>
      <EventForm action={createEvent} />
    </div>
  );
}
