import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { LoginForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next, "");
  if (await getCurrentUser()) redirect(next || "/dashboard");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to register for events and manage your bookings.">
      <LoginForm next={next || undefined} />
    </AuthShell>
  );
}
