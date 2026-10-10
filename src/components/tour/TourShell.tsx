"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Tour } from "@/lib/tour/types";
import { Mascot } from "@/components/mascot/Mascot";
import { Scene } from "./scenes";

const btnPrimary =
  "rounded-control bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition duration-(--duration-fast) ease-kenzo hover:bg-accent-hover";
const btnGhost =
  "rounded-control px-5 py-2.5 text-sm font-medium text-fg-muted transition duration-(--duration-fast) ease-kenzo hover:bg-surface-muted disabled:opacity-30";

export function TourShell({ tour }: { tour: Tour }) {
  const [index, setIndex] = useState(0);
  const total = tour.steps.length;
  const step = tour.steps[index];
  const isLast = index === total - 1;

  const go = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(total - 1, i))),
    [total],
  );

  // Arrow-key navigation (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  return (
    <div className="flex min-h-dvh flex-col bg-page text-fg">
      {/* Header + progress */}
      <header className="flex items-center gap-4 px-4 pt-4 sm:px-8 sm:pt-6">
        <Link href="/" className="font-display font-semibold tracking-tight text-brand">
          Kenzo
        </Link>
        <span className="text-sm text-fg-subtle">{tour.title}</span>
      </header>

      <nav aria-label="Tour progress" className="px-4 pt-4 sm:px-8">
        <ol className="flex gap-1.5 sm:gap-2">
          {tour.steps.map((s, i) => (
            <li key={s.id} className="flex-1">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? "step" : undefined}
                className="group flex w-full flex-col gap-1.5 text-left"
              >
                <span
                  className={`h-1.5 w-full rounded-control transition-colors duration-(--duration-base) ease-kenzo ${
                    i <= index ? "bg-progress" : "bg-progress-track"
                  }`}
                />
                <span
                  className={`hidden text-xs sm:block ${
                    i === index ? "font-medium text-brand" : "text-fg-subtle"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Stage + guide: side by side on large screens, stacked on small */}
      <main className="grid flex-1 grid-rows-[1fr_auto] gap-4 p-4 sm:p-8 lg:grid-cols-[1fr_340px] lg:grid-rows-1 lg:gap-8">
        <section aria-label="Scene" className="min-h-[46dvh] lg:min-h-0">
          <Scene scene={step.scene} pending={step.pending} />
        </section>

        <aside
          aria-live="polite"
          className="flex items-end gap-3 lg:flex-col lg:items-center lg:justify-center lg:gap-6"
        >
          <Mascot
            pose={step.pose}
            priority
            className="w-20 shrink-0 sm:w-24 lg:order-2 lg:w-44"
          />
          <div className="relative flex-1 rounded-card rounded-bl-tail border-default bg-surface p-4 text-[15px] leading-relaxed shadow-bubble lg:order-1 lg:flex-none lg:rounded-bl-card lg:p-5 lg:text-base">
            {step.narration}
          </div>
        </aside>
      </main>

      {/* Controls */}
      <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t-(length:--border-width-default) border-line bg-page/90 px-4 py-3 backdrop-blur sm:px-8 sm:py-4">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className={btnGhost}
        >
          Back
        </button>
        <span className="text-xs tabular-nums text-fg-subtle">
          {index + 1} / {total}
        </span>
        {isLast && tour.next ? (
          <Link href={tour.next.href} className={btnPrimary}>
            {tour.next.label}
          </Link>
        ) : (
          <button type="button" onClick={() => go(index + 1)} className={btnPrimary}>
            Next
          </button>
        )}
      </footer>
    </div>
  );
}
