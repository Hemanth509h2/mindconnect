"use client";

import { useState } from "react";
import { EVENT_MODES, EVENT_TYPES, TOPICS } from "@/lib/constants";
import { toDateTimeLocal } from "@/lib/format";
import type { FormState } from "@/lib/form";
import type { AgendaItem, EditableEvent, Speaker } from "@/lib/types";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  event?: EditableEvent;
};

const blankSpeaker: Speaker = { name: "", role: "", bio: "", photoUrl: "" };
const blankAgenda: AgendaItem = { time: "", title: "" };

/** Drop rows the organizer added but left empty. */
function filled<T extends object>(rows: T[]) {
  return rows.filter((row) => Object.values(row).some((v) => typeof v === "string" && v.trim()));
}

export function EventForm({ action, event }: Props) {
  const { state, pending, onSubmit } = useActionForm(action);
  const [mode, setMode] = useState(event?.mode ?? "ONLINE");
  const [speakers, setSpeakers] = useState<Speaker[]>(event?.speakers ?? []);
  const [agenda, setAgenda] = useState<AgendaItem[]>(event?.agenda ?? []);

  const updateSpeaker = (i: number, field: keyof Speaker, value: string) =>
    setSpeakers((list) => list.map((s, j) => (j === i ? { ...s, [field]: value } : s)));
  const updateAgenda = (i: number, field: keyof AgendaItem, value: string) =>
    setAgenda((list) => list.map((a, j) => (j === i ? { ...a, [field]: value } : a)));

  const isDraft = !event || event.status === "DRAFT";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input type="hidden" name="speakers" value={JSON.stringify(filled(speakers))} />
      <input type="hidden" name="agenda" value={JSON.stringify(filled(agenda))} />

      <Card title="The basics">
        <div>
          <label className="label" htmlFor="title">Event title</label>
          <input id="title" name="title" required defaultValue={event?.title} className="input" placeholder="e.g. Managing Exam Anxiety: A Practical Workshop" />
        </div>
        <div>
          <label className="label" htmlFor="tagline">Tagline <span className="text-muted">(optional)</span></label>
          <input id="tagline" name="tagline" maxLength={160} defaultValue={event?.tagline ?? ""} className="input" placeholder="One line on what people will get out of it" />
        </div>
        <div>
          <label className="label" htmlFor="type">Event type</label>
          <select id="type" name="type" required defaultValue={event?.type ?? ""} className="input">
            <option value="" disabled>Choose a type</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="label">Topics</legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <label key={t.value} className="cursor-pointer">
                <input type="checkbox" name="topics" value={t.value} defaultChecked={event?.topics.includes(t.value)} className="peer sr-only" />
                <span className="inline-block rounded-full border border-line bg-white px-3 py-1.5 text-sm peer-checked:border-teal peer-checked:bg-teal-mist peer-checked:text-teal-dark peer-focus-visible:ring-4 peer-focus-visible:ring-teal/20">
                  {t.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" required rows={8} defaultValue={event?.description} className="input" placeholder="What will happen, who it's for, what participants will take away…" />
        </div>
      </Card>

      <Card title="When">
        <div className="grid gap-4 sm:grid-cols-3">
          <DateField name="startsAt" label="Starts" value={event?.startsAt} />
          <DateField name="endsAt" label="Ends" value={event?.endsAt} />
          <DateField name="registrationDeadline" label="Registration closes" value={event?.registrationDeadline} />
        </div>
        <p className="hint">All times are India Standard Time (IST).</p>
      </Card>

      <Card title="Where">
        <div className="grid grid-cols-3 gap-2">
          {EVENT_MODES.map((m) => (
            <label key={m.value} className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-medium ${mode === m.value ? "border-teal bg-teal-mist text-teal-dark" : "border-line bg-white"}`}>
              <input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} className="sr-only" />
              {m.label}
            </label>
          ))}
        </div>
        {mode !== "ONLINE" && (
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label className="label" htmlFor="venue">Venue</label>
              <input id="venue" name="venue" required defaultValue={event?.venue ?? ""} className="input" placeholder="Hall, building, area" />
            </div>
            <div>
              <label className="label" htmlFor="city">City</label>
              <input id="city" name="city" required defaultValue={event?.city ?? ""} className="input" />
            </div>
          </div>
        )}
        {mode !== "OFFLINE" && (
          <div>
            <label className="label" htmlFor="meetingLink">Meeting link <span className="text-muted">(optional for now)</span></label>
            <input id="meetingLink" name="meetingLink" type="url" defaultValue={event?.meetingLink ?? ""} className="input" placeholder="https://meet.google.com/…" />
            <p className="hint">Only people who register can see this link.</p>
          </div>
        )}
      </Card>

      <Card title="Registration">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="capacity">Seats</label>
            <input id="capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ""} className="input" placeholder="Leave empty for unlimited" />
          </div>
          <div>
            <label className="label" htmlFor="price">Fee (₹)</label>
            <input id="price" name="price" type="number" min={0} defaultValue={event?.price ?? 0} className="input" />
            <p className="hint">0 for free. Fees are collected by you directly for now.</p>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="bannerUrl">Banner image link <span className="text-muted">(optional)</span></label>
          <input id="bannerUrl" name="bannerUrl" type="url" defaultValue={event?.bannerUrl ?? ""} className="input" placeholder="https://… (wide image, about 1600×600)" />
        </div>
      </Card>

      <Card title="Speakers" subtitle="Optional — who's leading the session?">
        {speakers.map((s, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-line bg-ivory p-4 sm:grid-cols-2">
            <input value={s.name} onChange={(e) => updateSpeaker(i, "name", e.target.value)} className="input" placeholder="Name" aria-label="Speaker name" />
            <input value={s.role ?? ""} onChange={(e) => updateSpeaker(i, "role", e.target.value)} className="input" placeholder="Role, e.g. Clinical Psychologist" aria-label="Speaker role" />
            <input value={s.photoUrl ?? ""} onChange={(e) => updateSpeaker(i, "photoUrl", e.target.value)} className="input sm:col-span-2" placeholder="Photo link (optional)" aria-label="Speaker photo link" />
            <textarea value={s.bio ?? ""} onChange={(e) => updateSpeaker(i, "bio", e.target.value)} rows={2} className="input sm:col-span-2" placeholder="Short bio (optional)" aria-label="Speaker bio" />
            <button type="button" onClick={() => setSpeakers((list) => list.filter((_, j) => j !== i))} className="justify-self-start text-sm text-rose hover:underline">
              Remove speaker
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setSpeakers((list) => [...list, { ...blankSpeaker }])} className="btn-secondary btn-sm">
          + Add speaker
        </button>
      </Card>

      <Card title="Agenda" subtitle="Optional — the running order of the event.">
        {agenda.map((a, i) => (
          <div key={i} className="flex gap-2">
            <input value={a.time ?? ""} onChange={(e) => updateAgenda(i, "time", e.target.value)} className="input w-32 shrink-0" placeholder="10:00 AM" aria-label="Time" />
            <input value={a.title} onChange={(e) => updateAgenda(i, "title", e.target.value)} className="input" placeholder="What happens" aria-label="Agenda item" />
            <button type="button" onClick={() => setAgenda((list) => list.filter((_, j) => j !== i))} className="btn-ghost btn-sm text-rose" aria-label="Remove agenda item">
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setAgenda((list) => [...list, { ...blankAgenda }])} className="btn-secondary btn-sm">
          + Add agenda item
        </button>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-ivory/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <FormMessage state={state} />
        <div className="mt-3 flex flex-wrap justify-end gap-2 first:mt-0">
          {isDraft ? (
            <>
              <SubmitButton pending={pending} name="intent" value="draft" className="btn-secondary">Save as draft</SubmitButton>
              <SubmitButton pending={pending} name="intent" value="publish" pendingText="Publishing…">Publish event</SubmitButton>
            </>
          ) : (
            <SubmitButton pending={pending} name="intent" value="save" pendingText="Saving…">Save changes</SubmitButton>
          )}
        </div>
      </div>
    </form>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="card space-y-4 p-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function DateField({ name, label, value }: { name: string; label: string; value?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type="datetime-local" required defaultValue={value ? toDateTimeLocal(value) : ""} className="input" />
    </div>
  );
}
