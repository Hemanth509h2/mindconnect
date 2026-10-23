// Keep these lists in sync with frontend/src/lib/constants.ts.

export const EVENT_TYPES = ["WORKSHOP", "WEBINAR", "CONFERENCE", "CONCLAVE"] as const;
export const EVENT_MODES = ["ONLINE", "OFFLINE", "HYBRID"] as const;
export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;
export const TOPICS = [
  "anxiety",
  "stress",
  "depression",
  "mindfulness",
  "relationships",
  "workplace",
  "students",
  "trauma",
  "grief",
  "parenting",
  "self-care",
  "practitioners",
] as const;
