"use client";

import { AgencyFrame } from "./AgencyFrame";
import { SIM, bookingDays, dayName, freeTimes, isTaken, longDate, time12, type Booking, type Day } from "@/lib/sim/booking";

const days = bookingDays();

/** Simulated slot picker: the lead picks a day, then a time, then confirms. */
export function BookingScreen({
  agencyName,
  day,
  time,
  busy,
  onDay,
  onTime,
  onConfirm,
}: {
  agencyName: string;
  day: Day | null;
  time: string | null;
  busy: boolean;
  onDay: (d: Day) => void;
  onTime: (t: string) => void;
  onConfirm: (b: Booking) => void;
}) {
  const weeks = [days.slice(0, 7), days.slice(7, 14)];
  return (
    <AgencyFrame agencyName={agencyName} path="/book">
      <div className="flex flex-1 justify-center px-4 py-6 md:items-center md:px-10 md:py-8">
        <div className="flex w-full max-w-[720px] animate-rise flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-display text-[22px] font-medium leading-snug md:text-[28px] md:leading-9">
              Pick a time for your call
            </h1>
            <p className="m-0 text-fg-muted">
              {SIM.callLength} on {SIM.where} with {agencyName}. Times are in {SIM.timezone}.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
            {/* Days */}
            <div data-tour="calendar" className="rounded-card border-default p-4">
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-fg-subtle">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              {weeks.map((week, w) => (
                <div key={w} className="grid grid-cols-7 gap-1">
                  {week.map((d) => {
                    const open = !d.weekend && freeTimes(d.key).length > 0;
                    const selected = day?.key === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        disabled={!open || busy}
                        onClick={() => onDay(d)}
                        aria-pressed={selected}
                        aria-label={`${longDate(d.date)}${open ? "" : ", no times"}`}
                        className={`flex aspect-square min-h-11 items-center justify-center rounded-full text-sm tabular-nums transition duration-(--duration-fast) ease-kenzo ${
                          selected
                            ? "bg-accent font-semibold text-accent-fg"
                            : open
                              ? "font-semibold hover:bg-accent-soft"
                              : "text-fg-subtle line-through opacity-60"
                        }`}
                      >
                        {d.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Times */}
            <div data-tour="slots" className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                {day ? `${dayName(day.date)} ${day.date.getDate()}` : "Pick a day first"}
              </span>
              {day &&
                SIM.times.map((t) => {
                  const taken = isTaken(day.key, t);
                  const selected = time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={taken || busy}
                      onClick={() => onTime(t)}
                      aria-pressed={selected}
                      className={`min-h-11 rounded-button px-4 text-left tabular-nums transition duration-(--duration-fast) ease-kenzo ${
                        selected
                          ? "border-strong border-accent bg-accent-soft font-semibold"
                          : taken
                            ? "border-(length:--border-width-default) border-dashed border-line-strong text-fg-subtle line-through"
                            : "border-control bg-surface hover:border-accent"
                      }`}
                    >
                      {time12(t)}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-fg-subtle">
              The invite goes to <strong className="text-fg">{SIM.leadEmail}</strong>, the email given at the start.
            </span>
            <button
              type="button"
              data-tour="book"
              disabled={!day || !time || busy}
              onClick={() => day && time && onConfirm({ day, time })}
              className="min-h-13 rounded-button bg-accent px-6 font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-40"
            >
              {busy ? "Booking…" : day && time ? `Book ${dayName(day.date)} ${day.date.getDate()}, ${time12(time)}` : "Book the call"}
            </button>
          </div>
        </div>
      </div>
    </AgencyFrame>
  );
}
