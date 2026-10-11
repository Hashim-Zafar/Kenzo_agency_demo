"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LeadInterface } from "@/components/lead/LeadInterface";
import { BookingScreen } from "@/components/sim/BookingScreen";
import { ConfirmationScene } from "@/components/sim/ConfirmationScene";
import { RemindersScene } from "@/components/sim/RemindersScene";
import { Guide } from "@/components/tour/Guide";
import { useConversation } from "@/lib/kenzo/useConversation";
import type { AnswerValue, ConversationAction, Interaction } from "@/lib/kenzo/types";
import { bookingDays, freeTimes, type Booking, type Day } from "@/lib/sim/booking";
import { deriveHint, simHint, type SimStage } from "@/lib/tour/hints";
import { stepScript } from "@/lib/tour/demo-agency";

/** Tips that show even with the guide hidden. */
const ALWAYS = new Set(["intro", "handoff", "ended", "limit", "error"]);

type Stage = "agent" | SimStage;

/** The customer's side: the live Kenzo, then booking, the confirmation email
 *  and the reminders (simulated), with Kenzo the guide on top. */
export function Walkthrough() {
  const router = useRouter();
  const { state, start, send, explain, closeWhy } = useConversation();
  const [stage, setStage] = useState<Stage>("agent");
  const [reply, setReply] = useState("");
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(() => new Set());
  const [guideOn, setGuideOn] = useState(true);
  // What "Pick for me" selected; shown, never sent until the visitor presses Continue.
  const [suggestion, setSuggestion] = useState<{ metric: string; value: AnswerValue } | null>(null);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated booking
  const [day, setDay] = useState<Day | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [booking_busy, setBookingBusy] = useState(false);
  const [remindersDone, setRemindersDone] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  const agencyName = state.agencyName || "Fernley";
  const suggested =
    suggestion && suggestion.metric === state.stepMetric ? suggestion.value : null;
  const hint =
    stage === "agent"
      ? deriveHint(state, { dismissed, suggested, reply })
      : simHint(stage, { hasDay: day !== null, hasTime: time !== null, remindersDone });

  const stopTyping = () => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    typingTimer.current = null;
  };
  useEffect(() => stopTyping, []);

  const act = useCallback(
    (interaction: Interaction, opts?: { echo?: string; label?: string }) => {
      stopTyping();
      setSuggestion(null);
      void send(interaction, opts);
    },
    [send],
  );

  const restart = useCallback(() => {
    stopTyping();
    setStage("agent");
    setDismissed(new Set());
    setSuggestion(null);
    setReply("");
    setDay(null);
    setTime(null);
    setBooking(null);
    setRemindersDone(false);
    void start();
  }, [start]);

  const confirmBooking = (b: Booking) => {
    setBookingBusy(true);
    setTimeout(() => {
      setBooking(b);
      setBookingBusy(false);
      setStage("confirmation");
    }, 700);
  };

  const onPrimary = () => {
    if (!hint?.primary) return;
    const question = state.questions.find((q) => q.metric === state.stepMetric);
    switch (hint.primary.action) {
      case "start":
        void start();
        break;
      case "restart":
        restart();
        break;
      case "dismiss":
        setDismissed((d) => new Set(d).add(hint.id));
        break;
      case "next":
        if (stage === "agent") setStage("booking");
        else if (stage === "confirmation") {
          setRemindersDone(false);
          setPlayKey((k) => k + 1);
          setStage("reminders");
        }
        break;
      case "toAgency":
        router.push("/tour/agency");
        break;
      case "pickForMe": {
        if (stage === "booking") {
          // Select only; the visitor still presses Book.
          if (!day) {
            const first = bookingDays().find((d) => !d.weekend && freeTimes(d.key).length > 0);
            if (first) setDay(first);
          } else if (!time) {
            const t = freeTimes(day.key)[0];
            if (t) setTime(t);
          }
          return;
        }
        if (!question) return;
        const scripted = stepScript(question.metric)?.pickValue;
        const first =
          question.options[0]?.value ?? (question.answer_type === "boolean" ? true : null);
        const pick = scripted ?? first;
        if (pick === null || pick === undefined) return;
        const multi = question.answer_type === "multi_choice";
        const value: AnswerValue = multi ? (Array.isArray(pick) ? pick : [pick]) : Array.isArray(pick) ? pick[0] : pick;
        setSuggestion({ metric: question.metric, value });
        break;
      }
      case "typeForMe": {
        const text = hint.suggestion;
        if (!question || !text || typingTimer.current) return;
        // Typed out letter by letter so it's clearly an ordinary message.
        // It is NOT sent: the visitor presses send themselves.
        let i = 0;
        setReply("");
        typingTimer.current = setInterval(() => {
          i += 1;
          setReply(text.slice(0, i));
          if (i >= text.length) stopTyping();
        }, 40);
        break;
      }
    }
  };

  const showGuide = hint && (guideOn || ALWAYS.has(hint.id));

  return (
    <div className="flex min-h-dvh flex-col bg-page text-fg">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b-(length:--border-width-default) border-line bg-page px-4 py-3 md:px-10">
        <Link href="/" className="font-display text-lg font-semibold text-brand md:text-xl">
          Kenzo
        </Link>
        <nav aria-label="Whose view" className="order-3 flex w-full gap-1 rounded-control border-(length:--border-width-default) border-line-strong bg-surface p-1 md:order-none md:w-auto">
          <span aria-current="page" className="flex min-h-9 flex-1 items-center justify-center rounded-control bg-accent-soft px-4 text-sm font-semibold text-accent-pressed md:flex-none">
            Your customer&apos;s view
          </span>
          <Link href="/tour/agency" className="flex min-h-9 flex-1 items-center justify-center rounded-control px-4 text-sm font-semibold text-fg-muted hover:bg-surface-muted md:flex-none">
            Your view
          </Link>
        </nav>
        <span className="flex-1" />
        {(state.phase !== "idle" || stage !== "agent") && (
          <>
            <button type="button" onClick={() => setGuideOn((v) => !v)} className="min-h-10 rounded-control px-3 text-sm font-semibold text-fg-muted hover:bg-surface-muted">
              {guideOn ? "Hide guide" : "Show guide"}
            </button>
            <button type="button" onClick={restart} className="min-h-10 rounded-control px-3 text-sm font-semibold text-fg-muted hover:bg-surface-muted">
              Start again
            </button>
          </>
        )}
      </header>

      <div className="flex flex-1 flex-col md:items-center md:justify-center md:p-8">
        {stage === "agent" && (
          <LeadInterface
            state={state}
            reply={reply}
            setReply={(v) => {
              stopTyping();
              setReply(v);
            }}
            suggested={suggested}
            allowedActions={showGuide ? (hint?.allowedActions ?? null) : null}
            onAnswer={(metric, value, label) => act({ type: "structured_answer", metric, value }, { label })}
            onText={(metric, message) => act({ type: "metric_text", metric, message }, { echo: message })}
            onAsk={(message) => act({ type: "ask_kenzo", message }, { echo: message })}
            onAction={(action: ConversationAction, metric) => act({ type: "action", action, metric })}
            onExplain={explain}
            onCloseWhy={closeWhy}
          />
        )}
        {stage === "booking" && (
          <BookingScreen
            agencyName={agencyName}
            day={day}
            time={time}
            busy={booking_busy}
            onDay={(d) => {
              setDay(d);
              setTime(null);
            }}
            onTime={setTime}
            onConfirm={confirmBooking}
          />
        )}
        {stage === "confirmation" && booking && <ConfirmationScene agencyName={agencyName} booking={booking} />}
        {stage === "reminders" && booking && (
          <RemindersScene agencyName={agencyName} booking={booking} playKey={playKey} onDone={() => setRemindersDone(true)} />
        )}
      </div>

      {showGuide && <Guide key={hint.id} hint={hint} onPrimary={onPrimary} busy={state.busy || booking_busy} />}
    </div>
  );
}
