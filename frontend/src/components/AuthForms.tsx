"use client";

import Link from "next/link";
import { useState } from "react";
import { login, signup } from "@/app/actions/auth";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, onSubmit } = useActionForm(login);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="btn-primary w-full" pendingText="Logging in…">
        Log in
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-teal">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next, defaultRole }: { next?: string; defaultRole: "PARTICIPANT" | "ORGANIZER" }) {
  const { state, pending, onSubmit } = useActionForm(signup);
  const [role, setRole] = useState(defaultRole);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <fieldset>
        <legend className="label">I want to</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "PARTICIPANT", title: "Attend events", text: "Find and register" },
            { value: "ORGANIZER", title: "Host events", text: "List and manage" },
          ].map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-3 text-sm transition ${
                role === option.value ? "border-teal bg-teal-mist" : "border-line bg-white hover:border-teal"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value as typeof role)}
                className="sr-only"
              />
              <span className="block font-semibold">{option.title}</span>
              <span className="text-muted">{option.text}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" name="name" autoComplete="name" required className="input" />
      </div>
      {role === "ORGANIZER" && (
        <div>
          <label className="label" htmlFor="orgName">Organisation or practice name</label>
          <input id="orgName" name="orgName" required className="input" placeholder="e.g. Mindful Circle Collective" />
          <p className="hint">Shown on your events. You can change it later.</p>
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" />
        <p className="hint">At least 8 characters.</p>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="btn-primary w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-teal">
          Log in
        </Link>
      </p>
    </form>
  );
}
