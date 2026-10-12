"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mascot, type MascotPose } from "@/components/mascot/Mascot";
import type { Hint } from "@/lib/tour/hints";
import { useIsMobile } from "@/lib/useIsMobile";

type Rect = { top: number; left: number; width: number; height: number };
type Layout = {
  spot: Rect | null;
  bubble: { x: number; y: number };
  tail: { side: "left" | "right" | "top" | "bottom" | "none"; offset: number };
  mascot: { x: number; y: number; pose: MascotPose } | null;
};

function cssPx(name: string, fallback: number): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
}

function sameRect(a: Rect | null, b: Rect | null) {
  if (!a || !b) return a === b;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

/** Kenzo the guide: dims the page except the target, and explains it. */
export function Guide({
  hint,
  onPrimary,
  onBack,
  busy,
}: {
  hint: Hint;
  onPrimary: () => void;
  onBack?: () => void;
  busy: boolean;
}) {
  const mobile = useIsMobile();
  const [rect, setRect] = useState<Rect | null>(null);
  const [size, setSize] = useState({ w: 320, h: 200 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  // Measure the bubble whenever it exists (it may mount after the target is found).
  const observer = useRef<ResizeObserver | null>(null);
  const bubbleRef = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    const measure = () =>
      setSize((s) => (s.w === el.offsetWidth && s.h === el.offsetHeight ? s : { w: el.offsetWidth, h: el.offsetHeight }));
    measure();
    observer.current = new ResizeObserver(measure);
    observer.current.observe(el);
  }, []);
  useEffect(() => () => observer.current?.disconnect(), []);

  // Follow the target every frame (layout shifts, scrolling, the keyboard).
  useEffect(() => {
    // The Guide is remounted per tip (keyed by id), so rect starts null.
    if (!hint.target) return;
    let raf = 0;
    let last: Rect | null = null;
    let scrolled = false;
    const tick = () => {
      // "a|b" lights up both targets as one area. For each name, the first
      // visible match (some targets exist twice: desktop + phone).
      const els = hint.target!
        .split("|")
        .map((name) =>
          Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)).find(
            (e) => e.offsetWidth > 0 && e.offsetHeight > 0,
          ),
        )
        .filter((e): e is HTMLElement => Boolean(e));
      let next: Rect | null = null;
      // On phones the Ask Kenzo sheet covers the step: don't ring something
      // underneath it.
      const sheet = mobile ? document.querySelector('[data-tour="ask-panel"]') : null;
      const hidden = sheet !== null && els.some((e) => !sheet.contains(e));
      if (els.length && !hidden) {
        if (!scrolled) {
          els[els.length - 1].scrollIntoView({ block: "center", behavior: "smooth" });
          scrolled = true;
        }
        const rs = els.map((e) => e.getBoundingClientRect());
        const top = Math.min(...rs.map((r) => r.top));
        const left = Math.min(...rs.map((r) => r.left));
        const bottom = Math.max(...rs.map((r) => r.bottom));
        const right = Math.max(...rs.map((r) => r.right));
        next = { top, left, width: right - left, height: bottom - top };
      }
      if (!sameRect(last, next)) {
        last = next;
        setRect(next);
      }
      const vv = window.visualViewport;
      const w = vv?.width ?? window.innerWidth;
      const h = vv?.height ?? window.innerHeight;
      setViewport((v) => (v.w === w && v.h === h ? v : { w, h }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hint.target, hint.id, mobile]);

  const layout = rect && viewport.w > 0 ? place(rect, size, viewport, hint.pose) : null;
  const centred = !hint.target || !layout;

  /* ---- A turn is in flight: a quiet note, nothing stale on screen ---- */
  if (hint.thinking) {
    return mobile ? (
      <Strip hint={hint} onPrimary={onPrimary} onBack={onBack} busy={busy} rect={null} />
    ) : (
      <div role="status" className="fixed bottom-6 left-1/2 z-(--z-bubble) flex -translate-x-1/2 items-center gap-3 rounded-full border-(length:--border-width-default) border-line-strong bg-surface py-2 pr-5 pl-2 shadow-bubble animate-pop">
        <span className="size-9 shrink-0 overflow-hidden rounded-full border-strong border-accent bg-accent-soft">
          <Mascot pose="head" decorative className="mt-0.5 w-full" />
        </span>
        <span className="text-sm font-semibold">{hint.title}</span>
        <i className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
      </div>
    );
  }

  /* ---- Phones: a strip with its own space at the bottom. Nothing is dimmed
         or covered; a ring marks what Kenzo is talking about. ---- */
  if (mobile && !(centred && !hint.target)) {
    return <Strip hint={hint} onPrimary={onPrimary} onBack={onBack} busy={busy} rect={rect} />;
  }

  const bubble = (
    <div
      ref={bubbleRef}
      role="dialog"
      aria-label="Kenzo's tip"
      aria-live="polite"
      className={`flex flex-col gap-3 rounded-card border-(length:--border-width-default) border-line-strong bg-surface p-5 text-fg ${mobile && !centred ? "shadow-dock" : "shadow-bubble"}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{hint.eyebrow ?? "Your customer’s view"}</span>
      <p className="m-0 text-base font-semibold leading-snug">{hint.title}</p>
      {hint.body && <p className="m-0 text-sm leading-relaxed text-fg-muted">{hint.body}</p>}
      {hint.suggestion && (
        <span className="self-start rounded-control border-(length:--border-width-default) border-dashed border-accent-soft-line bg-accent-soft px-3 py-1 text-sm font-medium text-accent-pressed">
          Try: “{hint.suggestion}”
        </span>
      )}
      {(hint.waiting || hint.primary) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {hint.back && onBack ? (
            <button type="button" onClick={onBack} className="min-h-10 rounded-control border-control bg-surface px-4 text-sm font-semibold hover:bg-surface-muted">
              Back
            </button>
          ) : hint.waiting ? (
            <span className="flex items-center gap-2 text-sm text-fg-subtle">
              <i className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              {busy ? "Kenzo is thinking…" : hint.waiting}
            </span>
          ) : (
            <span />
          )}
          {hint.primary && (
            <button
              type="button"
              onClick={onPrimary}
              disabled={busy && hint.primary.action !== "restart"}
              className={`min-h-10 rounded-control px-4 text-sm font-semibold transition duration-(--duration-fast) ease-kenzo disabled:opacity-50 ${
                hint.waiting ? "border-control bg-surface hover:bg-surface-muted" : "bg-accent text-accent-fg hover:bg-accent-hover"
              }`}
            >
              {hint.primary.label}
            </button>
          )}
        </div>
      )}
    </div>
  );

  /* ---- No target (intro, limits, errors): a centred card ---- */
  if (centred) {
    if (hint.target && !rect) return null; // target not on screen yet
    return (
      <div className="fixed inset-0 z-(--z-scrim) flex items-center justify-center bg-(--scrim) p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 md:max-w-2xl md:flex-row md:items-end">
          <Mascot pose={hint.pose === "point" ? "present" : hint.pose} priority className="w-32 md:w-44" />
          <div className="w-full md:w-(--bubble-width) md:shrink-0">{bubble}</div>
        </div>
      </div>
    );
  }

  const pad = cssPx("--spotlight-padding", 8);
  const { spot, bubble: b, tail, mascot } = layout;

  return (
    <>
      {/* Spotlight: everything but the target dims. Clicks pass through. */}
      {spot && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-(--z-scrim) rounded-(--spotlight-radius) transition-all duration-(--duration-slow) ease-kenzo"
          style={{
            top: spot.top - pad,
            left: spot.left - pad,
            width: spot.width + pad * 2,
            height: spot.height + pad * 2,
            boxShadow: "0 0 0 var(--spotlight-ring-width) var(--spotlight-ring), 0 0 0 200vmax var(--scrim)",
          }}
        />
      )}

        <>
          <div
            className="fixed left-0 top-0 z-(--z-bubble) w-(--bubble-width) transition-transform duration-(--duration-slow) ease-kenzo"
            style={{ transform: `translate(${b.x}px, ${b.y}px)` }}
          >
            {tail.side !== "none" && (
              <span
                aria-hidden="true"
                className="absolute size-3.5 rotate-45 border-(length:--border-width-default) border-line-strong bg-surface"
                style={
                  tail.side === "left"
                    ? { left: -7, top: tail.offset - 7, borderTopColor: "transparent", borderRightColor: "transparent" }
                    : tail.side === "right"
                      ? { right: -7, top: tail.offset - 7, borderBottomColor: "transparent", borderLeftColor: "transparent" }
                      : tail.side === "bottom"
                        ? { bottom: -7, left: tail.offset - 7, borderTopColor: "transparent", borderLeftColor: "transparent" }
                        : { top: -7, left: tail.offset - 7, borderBottomColor: "transparent", borderRightColor: "transparent" }
                }
              />
            )}
            {bubble}
          </div>
          {mascot && (
            <div
              className="pointer-events-none fixed left-0 top-0 z-(--z-bubble) transition-transform duration-(--duration-slow) ease-kenzo"
              style={{ transform: `translate(${mascot.x}px, ${mascot.y}px)` }}
            >
              <Mascot pose={mascot.pose} priority style={{ height: "var(--mascot-height)", width: "auto" }} />
            </div>
          )}
        </>
    </>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The phone guide. It sits in its own space at the bottom: the page gets
 * matching padding (--guide-strip-h), so the strip never covers what the
 * visitor just did. It rides above the on-screen keyboard.
 */
export function Strip({
  hint,
  onPrimary,
  onBack,
  busy,
  rect,
}: {
  hint: Hint;
  onPrimary: () => void;
  onBack?: () => void;
  busy: boolean;
  rect: Rect | null;
}) {
  const [more, setMore] = useState(false);
  const [lift, setLift] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  // Reserve the strip's height at the bottom of the page.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--guide-strip-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--guide-strip-h", "0px");
    };
  }, []);

  // Stay above the keyboard.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => setLift(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    on();
    vv.addEventListener("resize", on);
    vv.addEventListener("scroll", on);
    return () => {
      vv.removeEventListener("resize", on);
      vv.removeEventListener("scroll", on);
    };
  }, []);

  const pad = 6;
  return (
    <>
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-(--z-scrim) rounded-(--spotlight-radius) transition-all duration-(--duration-base) ease-kenzo"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 var(--spotlight-ring-width) var(--spotlight-ring), 0 0 0 8px color-mix(in srgb, var(--spotlight-ring) 25%, transparent)",
          }}
        />
      )}
      <div
        ref={ref}
        role={hint.thinking ? "status" : "dialog"}
        aria-label="Kenzo's tip"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-(--z-bubble) border-t-(length:--border-width-default) border-line-strong bg-surface px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-dock"
        style={{ transform: lift ? `translateY(${-lift}px)` : undefined }}
      >
        <div className="flex items-start gap-2.5">
          <span className="size-(--dock-avatar) shrink-0 overflow-hidden rounded-full border-strong border-accent bg-accent-soft">
            <Mascot pose="head" decorative className="mt-0.5 w-full" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 flex items-center gap-2 text-[15px] font-semibold leading-5">
              {hint.title}
              {hint.thinking && <i className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />}
            </p>
            {hint.body && (
              <p className={`m-0 mt-1 text-[13px] leading-[19px] text-fg-muted ${more ? "" : "line-clamp-2"}`}>{hint.body}</p>
            )}
            {hint.suggestion && (
              <span className="mt-2 inline-block rounded-control border-(length:--border-width-default) border-dashed border-accent-soft-line bg-accent-soft px-2.5 py-1 text-[13px] font-medium text-accent-pressed">
                Try: “{hint.suggestion}”
              </span>
            )}
          </div>
        </div>
        {!hint.thinking && (hint.body || hint.primary) && (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1">
              {hint.back && onBack && (
                <button type="button" onClick={onBack} className="min-h-10 rounded-control px-2 text-sm font-semibold text-fg-muted">
                  Back
                </button>
              )}
              {hint.body && (
                <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} className="min-h-10 rounded-control px-2 text-sm font-semibold text-fg-muted">
                  {more ? "Less" : "More"}
                </button>
              )}
            </span>
            {hint.primary ? (
              <button
                type="button"
                onClick={onPrimary}
                disabled={busy && hint.primary.action !== "restart"}
                className="min-h-10 rounded-control bg-accent px-4 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-50"
              >
                {hint.primary.label}
              </button>
            ) : (
              hint.waiting && <span className="text-sm text-fg-subtle">{hint.waiting}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

type Box = { left: number; top: number; right: number; bottom: number };

function overlap(a: Box, b: Box): number {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

function place(
  r: Rect,
  size: { w: number; h: number },
  vp: { w: number; h: number },
  pose: Hint["pose"],
): Layout {
  const pad = cssPx("--spotlight-padding", 8);
  const gap = 20;
  const edge = 16;

  const bw = size.w;
  const bh = size.h;
  const mh = cssPx("--mascot-height", 210);
  const mw = mh * 0.72;
  const centreY = r.top + r.height / 2;
  const clampY = (y: number) => Math.min(Math.max(y, edge), vp.h - bh - edge);

  let side: "right" | "left" | "below" | "above";
  let floating = false;
  let x: number;
  let y: number;
  const rightX = r.left + r.width + pad + gap;
  const leftX = r.left - pad - gap - bw;
  if (rightX + bw <= vp.w - edge) {
    side = "right";
    x = rightX;
    y = clampY(centreY - bh / 2);
  } else if (leftX >= edge) {
    side = "left";
    x = leftX;
    y = clampY(centreY - bh / 2);
  } else {
    // No room beside it: below if it fits, otherwise above.
    x = Math.min(Math.max(r.left + r.width / 2 - bw / 2, edge), vp.w - bw - edge);
    const belowY = r.top + r.height + pad + gap;
    const aboveY = r.top - pad - gap - bh;
    if (belowY + bh <= vp.h - edge) {
      side = "below";
      y = belowY;
    } else if (aboveY >= edge) {
      side = "above";
      y = aboveY;
    } else {
      // The target fills the screen. Sit wherever the bubble covers the
      // least of it, keeping clear of its top (titles live there).
      const hit = { left: r.left - pad, top: r.top - pad, right: r.left + r.width + pad, bottom: r.top + r.height + pad };
      const xs = [edge, vp.w - bw - edge, Math.min(Math.max(r.left + r.width + pad + gap, edge), vp.w - bw - edge)];
      const ys = [edge, vp.h - bh - edge];
      let best = Infinity;
      side = "above";
      y = vp.h - bh - edge;
      for (const cx of xs) {
        for (const cy of ys) {
          const box = { left: cx, top: cy, right: cx + bw, bottom: cy + bh };
          const covered = overlap(box, hit) + overlap(box, { ...hit, bottom: hit.top + 120 }) * 2;
          if (covered < best) {
            best = covered;
            x = cx;
            y = cy;
          }
        }
      }
      side = y + bh <= r.top ? "above" : "below";
      floating = true;
    }
  }

  const tailX = Math.min(Math.max(r.left + r.width / 2 - x, 20), bw - 20);
  const tail: Layout["tail"] = floating
    ? { side: "none", offset: 0 }
    : side === "below"
      ? { side: "top", offset: tailX }
      : side === "above"
        ? { side: "bottom", offset: tailX }
        : { side: side === "right" ? "left" : "right", offset: Math.min(Math.max(centreY - y, 20), bh - 20) };

  // Kenzo goes wherever he covers the least: never the target or the bubble,
  // and as little of the agent screen as possible.
  const bubbleRect = { left: x, top: y, right: x + bw, bottom: y + bh };
  const target = { left: r.left - pad, top: r.top - pad, right: r.left + r.width + pad, bottom: r.top + r.height + pad };
  const zoneEl = document.querySelector<HTMLElement>('[data-tour-zone="main"]');
  const zr = zoneEl?.getBoundingClientRect();
  const zone = zr ? { left: zr.left, top: zr.top, right: zr.right, bottom: zr.bottom } : null;
  const pointAt = (fromLeft: boolean): MascotPose =>
    pose === "point" ? (fromLeft ? "point-right" : "point-left") : pose;
  const besideY = Math.min(Math.max(centreY - mh * 0.5, edge), vp.h - mh - edge);
  const stackX = side === "left" ? x : x + bw - mw;
  const candidates: { x: number; y: number; pose: MascotPose }[] = [
    { x: target.left - gap - mw, y: besideY, pose: pointAt(true) },
    { x: target.right + gap, y: besideY, pose: pointAt(false) },
    { x: stackX, y: y - mh - 8, pose: pointAt(side === "left" || ((side === "below" || side === "above") && stackX < r.left)) },
    { x: stackX, y: y + bh + 8, pose: pointAt(side === "left" || ((side === "below" || side === "above") && stackX < r.left)) },
  ];
  let mascot: Layout["mascot"] = null;
  let best = Infinity;
  for (const c of candidates) {
    const box = { left: c.x, top: c.y, right: c.x + mw, bottom: c.y + mh };
    if (box.left < edge || box.top < edge || box.right > vp.w - edge || box.bottom > vp.h - edge) continue;
    const score =
      overlap(box, target) * 100 + overlap(box, bubbleRect) * 100 + (zone ? overlap(box, zone) : 0);
    if (score < best) {
      best = score;
      mascot = c;
    }
  }

  return { spot: r, bubble: { x, y }, tail, mascot };
}
