"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">We couldn&apos;t load this page. Please try again in a moment.</p>
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
