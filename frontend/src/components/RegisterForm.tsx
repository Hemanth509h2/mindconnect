"use client";

import { registerForEvent } from "@/app/actions/registrations";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

type Props = {
  slug: string;
  price: number;
  defaults: { name: string; email: string; phone: string };
};

export function RegisterForm({ slug, price, defaults }: Props) {
  const { state, pending, onSubmit } = useActionForm(registerForEvent.bind(null, slug));

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" name="name" required defaultValue={defaults.name} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required defaultValue={defaults.email} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" required defaultValue={defaults.phone} className="input" placeholder="98765 43210" />
      </div>
      <div>
        <label className="label" htmlFor="organization">College / organisation <span className="text-muted">(optional)</span></label>
        <input id="organization" name="organization" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="note">Anything the organizer should know? <span className="text-muted">(optional)</span></label>
        <textarea id="note" name="note" rows={2} className="input" placeholder="Accessibility needs, questions…" />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-teal" />
        I agree to share these details with the organizer of this event.
      </label>
      {price > 0 && (
        <p className="rounded-xl bg-gold-mist px-3 py-2 text-xs">
          The fee of ₹{price.toLocaleString("en-IN")} is collected by the organizer — they&apos;ll share payment details with you.
        </p>
      )}
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full" pending={pending} pendingText="Registering…">
        Register now
      </SubmitButton>
    </form>
  );
}
