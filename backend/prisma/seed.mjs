// Demo data for local development: `npm run db:seed`.
// Wipes existing events, registrations and users first, so it only runs
// against a schema whose name ends in `_dev` (or a database on this machine).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const target = new URL(process.env.DATABASE_URL);
const schema = target.searchParams.get("schema") ?? "public";
if (!schema.endsWith("_dev") && !["localhost", "127.0.0.1"].includes(target.hostname)) {
  console.error(`Refusing to seed schema "${schema}" on ${target.hostname}: the seed deletes all data. Use a *_dev schema.`);
  process.exit(1);
}

const prisma = new PrismaClient();
const DAY = 86_400_000;

/** A date `days` from now at the given India-time hour. */
function at(days, hour, minute = 0) {
  const d = new Date(Date.now() + days * DAY);
  const ymd = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return new Date(`${ymd}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`);
}

async function main() {
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const mindful = await prisma.user.create({
    data: {
      name: "Dr. Ananya Rao",
      email: "organizer@demo.in",
      passwordHash,
      role: "ORGANIZER",
      orgName: "Mindful Circle Collective",
      bio: "A collective of clinical psychologists and counsellors running evidence-based workshops on anxiety, stress and emotional wellbeing across India.",
      website: "https://example.org",
    },
  });
  const staad = await prisma.user.create({
    data: {
      name: "STAAD Team",
      email: "staad@demo.in",
      passwordHash,
      role: "ORGANIZER",
      orgName: "STAAD",
      bio: "Smart Therapy & AI Digital Platform — building technology that supports therapists and the people they care for.",
      website: "https://staad.in",
    },
  });
  const participant = await prisma.user.create({
    data: { name: "Rahul Verma", email: "participant@demo.in", passwordHash, phone: "9876543210" },
  });

  const events = [
    {
      organizerId: mindful.id,
      slug: "managing-exam-anxiety-workshop",
      title: "Managing Exam Anxiety: A Practical Workshop for Students",
      tagline: "Simple CBT tools to calm your mind before and during exams.",
      description:
        "Exams can feel overwhelming. In this interactive 2-hour workshop, a clinical psychologist walks you through practical, research-backed techniques to manage worry, sleep better and stay focused.\n\nYou'll learn:\n• How anxiety shows up in the body and mind\n• Grounding and breathing techniques you can use in the exam hall\n• How to challenge 'I'm going to fail' thoughts\n• Building a realistic study and rest routine\n\nOpen to college and senior school students. No prior knowledge needed.",
      type: "WORKSHOP",
      mode: "ONLINE",
      topics: "anxiety,students,stress",
      startsAt: at(6, 17),
      endsAt: at(6, 19),
      registrationDeadline: at(5, 23, 59),
      meetingLink: "https://meet.google.com/abc-defg-hij",
      capacity: 80,
      price: 0,
      speakers: JSON.stringify([{ name: "Dr. Ananya Rao", role: "Clinical Psychologist", bio: "12 years of experience working with students and young adults." }]),
      agenda: JSON.stringify([
        { time: "5:00 PM", title: "Welcome & check-in" },
        { time: "5:15 PM", title: "Understanding exam anxiety" },
        { time: "5:45 PM", title: "Hands-on: grounding and breathing" },
        { time: "6:30 PM", title: "Q&A" },
      ]),
    },
    {
      organizerId: staad.id,
      slug: "psyverse-2026",
      title: "PSYVERSE 2026 — Where Psychology Meets Technology",
      tagline: "The Evolution of Therapy: what has changed, what hasn't, and what comes next?",
      description:
        "PSYVERSE brings together psychologists, therapists, students and technologists for a morning of conversations about the future of therapy.\n\nHear from practitioners on how AI, teletherapy and digital tools are reshaping care — and why human connection still sits at the heart of healing.",
      type: "CONCLAVE",
      mode: "OFFLINE",
      topics: "practitioners,students",
      startsAt: at(5, 9, 30),
      endsAt: at(5, 13),
      registrationDeadline: at(4, 23, 59),
      venue: "G04 Auditorium, HITAM",
      city: "Hyderabad",
      capacity: 100,
      price: 100,
      speakers: JSON.stringify([
        { name: "Dr. Meera Iyer", role: "Psychiatrist" },
        { name: "Arjun Menon", role: "Counselling Psychologist" },
        { name: "Priya Sharma", role: "Founder, STAAD" },
      ]),
      agenda: JSON.stringify([
        { time: "9:30 AM", title: "Registration & welcome" },
        { time: "10:00 AM", title: "Keynote: The evolution of therapy" },
        { time: "11:00 AM", title: "Panel: AI in the therapy room" },
        { time: "12:15 PM", title: "Open conversation & networking" },
      ]),
    },
    {
      organizerId: mindful.id,
      slug: "mindfulness-for-busy-professionals",
      title: "Mindfulness for Busy Professionals",
      tagline: "A 60-minute live webinar on staying present when work won't slow down.",
      description:
        "Learn short mindfulness practices that fit into a working day — between meetings, on your commute, or before sleep. Includes two guided practices and a live Q&A.",
      type: "WEBINAR",
      mode: "ONLINE",
      topics: "mindfulness,workplace,stress",
      startsAt: at(10, 19),
      endsAt: at(10, 20),
      registrationDeadline: at(10, 18),
      meetingLink: "https://zoom.us/j/1234567890",
      capacity: null,
      price: 0,
      speakers: JSON.stringify([{ name: "Kavya Nair", role: "Mindfulness Coach" }]),
      agenda: "[]",
    },
    {
      organizerId: staad.id,
      slug: "national-conference-digital-mental-health",
      title: "National Conference on Digital Mental Health 2026",
      tagline: "Two days of research, practice and policy.",
      description:
        "A two-day conference bringing together researchers, clinicians and policymakers to discuss evidence for digital mental health interventions in India — from Tele-MANAS to app-based therapy. Paper presentations, workshops and panels.",
      type: "CONFERENCE",
      mode: "HYBRID",
      topics: "practitioners,depression,anxiety",
      startsAt: at(21, 9),
      endsAt: at(22, 17),
      registrationDeadline: at(18, 23, 59),
      venue: "India Habitat Centre",
      city: "New Delhi",
      meetingLink: "https://youtube.com/live/example",
      capacity: 300,
      price: 1500,
      speakers: JSON.stringify([
        { name: "Prof. S. Krishnan", role: "NIMHANS" },
        { name: "Dr. Fatima Sheikh", role: "Public health researcher" },
      ]),
      agenda: JSON.stringify([
        { time: "Day 1", title: "Keynotes and paper sessions" },
        { time: "Day 2", title: "Workshops and policy roundtable" },
      ]),
    },
    {
      organizerId: mindful.id,
      slug: "navigating-grief-together",
      title: "Navigating Grief Together",
      tagline: "A gentle, small-group workshop on living with loss.",
      description:
        "A safe, facilitated space to understand grief, share if you wish, and learn ways to care for yourself. Limited to 20 participants to keep the group small and supportive.",
      type: "WORKSHOP",
      mode: "OFFLINE",
      topics: "grief,self-care",
      startsAt: at(14, 11),
      endsAt: at(14, 13, 30),
      registrationDeadline: at(12, 23, 59),
      venue: "The Quiet Room, Indiranagar",
      city: "Bengaluru",
      capacity: 20,
      price: 499,
      speakers: "[]",
      agenda: "[]",
    },
    {
      organizerId: mindful.id,
      slug: "workplace-burnout-webinar",
      title: "Spotting Burnout Before It Spots You",
      tagline: "For managers and HR teams.",
      description:
        "What burnout really looks like, how it differs from stress, and what managers can do to build healthier teams. Practical checklists included.",
      type: "WEBINAR",
      mode: "ONLINE",
      topics: "workplace,stress",
      startsAt: at(-12, 16),
      endsAt: at(-12, 17),
      registrationDeadline: at(-12, 15),
      meetingLink: "https://meet.google.com/xyz-abcd-efg",
      capacity: null,
      price: 0,
      speakers: "[]",
      agenda: "[]",
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: { ...event, status: "PUBLISHED" } });
  }
  const anxiety = await prisma.event.findUniqueOrThrow({ where: { slug: "managing-exam-anxiety-workshop" } });
  await prisma.registration.create({
    data: { eventId: anxiety.id, userId: participant.id, name: participant.name, email: participant.email, phone: "9876543210" },
  });

  console.log(`Seeded ${events.length} events. Log in with organizer@demo.in / participant@demo.in, password demo1234.`);
}

main().finally(() => prisma.$disconnect());
