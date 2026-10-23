import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-6xl font-semibold text-lavender">404</p>
      <h1 className="mt-4 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted">The event may have been removed, or the link is mistyped.</p>
      <Link href="/events" className="btn-primary mt-8">Explore events</Link>
    </div>
  );
}
