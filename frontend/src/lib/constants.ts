// Keep the values in sync with backend/src/lib/constants.ts.

export const EVENT_TYPES = [
  { value: "WORKSHOP", label: "Workshop", blurb: "Hands-on, small-group sessions led by therapists and practitioners." },
  { value: "WEBINAR", label: "Webinar", blurb: "Live online talks you can join from anywhere." },
  { value: "CONFERENCE", label: "Conference", blurb: "Multi-speaker days of research, practice and ideas." },
  { value: "CONCLAVE", label: "Conclave", blurb: "Focused gatherings and panel conversations with experts." },
] as const;

export const EVENT_MODES = [
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "In person" },
  { value: "HYBRID", label: "Hybrid" },
] as const;

export const TOPICS = [
  { value: "anxiety", label: "Anxiety" },
  { value: "stress", label: "Stress" },
  { value: "depression", label: "Depression" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "relationships", label: "Relationships" },
  { value: "workplace", label: "Workplace wellbeing" },
  { value: "students", label: "Student mental health" },
  { value: "trauma", label: "Trauma & healing" },
  { value: "grief", label: "Grief & loss" },
  { value: "parenting", label: "Parenting" },
  { value: "self-care", label: "Self-care" },
  { value: "practitioners", label: "For practitioners" },
] as const;

export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export function labelOf(list: readonly { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label ?? value;
}
