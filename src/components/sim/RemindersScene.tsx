"use client";

import { useEffect, useState } from "react";
import { time12, type Booking } from "@/lib/sim/booking";

type Reminder = { when: string; title: string; body: string };

/** The reminders arriving on the lead's phone, fast-forwarded. */
export function RemindersScene({
  agencyName,
  booking,
  playKey,
  onDone,
}: {
  agencyName: string;
  booking: Booking;
  /** Change it to replay. */
  playKey: number;
  onDone: () => void;
}) {
  const at = time12(booking.time);
  const reminders: Reminder[] = [
    { when: "24 hours before", title: `Tomorrow: your call with ${agencyName}`, body: `See you tomorrow at ${at}. Here's your Zoom link.` },
    { when: "3 hours before", title: `Today at ${at}`, body: `Your call with ${agencyName} is in 3 hours. Join with one tap.` },
    { when: "30 minutes before", title: "Starting in 30 minutes", body: `${agencyName} will see you at ${at}. Join Zoom.` },
  ];

  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timers = reminders.map((_, i) =>
      setTimeout(() => {
        setShown(i + 1);
        if (i === reminders.length - 1) onDone();
      }, 900 + i * 1600),
    );
    return () => timers.forEach(clearTimeout);
    // reminders is derived from props that don't change during a play
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  const clock = shown === 0 ? "Booked" : reminders[shown - 1].when;

  return (
    <section
      aria-label="Reminders on their phone"
      className="relative z-(--z-frame) mx-auto flex w-full max-w-(--frame-max-width) flex-1 flex-col items-center gap-6 bg-surface px-4 py-6 md:min-h-[600px] md:flex-none md:flex-row md:justify-center md:gap-14 md:rounded-frame md:border-default md:px-10 md:py-10 md:shadow-frame"
    >
      {/* Timeline */}
      <ol className="m-0 flex w-full max-w-xs list-none flex-col gap-0 p-0" aria-label="When reminders go out">
        {["Booked", ...reminders.map((r) => r.when), "Call starts"].map((label, i) => {
          const done = i <= shown;
          const isLast = i === reminders.length + 1;
          return (
            <li key={label} className="flex gap-3">
              <span className="flex flex-col items-center">
                <i className={`mt-1 size-3 rounded-full transition-colors duration-(--duration-base) ${done ? "bg-accent" : "border-control bg-surface"}`} />
                {!isLast && <i className={`w-0.5 flex-1 transition-colors duration-(--duration-base) ${i < shown ? "bg-accent" : "bg-line-strong"}`} />}
              </span>
              <span className={`pb-6 text-sm ${done ? "font-semibold" : "text-fg-subtle"}`}>{label}</span>
            </li>
          );
        })}
      </ol>

      {/* Phone */}
      <div
        data-tour="reminders"
        className="flex w-full max-w-[320px] flex-col gap-3 rounded-[36px] border-(length:--border-width-strong) border-line-strong bg-inverse p-4 pb-8 md:min-h-[520px]"
      >
        <div className="flex flex-col items-center gap-1 py-6 text-inverse-fg">
          <span className="text-xs uppercase tracking-wider text-inverse-muted">{clock}</span>
          <span className="font-display text-4xl font-medium tabular-nums">{at}</span>
        </div>
        {reminders.slice(0, shown).map((r, i) => (
          <div key={`${playKey}-${i}`} className="animate-drop rounded-card bg-surface/95 p-3 text-fg shadow-bubble">
            <div className="flex items-center justify-between text-xs text-fg-subtle">
              <span className="font-semibold uppercase tracking-wider">{agencyName}</span>
              <span>{r.when}</span>
            </div>
            <div className="mt-1 text-sm font-semibold">{r.title}</div>
            <div className="text-sm text-fg-muted">{r.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
