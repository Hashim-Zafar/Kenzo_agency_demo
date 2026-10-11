"use client";

import { useEffect, useState } from "react";
import { SIM, bookingLabel, longDate, time12, type Booking } from "@/lib/sim/booking";

/** The lead's inbox: the confirmation arrives a moment after booking. */
export function ConfirmationScene({ agencyName, booking }: { agencyName: string; booking: Booking }) {
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArrived(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      aria-label="Their inbox"
      className="relative z-(--z-frame) mx-auto flex w-full max-w-(--frame-max-width) flex-1 flex-col overflow-hidden bg-surface md:min-h-[600px] md:flex-none md:rounded-frame md:border-default md:shadow-frame"
    >
      <div className="flex h-12 items-center gap-3 border-b-(length:--border-width-default) border-line bg-surface-muted px-4 md:px-6">
        <MailIcon />
        <span className="font-semibold">Inbox</span>
        <span className="ml-auto text-sm text-fg-subtle">{SIM.leadEmail}</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Message list (larger screens) */}
        <ul className="m-0 hidden w-72 shrink-0 list-none flex-col border-r-(length:--border-width-default) border-line p-0 md:flex">
          {arrived && (
            <li className="animate-drop border-b-(length:--border-width-default) border-line bg-accent-soft px-4 py-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{agencyName}</span>
                <span className="text-xs text-fg-subtle">now</span>
              </div>
              <div className="truncate text-sm font-semibold">Your call is booked</div>
              <div className="truncate text-xs text-fg-subtle">{bookingLabel(booking)}</div>
            </li>
          )}
          {["Weekly newsletter", "Your receipt", "Team update"].map((s) => (
            <li key={s} className="border-b-(length:--border-width-default) border-line px-4 py-3 opacity-50" aria-hidden="true">
              <div className="h-3 w-24 rounded bg-line" />
              <div className="mt-2 text-sm text-fg-subtle">{s}</div>
            </li>
          ))}
        </ul>

        {/* The email */}
        <div className="flex flex-1 justify-center overflow-y-auto px-4 py-6 md:px-10 md:py-8">
          {!arrived ? (
            <div className="flex items-center gap-2 self-center text-fg-subtle" role="status">
              <i className="size-2 animate-pulse rounded-full bg-accent" /> Waiting for the email…
            </div>
          ) : (
            <article data-tour="email" className="flex w-full max-w-[520px] animate-rise flex-col gap-4 self-start rounded-card border-default p-5 md:p-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-fg-subtle">From {agencyName} · to {SIM.leadEmail}</span>
                <h2 className="m-0 text-xl font-semibold">Your call with {agencyName} is booked</h2>
              </div>
              <p className="m-0 leading-relaxed">
                Hi {SIM.leadName}, thanks for booking. Here are the details for your {SIM.callLength}.
              </p>
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-card bg-surface-muted p-4 text-sm">
                <dt className="text-fg-subtle">When</dt>
                <dd className="m-0 font-semibold">
                  {longDate(booking.day.date)}, {time12(booking.time)} ({SIM.timezone})
                </dd>
                <dt className="text-fg-subtle">Where</dt>
                <dd className="m-0 font-semibold">{SIM.where} (link below)</dd>
              </dl>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex min-h-11 items-center rounded-button bg-accent px-5 font-semibold text-accent-fg">Join Zoom call</span>
                <span className="inline-flex min-h-11 items-center rounded-button border-control px-5 font-semibold">Add to calendar</span>
              </div>
              <p className="m-0 text-sm text-fg-subtle">Need another time? Reply to this email and we&apos;ll sort it.</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}
