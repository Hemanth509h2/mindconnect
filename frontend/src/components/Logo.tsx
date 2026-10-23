import Link from "next/link";
import { site } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <circle cx="12" cy="16" r="9" fill="#00897b" opacity="0.9" />
        <circle cx="20" cy="16" r="9" fill="#b8a9d9" opacity="0.85" />
      </svg>
      {site.name}
    </Link>
  );
}
