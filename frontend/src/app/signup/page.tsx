import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { SignupForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";

export const metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; role?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next, "");
  if (await getCurrentUser()) redirect(next || "/dashboard");
  return (
    <AuthShell title="Join Psytrexa" subtitle="Free for participants and organizers.">
      <SignupForm next={next || undefined} defaultRole={sp.role === "organizer" ? "ORGANIZER" : "PARTICIPANT"} />
    </AuthShell>
  );
}
