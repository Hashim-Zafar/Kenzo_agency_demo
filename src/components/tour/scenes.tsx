import type { SceneKey } from "@/lib/tour/types";

// Placeholder scenes. Each will be replaced by its own animated component.

const DESCRIPTIONS: Record<SceneKey, string> = {
  "customer-intro": "Agency site with the “Book a meeting” button",
  "customer-agent": "Live Kenzo walkthrough — built once the v5 API is ready",
  "customer-booking": "Date & time picker",
  "customer-confirmation": "Simulated confirmation email",
  "customer-reminders": "Reminder timeline: 24h · 3h · 30m",
  "agency-intro": "Switch to the agency's side",
  "agency-booked": "Simulated “meeting booked” email",
  "agency-brief": "Reminder with AI brief",
  "agency-dashboard": "Dashboard walkthrough (from Claude Design wireframe)",
  "tour-end": "Closing call to action",
};

export function Scene({ scene, pending }: { scene: SceneKey; pending?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-kenzo-200 bg-white/60 p-6 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-kenzo-500">{scene}</span>
      <p className="max-w-sm text-lg text-ink-700">{DESCRIPTIONS[scene]}</p>
      {pending && (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          Coming soon
        </span>
      )}
    </div>
  );
}
