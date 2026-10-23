"use client";

import { becomeOrganizer, updateProfile } from "@/app/actions/profile";
import type { User } from "@/lib/types";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

export function ProfileForm({ user, organizer }: { user: User; organizer: boolean }) {
  const { state, pending, onSubmit } = useActionForm(updateProfile);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required defaultValue={user.name} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input value={user.email} disabled className="input bg-beige text-muted" />
      </div>
      {organizer && (
        <>
          <div>
            <label className="label" htmlFor="orgName">Organisation or practice name</label>
            <input id="orgName" name="orgName" defaultValue={user.orgName ?? ""} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="bio">About your organisation</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={user.bio ?? ""} className="input" />
            <p className="hint">Shown on your event pages and public organizer profile.</p>
          </div>
          <div>
            <label className="label" htmlFor="website">Website</label>
            <input id="website" name="website" type="url" defaultValue={user.website ?? ""} className="input" placeholder="https://" />
          </div>
        </>
      )}
      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingText="Saving…">Save profile</SubmitButton>
    </form>
  );
}

export function BecomeOrganizerForm() {
  const { state, pending, onSubmit } = useActionForm(becomeOrganizer);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input name="orgName" required className="input" placeholder="Your organisation or practice name" aria-label="Organisation name" />
        <div className="mt-2">
          <FormMessage state={state} />
        </div>
      </div>
      <SubmitButton pending={pending} pendingText="Setting up…">Start hosting</SubmitButton>
    </form>
  );
}
