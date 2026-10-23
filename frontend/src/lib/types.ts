// Shapes of the backend's JSON responses. Dates arrive as ISO strings.

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "PARTICIPANT" | "ORGANIZER" | "ADMIN";
  orgName: string | null;
  bio: string | null;
  website: string | null;
};

export type OrganizerRef = { id: string; name: string; orgName: string | null };

export type EventSummary = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  type: string;
  mode: string;
  city: string | null;
  price: number;
  capacity: number | null;
  bannerUrl: string | null;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  status: string;
  organizer: OrganizerRef;
  registeredCount: number;
};

export type Speaker = { name: string; role?: string; bio?: string; photoUrl?: string };
export type AgendaItem = { time?: string; title: string };

type EventContent = {
  description: string;
  venue: string | null;
  meetingLink: string | null;
  topics: string[];
  speakers: Speaker[];
  agenda: AgendaItem[];
};

export type EventDetail = Omit<EventSummary, "organizer"> &
  EventContent & {
    organizer: OrganizerRef & { bio: string | null; website: string | null };
    isOwner: boolean;
    myRegistration: { id: string; status: string; createdAt: string } | null;
  };

/** An organizer's own event, as loaded into the edit form. */
export type EditableEvent = Omit<EventSummary, "organizer" | "registeredCount"> &
  EventContent & { registrationCount: number };

export type EventPage = { events: EventSummary[]; total: number; page: number; pages: number };

export type MyRegistration = {
  id: string;
  status: string;
  createdAt: string;
  event: EventSummary & { meetingLink: string | null };
};

export type Attendee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  note: string | null;
  status: string;
  createdAt: string;
};

export type OrganizerProfile = OrganizerRef & {
  bio: string | null;
  website: string | null;
  events: EventSummary[];
};
