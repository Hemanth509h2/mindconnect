import type { Event, Prisma } from "@prisma/client";
import { z } from "zod";
import { EVENT_MODES, EVENT_STATUSES, EVENT_TYPES, TOPICS } from "./constants";

/** What event cards need: no description, speakers or meeting link. */
export const eventSummarySelect = {
  id: true,
  slug: true,
  title: true,
  tagline: true,
  type: true,
  mode: true,
  city: true,
  price: true,
  capacity: true,
  bannerUrl: true,
  startsAt: true,
  endsAt: true,
  registrationDeadline: true,
  status: true,
  organizer: { select: { id: true, name: true, orgName: true } },
  _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
} satisfies Prisma.EventSelect;

type EventSummaryRow = Prisma.EventGetPayload<{ select: typeof eventSummarySelect }>;

export function toSummary({ _count, ...event }: EventSummaryRow) {
  return { ...event, registeredCount: _count.registrations };
}

/** A full event as the client sees it. The meeting link is only included when `withMeetingLink`. */
export function toDetail(event: Event, withMeetingLink: boolean) {
  const { speakers, agenda, topics, meetingLink, ...rest } = event;
  return {
    ...rest,
    topics: topics.split(",").filter(Boolean),
    speakers: parseList(speakers),
    agenda: parseList(agenda),
    meetingLink: withMeetingLink ? meetingLink : null,
  };
}

function parseList(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// http(s) only: these end up in href/src attributes.
const url = z.url({ protocol: /^https?$/, message: "Links must be full URLs starting with https://" });
const optionalUrl = z.union([z.literal(""), url]).nullish();

const speakerSchema = z.object({
  name: z.string().trim().min(1, "Every speaker needs a name").max(100),
  role: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(500).optional(),
  photoUrl: optionalUrl,
});

const agendaSchema = z.object({
  time: z.string().trim().max(40).optional(),
  title: z.string().trim().min(1, "Every agenda item needs a title").max(200),
});

const date = (what: string) => z.coerce.date({ message: `Set a valid ${what}` });

export const eventInputSchema = z.object({
  title: z.string().trim().min(5, "Title should be at least 5 characters").max(120),
  tagline: z.string().trim().max(160).nullish(),
  description: z.string().trim().min(30, "Describe the event in at least 30 characters").max(10_000),
  type: z.enum(EVENT_TYPES, { message: "Pick an event type" }),
  mode: z.enum(EVENT_MODES, { message: "Pick a mode" }),
  topics: z.array(z.enum(TOPICS)).min(1, "Pick at least one topic"),
  startsAt: date("start time"),
  endsAt: date("end time"),
  registrationDeadline: date("registration deadline"),
  venue: z.string().trim().max(200).nullish(),
  city: z.string().trim().max(80).nullish(),
  meetingLink: optionalUrl,
  capacity: z.number().int().min(1, "Seats must be at least 1, or leave it empty for unlimited").nullish(),
  price: z.number().int().min(0, "Fee can't be negative").max(1_000_000).default(0),
  bannerUrl: optionalUrl,
  speakers: z.array(speakerSchema).max(50).default([]),
  agenda: z.array(agendaSchema).max(100).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

/** Validate an organizer's event and turn it into columns. */
export function parseEventInput(body: unknown) {
  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const v = parsed.data;

  if (v.endsAt <= v.startsAt) return { error: "The event must end after it starts" } as const;
  if (v.registrationDeadline > v.endsAt) return { error: "Registration must close before the event ends" } as const;
  if (v.mode !== "ONLINE" && (!v.venue || !v.city)) {
    return { error: "In-person and hybrid events need a venue and city" } as const;
  }

  return {
    status: v.status,
    data: {
      title: v.title,
      tagline: v.tagline || null,
      description: v.description,
      type: v.type,
      mode: v.mode,
      topics: v.topics.join(","),
      startsAt: v.startsAt,
      endsAt: v.endsAt,
      registrationDeadline: v.registrationDeadline,
      venue: v.mode === "ONLINE" ? null : v.venue!,
      city: v.mode === "ONLINE" ? null : v.city!,
      meetingLink: v.mode === "OFFLINE" ? null : v.meetingLink || null,
      capacity: v.capacity ?? null,
      price: v.price,
      bannerUrl: v.bannerUrl || null,
      speakers: JSON.stringify(v.speakers.map(compact)),
      agenda: JSON.stringify(v.agenda.map(compact)),
    },
  } as const;
}

/** Drop empty optional fields so the stored JSON stays tidy. */
function compact<T extends object>(item: T): T {
  return Object.fromEntries(Object.entries(item).filter(([, v]) => v !== "" && v !== undefined && v !== null)) as T;
}

export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "event"}-${Math.random().toString(36).slice(2, 7)}`;
}

export const statusSchema = z.object({ status: z.enum(EVENT_STATUSES, { message: "Unknown status" }) });

export const phoneSchema = z.string().trim().regex(/^\+?[\d\s-]{10,15}$/, "Enter a valid phone number");
