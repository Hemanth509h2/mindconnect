"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, attempt } from "@/lib/api";
import type { EventStatus } from "@/lib/constants";
import { fromDateTimeLocal } from "@/lib/format";
import { str, type FormState } from "@/lib/form";

type Saved = { id: string; slug: string; status: string };

/** Turn the event form into the JSON the backend expects. The backend does the validating. */
function eventBody(formData: FormData) {
  const num = (name: string) => (str(formData, name) === "" ? null : Number(str(formData, name)));
  const date = (name: string) => {
    const value = str(formData, name);
    const d = value ? fromDateTimeLocal(value) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toISOString() : "";
  };
  const list = (name: string) => {
    try {
      return JSON.parse(str(formData, name) || "[]");
    } catch {
      return [];
    }
  };
  const intent = formData.get("intent");
  return {
    title: str(formData, "title"),
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    type: str(formData, "type"),
    mode: str(formData, "mode"),
    topics: formData.getAll("topics").map(String),
    startsAt: date("startsAt"),
    endsAt: date("endsAt"),
    registrationDeadline: date("registrationDeadline"),
    venue: str(formData, "venue"),
    city: str(formData, "city"),
    meetingLink: str(formData, "meetingLink"),
    capacity: num("capacity"),
    price: num("price") ?? 0,
    bannerUrl: str(formData, "bannerUrl"),
    speakers: list("speakers"),
    agenda: list("agenda"),
    gallery: list("gallery"),
    status: intent === "publish" ? "PUBLISHED" : intent === "draft" ? "DRAFT" : undefined,
  };
}

export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await attempt(() => api<Saved>("/api/organizer/events", { method: "POST", body: eventBody(formData) }));
  if ("error" in result) return { error: result.error };
  redirect(result.data.status === "PUBLISHED" ? `/events/${result.data.slug}` : "/organizer");
}

export async function updateEvent(eventId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const result = await attempt(() =>
    api<Saved>(`/api/organizer/events/${eventId}`, { method: "PUT", body: eventBody(formData) }),
  );
  if ("error" in result) return { error: result.error };
  redirect("/organizer");
}

export async function setEventStatus(eventId: string, status: EventStatus) {
  await api(`/api/organizer/events/${eventId}/status`, { method: "PATCH", body: { status } });
  revalidatePath("/organizer");
}

export async function deleteEvent(eventId: string) {
  await api(`/api/organizer/events/${eventId}`, { method: "DELETE" });
  revalidatePath("/organizer");
}
