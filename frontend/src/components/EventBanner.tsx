// Soft brand colours per event type for events without a banner image.
const placeholders: Record<string, { bg: string; a: string; b: string }> = {
  WORKSHOP: { bg: "from-teal-mist via-sage-mist to-gold-mist", a: "#00897b", b: "#d4b483" },
  WEBINAR: { bg: "from-lavender-mist via-teal-mist to-ivory", a: "#7a68ad", b: "#00897b" },
  CONFERENCE: { bg: "from-gold-mist via-lavender-mist to-teal-mist", a: "#d4b483", b: "#7a68ad" },
  CONCLAVE: { bg: "from-sage-mist via-lavender-mist to-rose-mist", a: "#b4475a", b: "#7a68ad" },
};

/** The event's banner image, or a decorative gradient when there isn't one. */
export function EventBanner({
  event,
  className = "",
}: {
  event: { type: string; bannerUrl: string | null };
  className?: string;
}) {
  if (event.bannerUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={event.bannerUrl} alt="" className={`object-cover ${className}`} />;
  }
  const p = placeholders[event.type] ?? placeholders.WORKSHOP;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${p.bg} ${className}`} aria-hidden>
      <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <circle cx="300" cy="120" r="90" fill={p.a} opacity="0.12" />
        <circle cx="360" cy="40" r="60" fill={p.b} opacity="0.18" />
        <circle cx="60" cy="10" r="50" fill={p.b} opacity="0.12" />
        <path d="M0 120 C 80 90, 160 150, 240 115 S 360 90, 400 105" fill="none" stroke={p.a} strokeOpacity="0.25" strokeWidth="2" />
        <path d="M0 135 C 90 110, 170 165, 250 130 S 360 110, 400 122" fill="none" stroke={p.b} strokeOpacity="0.3" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
