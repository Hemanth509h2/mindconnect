import Link from "next/link";
import { getCurrentUser, isOrganizer } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Logo } from "./Logo";

export async function Nav() {
  const user = await getCurrentUser();
  const links = [
    { href: "/events", label: "Explore events" },
    { href: isOrganizer(user) ? "/organizer/events/new" : "/host", label: "Host an event" },
  ];
  const accountLinks = user
    ? [
        { href: "/dashboard", label: "My registrations" },
        ...(isOrganizer(user) ? [{ href: "/organizer", label: "Organizer dashboard" }] : []),
        { href: "/profile", label: "Profile" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="btn-ghost">
              {l.label}
            </Link>
          ))}
          {user ? (
            <details className="relative">
              <summary className="btn-secondary list-none">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-lavender-mist text-xs font-bold text-lavender-deep">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
              </summary>
              <div className="card absolute right-0 mt-2 w-56 p-2">
                {accountLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-beige">
                    {l.label}
                  </Link>
                ))}
                <form action={logout}>
                  <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose hover:bg-rose-mist">Log out</button>
                </form>
              </div>
            </details>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu */}
        <details className="relative md:hidden">
          <summary className="btn-secondary list-none px-3" aria-label="Menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="card absolute right-0 mt-2 w-60 p-2">
            {[...links, ...accountLinks].map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-beige">
                {l.label}
              </Link>
            ))}
            {user ? (
              <form action={logout}>
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose hover:bg-rose-mist">Log out</button>
              </form>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-2 border-t border-line p-2">
                <Link href="/login" className="btn-secondary btn-sm">
                  Log in
                </Link>
                <Link href="/signup" className="btn-primary btn-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
