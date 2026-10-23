import { site } from "@/lib/site";

const points = [
  "Workshops, webinars, conferences and conclaves in one place",
  "Register in a click — your details are saved for next time",
  "Host your own events for free and download your attendee list",
];

/** Login and signup: the form card beside a brand panel (panel hidden on small screens). */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-soft lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-navy p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-teal/40 blur-3xl" />
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-lavender/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl leading-snug font-semibold">Learn, connect and heal — together.</h2>
            <ul className="mt-8 space-y-4">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-white/80">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal/30 text-white" aria-hidden>
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 10.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative mt-10 rounded-2xl bg-white/10 p-4 text-sm text-white/75">
            Need to talk to someone right now? Call {site.helpline.name} at{" "}
            <strong className="text-white">{site.helpline.numbers[0]}</strong> — free and available 24×7.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-1 mb-6 text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
