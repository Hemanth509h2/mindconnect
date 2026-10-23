import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { SignupForm } from "@/components/AuthForms";

export const metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; role?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next, "");
  if (await getCurrentUser()) redirect(next || "/dashboard");
  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Join MindConnect</h1>
        <p className="mt-1 mb-6 text-muted">Free for participants and organizers.</p>
        <SignupForm next={next || undefined} defaultRole={sp.role === "organizer" ? "ORGANIZER" : "PARTICIPANT"} />
      </div>
    </div>
  );
}
