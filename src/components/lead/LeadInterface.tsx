"use client";

import { useState } from "react";
import { Mascot } from "@/components/mascot/Mascot";
import { labelFor, type ConversationState, type ThreadItem } from "@/lib/kenzo/useConversation";
import {
  MAX_MESSAGE_CHARS,
  type AnswerValue,
  type ConversationAction,
  type PublicQuestion,
  type Scalar,
} from "@/lib/kenzo/types";

export type LeadHandlers = {
  onAnswer: (metric: string, value: AnswerValue, label: string) => void;
  onText: (metric: string, message: string) => void;
  onAsk: (message: string) => void;
  onAction: (action: ConversationAction, metric: string) => void;
  onExplain: (metric: string) => void;
  onCloseWhy: () => void;
};

type Props = LeadHandlers & {
  state: ConversationState;
  reply: string;
  setReply: (v: string) => void;
  /** Pre-selected by the guide's "Pick for me"; sent only on Continue. */
  suggested?: AnswerValue | null;
  /** While the tour guides a choice, only these buttons are usable. */
  allowedActions?: ConversationAction[] | null;
};

/** The lead-facing Kenzo screen, as an agency's customer sees it. */
export function LeadInterface(props: Props) {
  const { state } = props;
  const [asking, setAsking] = useState(false);
  const index = state.questions.findIndex((q) => q.metric === state.stepMetric);
  const question = index >= 0 ? state.questions[index] : undefined;
  const site = `${slug(state.agencyName) || "agency"}.co.uk/book`;

  return (
    <section
      aria-label={`${state.agencyName || "Agency"} booking`}
      className="relative z-(--z-frame) mx-auto flex w-full max-w-(--frame-max-width) flex-1 flex-col bg-surface md:min-h-[640px] md:flex-none md:rounded-frame md:border-default md:shadow-frame"
    >
      {/* Browser chrome (larger screens only) */}
      <div className="hidden h-10 items-center gap-2 rounded-t-frame border-b-(length:--border-width-default) border-line bg-surface-muted px-4 md:flex" aria-hidden="true">
        <i className="size-2.5 rounded-full bg-line-strong" />
        <i className="size-2.5 rounded-full bg-line-strong" />
        <i className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-4 rounded-control border-default bg-surface px-3.5 py-1 text-xs text-fg-muted">{site}</span>
      </div>

      {/* Agency header */}
      <header className="flex h-14 items-center gap-3 border-b-(length:--border-width-default) border-line px-4 md:px-6">
        <span aria-hidden="true" className="size-7 rounded-md bg-line-strong" />
        <span className="flex-1 truncate font-semibold">{state.agencyName || "Agency"}</span>
        <button
          type="button"
          data-tour="ask"
          onClick={() => setAsking(true)}
          disabled={!question}
          className="min-h-10 rounded-control border-control px-4 text-sm font-semibold transition hover:bg-surface-muted disabled:opacity-40 md:hidden"
        >
          Ask Kenzo
        </button>
      </header>

      {/* Progress (phones) */}
      {state.questions.length > 0 && (
        <div className="flex items-center gap-1 border-b-(length:--border-width-default) border-line px-4 py-3 md:hidden" aria-label="Progress">
          {state.questions.map((q, i) => (
            <i key={q.metric} className={`h-1 flex-1 rounded-control ${i <= index || state.outcome ? "bg-progress" : "bg-progress-track"}`} />
          ))}
          <span className="ml-2 text-xs tabular-nums text-fg-subtle">
            {Math.max(index + 1, 1)} of {state.questions.length}
          </span>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <StepList state={state} index={index} onAsk={() => setAsking(true)} />

        <main data-tour-zone="main" className="flex flex-1 justify-center overflow-y-auto px-4 py-6 md:items-center md:px-10 md:py-8">
          <div className="flex w-full max-w-(--question-column) flex-col gap-3">
            {state.outcome ? (
              <OutcomeCard text={state.outcome.text} kind={state.outcome.kind} />
            ) : question ? (
              <QuestionStep
                key={`${question.metric}:${JSON.stringify(props.suggested ?? null)}`}
                {...props}
                question={question}
                index={index}
                total={state.questions.length}
                asking={asking}
                setAsking={setAsking}
              />
            ) : (
              <Loading />
            )}
          </div>
        </main>
      </div>

      {state.view?.pending_correction && !state.outcome && (
        <CorrectionPopup {...props} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function StepList({ state, index, onAsk }: { state: ConversationState; index: number; onAsk: () => void }) {
  return (
    <aside className="hidden w-(--step-list-width) shrink-0 flex-col gap-4 rounded-bl-frame border-r-(length:--border-width-default) border-line bg-surface-muted p-5 md:flex">
      <div className="flex items-center gap-3">
        <Avatar size="lg" />
        <div className="min-w-0">
          <div className="font-semibold">Kenzo</div>
          <div className="truncate text-sm text-fg-subtle">{state.agencyName}&apos;s AI assistant</div>
        </div>
      </div>
      <ol className="flex flex-col">
        {state.questions.map((q, i) => {
          const done = Boolean(state.answers[q.metric]) || i < index || Boolean(state.outcome);
          const current = i === index && !state.outcome;
          return (
            <li key={q.metric} className="flex min-h-13 items-center gap-3 border-t-(length:--border-width-default) border-line py-2 text-sm last:border-b-(length:--border-width-default)">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                  done ? "bg-accent text-accent-fg" : current ? "border-strong border-accent text-accent-pressed" : "border-control text-fg-subtle"
                }`}
                aria-label={done ? "Done" : current ? "Current" : "Not yet"}
              >
                {done ? <Check /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={`block truncate ${current || done ? "font-semibold" : "text-fg-muted"}`}>{shortTitle(q.question)}</span>
                {state.answers[q.metric] && <span className="block truncate text-xs text-fg-subtle">{state.answers[q.metric]}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        data-tour="ask"
        onClick={onAsk}
        disabled={index < 0 || Boolean(state.outcome)}
        className="mt-auto min-h-11 w-full rounded-button border-control bg-surface text-sm font-semibold transition hover:bg-surface-muted disabled:opacity-40"
      >
        Ask Kenzo
      </button>
    </aside>
  );
}

/* ------------------------------------------------------------------ */

function QuestionStep(
  props: Props & {
    question: PublicQuestion;
    index: number;
    total: number;
    asking: boolean;
    setAsking: (v: boolean) => void;
  },
) {
  const { state, question, reply, setReply } = props;
  const suggested = props.suggested ?? null;
  const multi = question.answer_type === "multi_choice";
  const [picked, setPicked] = useState<Scalar[]>(() =>
    multi && Array.isArray(suggested) ? suggested : [],
  );
  const [askText, setAskText] = useState("");
  const [numberText, setNumberText] = useState("");
  const busy = state.busy;
  const view = state.view;
  const pursuitStage =
    view?.active_pursuit?.metric === question.metric ? view.active_pursuit.stage : null;
  // Options are hidden during a pursuit; the reply box only while it's offered.
  const pursuitOpen = pursuitStage !== null;
  const replyHidden = pursuitStage === "offered";
  // A value Kenzo read or pre-filled is shown with a one-tap confirm.
  const confirming = state.prefill !== null;

  const options: { label: string; value: Scalar }[] =
    question.options.length > 0
      ? question.options
      : question.answer_type === "boolean"
        ? [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ]
        : [];

  const lastKenzo = [...state.thread].reverse().find((t) => t.from === "kenzo");

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    const text = reply.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text || busy) return;
    props.onText(question.metric, text);
    setReply("");
  };

  const submitAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const text = askText.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text || busy) return;
    props.onAsk(text);
    setAskText("");
    props.setAsking(false);
  };

  const pick = (value: Scalar) => {
    if (busy) return;
    if (multi) {
      setPicked((p) => (p.includes(value) ? p.filter((v) => v !== value) : [...p, value]));
      return;
    }
    props.onAnswer(question.metric, value, labelFor(question, value));
  };

  return (
    <>
      <span className="text-sm tabular-nums text-fg-subtle">
        Step {props.index + 1} of {props.total}
      </span>
      {props.index === 0 && (
        <div className="flex items-center gap-2.5">
          <Avatar />
          <span className="text-fg-muted">Hi, I&apos;m Kenzo, {state.agencyName}&apos;s AI assistant.</span>
        </div>
      )}
      <h1 className="m-0 font-display text-[22px] font-medium leading-snug md:text-[28px] md:leading-9">{question.question}</h1>

      {question.why_we_ask && (
        <div>
          <button
            type="button"
            onClick={() => (state.whyOpen ? props.onCloseWhy() : props.onExplain(question.metric))}
            className="min-h-10 text-sm text-link underline underline-offset-4"
            aria-expanded={state.whyOpen}
          >
            Why do I ask?
          </button>
          {state.whyOpen && (
            <p className="m-0 mt-1 rounded-card bg-surface-muted p-4 text-sm leading-relaxed text-fg-muted">{question.why_we_ask}</p>
          )}
        </div>
      )}

      {/* What happened on this step */}
      {state.thread.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {state.thread.map((item) => (
            <ThreadEntry
              key={item.id}
              item={item}
              isLast={item === lastKenzo}
              busy={busy}
              allowed={props.allowedActions ?? null}
              onChoice={(action) => item.from === "kenzo" && item.metric && props.onAction(action, item.metric)}
            />
          ))}
        </div>
      )}
      {busy && <Typing />}

      {/* Confirm a value Kenzo read or pre-filled */}
      {confirming && state.prefill !== null && !pursuitOpen && (
        <div data-tour="confirm" className="flex flex-wrap items-center gap-3 rounded-card border-default bg-surface p-4">
          <span className="flex-1 font-semibold">{labelFor(question, state.prefill)}</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => props.onAnswer(question.metric, state.prefill as AnswerValue, labelFor(question, state.prefill as AnswerValue))}
            className="min-h-11 rounded-button bg-accent px-5 font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-50"
          >
            Yes, that&apos;s right
          </button>
        </div>
      )}

      {/* Options */}
      {options.length > 0 && !pursuitOpen && (
        <fieldset data-tour="options" className={`m-0 grid gap-2.5 border-0 p-0 ${options.length > 2 ? "md:grid-cols-2" : ""}`}>
          <legend className="sr-only">{question.question}</legend>
          {options.map((o) => {
            const selected =
              picked.includes(o.value) ||
              (!multi && suggested === o.value) ||
              (state.prefill !== null && (Array.isArray(state.prefill) ? state.prefill.includes(o.value) : state.prefill === o.value));
            return (
              <button
                key={String(o.value)}
                type="button"
                disabled={busy}
                aria-pressed={selected}
                onClick={() => pick(o.value)}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-button px-4 text-left shadow-option transition duration-(--duration-fast) ease-kenzo hover:shadow-option-hover disabled:opacity-60 ${
                  selected ? "border-strong border-accent bg-accent-soft font-semibold" : "border-control bg-surface hover:border-accent"
                }`}
              >
                <span>{o.label}</span>
                <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-full ${selected ? "bg-accent text-accent-fg" : "border-control"}`} aria-hidden="true">
                  {selected && <Check small />}
                </span>
              </button>
            );
          })}
          {!multi && suggested !== null && !Array.isArray(suggested) && (
            <button
              type="button"
              data-tour="continue"
              disabled={busy}
              onClick={() => props.onAnswer(question.metric, suggested, labelFor(question, suggested))}
              className="min-h-12 rounded-button bg-accent px-5 font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-40 md:col-span-2"
            >
              Continue with {labelFor(question, suggested)}
            </button>
          )}
          {multi && (
            <button
              type="button"
              data-tour={suggested !== null ? "continue" : undefined}
              disabled={busy || picked.length === 0}
              onClick={() => props.onAnswer(question.metric, picked, labelFor(question, picked))}
              className="min-h-12 rounded-button bg-accent px-5 font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-40 md:col-span-2"
            >
              Continue
            </button>
          )}
        </fieldset>
      )}

      {/* A number with no options and no free text */}
      {question.answer_type === "number" && options.length === 0 && !question.allows_text && !pursuitOpen && (
        <form
          className="flex gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(numberText);
            if (numberText.trim() === "" || !Number.isFinite(n) || busy) return;
            props.onAnswer(question.metric, n, numberText);
          }}
        >
          <label className="flex-1">
            <span className="sr-only">{question.question}</span>
            <input inputMode="decimal" value={numberText} onChange={(e) => setNumberText(e.target.value)} className="h-13 w-full rounded-control border-control bg-surface px-5 text-base" />
          </label>
          <SendButton disabled={busy} />
        </form>
      )}

      {/* "Or just tell me" */}
      {(question.allows_text || question.answer_type === "text") && !replyHidden && (
        <form data-tour="reply" onSubmit={submitReply} className="mt-1 flex items-center gap-2.5">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Reply to Kenzo</span>
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={MAX_MESSAGE_CHARS}
              disabled={busy}
              placeholder={pursuitStage === "pursuing" ? "Reply to Kenzo…" : options.length ? "Or just tell me…" : "Type your answer…"}
              className="h-13 w-full rounded-control border-control bg-surface px-5 text-base placeholder:text-fg-subtle disabled:opacity-60"
            />
          </label>
          <SendButton disabled={busy || !reply.trim()} />
        </form>
      )}

      {/* Ask Kenzo anything */}
      {props.asking && (
        <form onSubmit={submitAsk} className="flex flex-col gap-2 rounded-card border-default bg-surface-muted p-3">
          <label className="text-sm font-semibold" htmlFor="ask-kenzo">
            Ask Kenzo anything
          </label>
          <div className="flex items-center gap-2.5">
            <input
              id="ask-kenzo"
              autoFocus
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              maxLength={MAX_MESSAGE_CHARS}
              placeholder="e.g. Do you work with clinics?"
              className="h-12 min-w-0 flex-1 rounded-control border-control bg-surface px-4 text-base"
            />
            <SendButton disabled={busy || !askText.trim()} />
          </div>
          <button type="button" onClick={() => props.setAsking(false)} className="self-start text-sm text-fg-muted underline underline-offset-4">
            Cancel
          </button>
        </form>
      )}

      {state.error && (
        <p role="alert" className="m-0 rounded-card bg-danger-bg p-3 text-sm text-danger-fg">
          That didn&apos;t go through. Please try again.
        </p>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function ThreadEntry({
  item,
  isLast,
  busy,
  allowed,
  onChoice,
}: {
  item: ThreadItem;
  isLast: boolean;
  busy: boolean;
  allowed: ConversationAction[] | null;
  onChoice: (action: ConversationAction) => void;
}) {
  if (item.from === "lead") {
    return (
      <div className="max-w-[85%] self-end rounded-card rounded-br-tail bg-lead-bubble px-4 py-2.5 text-lead-bubble-fg">
        {item.text}
      </div>
    );
  }
  const warning = item.tone === "warning";
  const isPursuit = item.kind === "pursuit_offer" || item.kind === "pursuit_choices";
  return (
    <div
      data-tour={isLast ? "thread-last" : undefined}
      className={`flex flex-col gap-3 rounded-card p-4 ${warning ? "bg-notice-bg text-notice-fg" : "border-(length:--border-width-default) border-answer-line bg-answer"}`}
    >
      {item.text && (
        <div className="flex items-start gap-2.5">
          <Avatar />
          <p className="m-0 leading-relaxed">{item.text}</p>
        </div>
      )}
      {item.choices && item.choices.length > 0 && (
        <div data-tour={isPursuit ? "pursuit" : undefined} className="flex flex-wrap gap-2.5">
          {item.choices.map((c, i) => (
            <button
              key={c.action}
              type="button"
              disabled={busy || (allowed !== null && !allowed.includes(c.action))}
              title={allowed !== null && !allowed.includes(c.action) ? "Not part of this tour" : undefined}
              onClick={() => onChoice(c.action)}
              className={`min-h-12 rounded-button px-5 font-semibold transition disabled:opacity-50 ${
                i === 0 ? "bg-accent text-accent-fg hover:bg-accent-hover" : "border-control bg-surface hover:bg-surface-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CorrectionPopup({ state, onAction }: Props) {
  const held = state.view!.pending_correction!;
  const q = state.questions.find((x) => x.metric === held.metric);
  return (
    <div className="absolute inset-0 z-(--z-popup) flex items-center justify-center bg-inverse/30 p-4 md:rounded-frame">
      <div data-tour="correction" role="dialog" aria-modal="true" aria-labelledby="correction-title" className="flex w-full max-w-sm flex-col gap-4 rounded-card bg-surface p-5 shadow-bubble">
        <h2 id="correction-title" className="m-0 text-lg font-semibold">
          Change your answer?
        </h2>
        <p className="m-0 text-fg-muted">
          {q ? shortTitle(q.question) : "Earlier answer"}: <strong className="text-fg">{labelFor(q, held.value)}</strong>
        </p>
        <div className="flex gap-2.5">
          <button type="button" disabled={state.busy} onClick={() => onAction("apply_correction", held.metric)} className="min-h-11 flex-1 rounded-button bg-accent font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-50">
            Update
          </button>
          <button type="button" disabled={state.busy} onClick={() => onAction("keep_answer", held.metric)} className="min-h-11 flex-1 rounded-button border-control bg-surface font-semibold hover:bg-surface-muted disabled:opacity-50">
            Keep
          </button>
        </div>
      </div>
    </div>
  );
}

function OutcomeCard({ text, kind }: { text: string | null; kind: "handoff" | "ended" }) {
  return (
    <div data-tour="outcome" className="flex flex-col items-center gap-4 rounded-card bg-surface-muted p-8 text-center">
      <Mascot pose={kind === "handoff" ? "phone" : "head"} decorative className="w-28" />
      {text && <p className="m-0 max-w-sm text-lg leading-relaxed">{text}</p>}
      {kind === "handoff" && (
        <span className="rounded-control bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-pressed">Booking comes next</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Avatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "size-11" : "size-8";
  return (
    <span className={`${cls} shrink-0 overflow-hidden rounded-full border-(length:--border-width-default) border-answer-line bg-accent-soft`} aria-hidden="true">
      <Mascot pose="head" decorative className="mt-0.5 w-full" />
    </span>
  );
}

function SendButton({ disabled }: { disabled: boolean }) {
  return (
    <button type="submit" disabled={disabled} aria-label="Send" className="flex size-13 shrink-0 items-center justify-center rounded-control bg-accent text-accent-fg transition hover:bg-accent-hover disabled:opacity-40">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </button>
  );
}

function Check({ small = false }: { small?: boolean }) {
  const s = small ? 12 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-1.5 self-start rounded-card bg-surface-muted px-4 py-3" role="status" aria-label="Kenzo is typing">
      {[0, 1, 2].map((i) => (
        <i key={i} className="size-1.5 animate-pulse rounded-full bg-fg-subtle" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <div className="h-4 w-24 animate-pulse rounded bg-line" />
      <div className="h-9 w-3/4 animate-pulse rounded bg-line" />
      <div className="h-14 w-full animate-pulse rounded-button bg-line" />
      <div className="h-14 w-full animate-pulse rounded-button bg-line" />
    </div>
  );
}

function shortTitle(question: string): string {
  return question.length > 38 ? `${question.slice(0, 36).trimEnd()}…` : question;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
