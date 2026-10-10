import type { Tour } from "./types";

// Narration is placeholder copy — to be rewritten once each scene is built.

export const customerTour: Tour = {
  id: "customer",
  title: "Your customer's view",
  steps: [
    {
      id: "intro",
      scene: "customer-intro",
      pose: "wave",
      label: "Start",
      narration:
        "Hi, I'm Kenzo! Let's step into your customer's shoes. They just clicked “Book a meeting” on your site — here's what happens next.",
    },
    {
      id: "agent",
      scene: "customer-agent",
      pose: "laptop",
      label: "Qualify",
      narration:
        "Instead of a long form, I ask one question at a time and work out whether they're a good fit.",
      pending: true, // live agent walkthrough — waits for the v5 API
    },
    {
      id: "booking",
      scene: "customer-booking",
      pose: "notepad",
      label: "Book",
      narration:
        "Good fit? They pick a date and time that suits them — no back-and-forth emails.",
    },
    {
      id: "confirmation",
      scene: "customer-confirmation",
      pose: "envelope",
      label: "Confirm",
      narration:
        "A confirmation lands in their inbox straight away, with the meeting link.",
    },
    {
      id: "reminders",
      scene: "customer-reminders",
      pose: "envelope",
      label: "Remind",
      narration:
        "Then I make sure they turn up: reminders 24 hours, 3 hours and 30 minutes before, each with the link.",
    },
  ],
  next: { href: "/tour/agency", label: "Now see it from your side" },
};

export const agencyTour: Tour = {
  id: "agency",
  title: "Your view",
  steps: [
    {
      id: "intro",
      scene: "agency-intro",
      pose: "wave",
      label: "Start",
      narration:
        "Now let's switch sides. Here's what you and your team see while I do the work.",
    },
    {
      id: "booked",
      scene: "agency-booked",
      pose: "envelope",
      label: "Booked",
      narration:
        "The moment a qualified lead books, you get an email: who, when, and what they're after.",
    },
    {
      id: "brief",
      scene: "agency-brief",
      pose: "notepad",
      label: "Brief",
      narration:
        "Before the call, I send you a reminder with an AI brief — so you never walk in blind.",
    },
    {
      id: "dashboard",
      scene: "agency-dashboard",
      pose: "laptop",
      label: "Dashboard",
      narration:
        "Everything lands on your dashboard: leads, bookings, and exactly what it costs to run.",
    },
    {
      id: "end",
      scene: "tour-end",
      pose: "wave",
      label: "Done",
      narration: "That's the whole journey. Want me working for your agency?",
    },
  ],
  next: { href: "/", label: "Back to start" },
};
