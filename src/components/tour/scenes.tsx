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
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-panel border-strong border-dashed bg-scene p-6 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-progress">{scene}</span>
      <p className="max-w-sm text-lg text-fg-muted">{DESCRIPTIONS[scene]}</p>
      {pending && (
        <span className="rounded-control bg-notice-bg px-3 py-1 text-xs font-medium text-notice-fg">
          Coming soon
        </span>
      )}
    </div>
  );
}
