import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { LoginForm } from "@/components/AuthForms";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next, "");
  if (await getCurrentUser()) redirect(next || "/dashboard");
  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-1 mb-6 text-muted">Log in to register for events and manage your bookings.</p>
        <LoginForm next={next || undefined} />
      </div>
    </div>
  );
}
