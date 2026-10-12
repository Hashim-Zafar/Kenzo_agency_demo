import type { ConversationState } from "@/lib/kenzo/useConversation";
import { labelFor } from "@/lib/kenzo/useConversation";
import type { AnswerValue, ConversationAction, PublicQuestion } from "@/lib/kenzo/types";
import type { MascotPose } from "@/components/mascot/Mascot";

/** What the guide does when its button is pressed. */
export type HintAction = "start" | "dismiss" | "pickForMe" | "typeForMe" | "restart" | "next" | "toAgency";

export type Hint = {
  /** Unique per moment; the guide re-aims when it changes. */
  id: string;
  /** data-tour value(s) to spotlight ("a|b" = both); null = centred card. */
  target: string | null;
  /** "point" = Kenzo points toward the target from whichever side he's on. */
  pose: MascotPose | "point";
  title: string;
  body?: string;
  /** Typed into the reply box by "Type it for me" (never sent for them). */
  suggestion?: string;
  waiting?: string;
  primary?: { label: string; action: HintAction };
  /** Only these choice buttons are usable while this tip is up. */
  allowedActions?: ConversationAction[];
  /** A turn is in flight: show only "Kenzo is thinking", nothing to press. */
  thinking?: boolean;
  /** Small label above the title (defaults to "Your customer's view"). */
  eyebrow?: string;
  /** Show a Back button next to the primary one. */
  back?: boolean;
};

export type HintContext = {
  /** Reaction tips the visitor closed with "Got it". */
  dismissed: ReadonlySet<string>;
  /** What "Pick for me" selected on the step on screen (not sent yet). */
  suggested: AnswerValue | null;
  /** What's in the reply box right now. */
  reply: string;
};

const TYPE_FOR_ME = { label: "Type it for me", action: "typeForMe" } as const;
const PICK_FOR_ME = { label: "Pick for me", action: "pickForMe" } as const;

/**
 * One guide per moment, worked out ONLY from what the Kenzo API returned:
 * the questions (type and options), the reply blocks and the conversation
 * view. There is no per-question script: no metric names, thresholds or
 * amounts live here, so changing the agency's config in the database never
 * puts the tour out of step with what's on screen.
 *
 * Order of precedence:
 *   1. the conversation's own moments (intro, ending, limits, errors)
 *   2. a turn in flight: only "Kenzo is thinking", never yesterday's tip
 *   3. what the API is waiting on: a correction, open choice buttons,
 *      talking it through, confirming a value
 *   4. a reaction to the last reply (an answer, a warning) until "Got it"
 *   5. the step itself: the script on a fresh step, plain help after that
 */
export function deriveHint(s: ConversationState, ctx: HintContext): Hint | null {
  /* ---- 1. the conversation's own moments ---- */
  if (s.phase === "idle") {
    return {
      id: "intro",
      target: null,
      pose: "present",
      title: "You're the customer now",
      body: "This is the live Kenzo, not a recording. I'll walk you through every step and show you how each one helps your agency.",
      primary: { label: "Start", action: "start" },
    };
  }
  if (s.phase === "starting") return THINKING;
  if (s.phase === "limit") {
    return {
      id: "limit",
      target: null,
      pose: "thinking",
      title: "That's the demo limit",
      body: "Each demo conversation is capped so it stays fast for everyone. Start again to try a different path.",
      primary: { label: "Start again", action: "restart" },
    };
  }
  if (s.phase === "error") {
    return {
      id: "error",
      target: null,
      pose: "thinking",
      title: "I can't reach Kenzo right now",
      body: "The demo couldn't connect. Please try again in a moment.",
      primary: { label: "Try again", action: "restart" },
    };
  }
  if (s.busy) return THINKING;
  if (s.outcome?.kind === "handoff") {
    return {
      id: "handoff",
      target: "outcome",
      pose: "celebrate",
      title: s.view?.lead_status === "warm" ? "A warm lead, straight to booking" : "Qualified, straight to booking",
      body: "A good-fit lead goes straight on to pick a time. No back-and-forth emails, and you never chase a form.",
      primary: { label: "Next: booking", action: "next" },
    };
  }
  if (s.outcome?.kind === "ended") {
    const notFit = s.view?.lead_status === "unqualified";
    return {
      id: "ended",
      target: "outcome",
      pose: "thinking",
      title: notFit ? "Not a fit, handled kindly" : "Conversation closed",
      body: notFit
        ? "They kept an answer that's outside what you want, so Kenzo thanks them politely and nothing lands in your calendar. A good-fit lead goes straight to booking: here's what they see."
        : "Kenzo closes conversations that stop making sense, so your team's time is protected. Here's what a good-fit lead sees next.",
      primary: { label: "Next: booking", action: "next" },
    };
  }

  const view = s.view;
  const metric = s.stepMetric;
  const question = s.questions.find((q) => q.metric === metric);
  if (!question || !metric) return null;
  const lastCodes = new Set(s.last.blocks.map((b) => b.code));
  const lastKinds = new Set(s.last.blocks.map((b) => b.kind));

  /* ---- 3. what the API is waiting on ---- */
  if (view?.pending_correction) {
    return {
      id: `correction:${s.turnNo}`,
      target: "correction",
      pose: "thinking",
      title: "They changed an earlier answer",
      body: "Kenzo never overwrites an answer on its own. It asks first, then re-checks the fit.",
      waiting: "Update or keep: your call",
    };
  }

  // Buttons the API sent and that can still be pressed (only the latest
  // reply keeps its buttons, so these always match what's on screen).
  const open = [...s.thread].reverse().find((t) => t.from === "kenzo" && t.choices?.length);
  const choices = open && open.from === "kenzo" ? (open.choices ?? []) : [];
  const offered = (a: ConversationAction) => choices.some((c) => c.action === a);

  if (open && open.from === "kenzo" && open.kind === "pursuit_offer") {
    const talk = choices.find((c) => c.action === "accept_pursuit")?.label;
    return {
      id: `offer:${metric}:${s.turnNo}`,
      target: "pursuit",
      pose: "present",
      title: "Below your floor, but not turned away",
      body: "Instead of a flat no, Kenzo offers to talk it through. Leads you'd have lost to a form get a second chance, and nobody is pushed: either button is fine.",
      waiting: talk ? `Try “${talk}”` : "Your call",
    };
  }
  if (open && open.from === "kenzo" && open.kind === "pursuit_choices") {
    return {
      id: `pitch:${metric}:${s.turnNo}`,
      target: "pursuit",
      pose: "present",
      title: "Now Kenzo makes your case",
      body: offered("pursuit_accept_alternative")
        ? "It argues from offers and facts you've set up, never invented ones, and offers your smaller package as a middle ground. The lead decides."
        : "It argues from offers and facts you've set up, never invented ones. The lead decides: take your number, or keep theirs.",
      waiting: "Your call",
    };
  }
  if (open) {
    return {
      id: `choices:${metric}:${s.turnNo}`,
      target: "thread-last",
      pose: "point",
      title: "Kenzo needs a quick answer",
      body: "One tap and the conversation carries on.",
      waiting: "Pick one",
    };
  }

  const pursuit = view?.active_pursuit?.metric === metric ? view.active_pursuit : null;
  if (pursuit?.stage === "pursuing") {
    const typed = ctx.reply.trim().length > 0;
    if (typed) return sendHint(`pursuing:${metric}:${s.turnNo}:typed`);
    // Something a lead might say; never a number, so it fits any config.
    const said = s.thread.filter((t) => t.from === "lead").length;
    const sayNext = PURSUIT_REPLIES[Math.max(0, said - 1)];
    const opener = lastCodes.has("pursuit_opener");
    return {
      id: `pursuing:${metric}:${s.turnNo}`,
      target: "reply",
      pose: opener ? "point" : "thinking",
      title: opener ? "Kenzo asks before it pitches" : "Kenzo listens first",
      body: opener
        ? "That opening question is yours, written in your settings. No sales pitch until the lead has said what's holding them back."
        : "It answers their point from your own facts, without pushing. When the moment's right, it makes your case.",
      suggestion: sayNext,
      waiting: "Reply in your own words",
      primary: sayNext ? TYPE_FOR_ME : undefined,
    };
  }

  if (s.prefill !== null) {
    return {
      id: `confirm:${metric}:${s.turnNo}`,
      target: "confirm",
      pose: "point",
      title: "Kenzo checks before saving",
      body: "When a typed answer could be read more than one way, it asks once instead of guessing. Your data stays clean.",
      waiting: "Confirm it, or pick another answer",
    };
  }

  /* ---- 4. a reaction to the last reply ---- */
  const warned = s.last.blocks.some((b) => b.tone === "warning");
  const warnId = `warning:${s.turnNo}`;
  if (warned && !ctx.dismissed.has(warnId)) {
    return {
      id: warnId,
      target: s.last.sent === "ask_kenzo" ? "ask-last" : "thread-last",
      pose: "thinking",
      title: "Kenzo stays on track",
      body: "Off-topic or manipulative messages get a short, fixed reply. Nothing the lead typed is repeated back.",
      primary: { label: "Got it", action: "dismiss" },
    };
  }
  const asked = s.last.sent === "ask_kenzo" && s.asks.at(-1)?.status === "answered";
  const askedId = `asked:${s.turnNo}`;
  if (asked && !ctx.dismissed.has(askedId)) {
    return {
      id: askedId,
      target: "ask-last",
      pose: "thinking",
      title: "Answered from your documents",
      body: "Kenzo answers from what you've shared, nothing made up, and the lead's place in the questions is kept.",
      primary: { label: "Got it", action: "dismiss" },
    };
  }
  const replied =
    s.last.sent === "metric_text" && (lastKinds.has("generated") || lastKinds.has("message")) && !lastKinds.has("show_step");
  const repliedId = `replied:${s.turnNo}`;
  if (replied && !ctx.dismissed.has(repliedId)) {
    return {
      id: repliedId,
      target: "thread-last",
      pose: "thinking",
      title: "Kenzo replied instead of guessing",
      body: "When a message isn't a clear answer, Kenzo responds and keeps the lead on this step. Nothing is saved until it's sure.",
      primary: { label: "Got it", action: "dismiss" },
    };
  }

  /* ---- 5. the step itself ---- */
  // Once the visitor has done something on this step and the API kept them
  // here, the script's suggestion no longer applies: just help them answer.
  const touched = s.thread.length > 0 || (s.last.rejected && s.last.sent !== "ask_kenzo");
  if (touched) return plainStepHint(question, `step:${metric}:again:${s.turnNo}`, ctx);

  // Once, from the third question on: show that leads can ask anything.
  const index = s.questions.indexOf(question);
  if (index >= 2 && s.asks.length === 0 && !ctx.dismissed.has(ASK_TIP)) {
    return {
      id: `${ASK_TIP}:${metric}`,
      target: "ask",
      pose: "present",
      title: "Leads can ask anything, mid-flow",
      body: "“Ask Kenzo” answers from your own documents and keeps their place in the questions. Questions get answered before the call, so your team doesn't spend it on basics. Try it, or skip ahead.",
      primary: { label: "Skip", action: "dismiss" },
    };
  }
  return stepHint(question, ctx);
}

/** Dismissing the Ask Kenzo tip is remembered under this id. */
export const ASK_TIP = "ask-tip";

/** Replies a lead might give while talking it through. No numbers on purpose. */
const PURSUIT_REPLIES = ["Mostly cash flow, it's tight at the moment", "What would I actually get for the extra?"];

/** Options whose values are all numbers (budget bands and the like). */
export function numericOptions(q: PublicQuestion): number[] | null {
  if (q.options.length === 0 || !q.options.every((o) => typeof o.value === "number")) return null;
  return q.options.map((o) => o.value as number);
}

/**
 * What "Type it for me" types on a numeric question: an amount a little under
 * the lowest option, written the way a lead would ("around £800 a month").
 * Built from the options the API sent, so it follows the agency's config.
 */
export function typedSuggestion(q: PublicQuestion): string | undefined {
  const nums = numericOptions(q);
  if (!nums) return undefined;
  const lowest = Math.min(...nums);
  const label = q.options.find((o) => o.value === lowest)?.label ?? "";
  const currency = label.match(/^[£$€]/)?.[0] ?? "";
  const step = lowest >= 1000 ? 100 : lowest >= 100 ? 50 : 1;
  const amount = Math.max(step, Math.round((lowest * 0.8) / step) * step);
  const monthly = /month/i.test(q.question) ? " a month" : "";
  return `around ${currency}${amount.toLocaleString("en-GB")}${monthly}`;
}

/** Shown while a turn is in flight: nothing stale, nothing to press. */
const THINKING: Hint = {
  id: "thinking",
  target: null,
  pose: "thinking",
  title: "Kenzo is thinking…",
  thinking: true,
};

function sendHint(id: string): Hint {
  return {
    id,
    target: "reply",
    pose: "point",
    title: "Now press send",
    body: "Kenzo reads it like a person would. No format to get right.",
    waiting: "Waiting for you to send",
  };
}

/** A step without the script's suggestions: tap or type to carry on. */
function plainStepHint(question: PublicQuestion, id: string, ctx: HintContext, offerPick = true): Hint {
  const hasOptions = question.options.length > 0 || question.answer_type === "boolean";
  const canType = question.allows_text || question.answer_type === "text";
  if (ctx.suggested !== null && hasOptions) return pickedHint(question, ctx.suggested);
  if (ctx.reply.trim() && canType) return sendHint(`${id}:typed`);
  return {
    id,
    target: hasOptions && canType ? "options|reply" : hasOptions ? "options" : "reply",
    pose: "point",
    title: "Still on this question",
    body: hasOptions
      ? "Tap an answer to carry on, or tell Kenzo in your own words."
      : "Answer in your own words to carry on. There's no format to get right.",
    waiting: "Waiting for your answer",
    primary: hasOptions && offerPick ? PICK_FOR_ME : undefined,
  };
}

function pickedHint(question: PublicQuestion, suggested: AnswerValue): Hint {
  const multi = question.answer_type === "multi_choice";
  return {
    id: `step:${question.metric}:picked`,
    target: "continue",
    pose: "point",
    title: `I picked “${labelFor(question, suggested)}” for you`,
    body: multi
      ? "Add or remove options if you like, then press Continue to send."
      : "Press Continue to send it, or tap a different option instead.",
    waiting: "Waiting for you to continue",
  };
}

function stepHint(question: PublicQuestion, ctx: HintContext): Hint {
  const m = question.metric;
  const hasOptions = question.options.length > 0 || question.answer_type === "boolean";
  const multi = question.answer_type === "multi_choice";
  const canType = question.allows_text || question.answer_type === "text";

  // "Pick for me" filled something in: point at Continue.
  if (ctx.suggested !== null && hasOptions) return pickedHint(question, ctx.suggested);
  if (ctx.reply.trim() && canType) return sendHint(`step:${m}:typed`);

  // A number question that also takes free text: show typing an answer.
  const typed = canType ? typedSuggestion(question) : undefined;
  if (typed) {
    return {
      id: `step:${m}`,
      target: "reply",
      pose: "point",
      title: "Leads answer in their own words",
      body: "Instead of tapping an option, try typing an amount the way a lead would. Kenzo reads it and checks it against your criteria straight away.",
      suggestion: typed,
      waiting: "Waiting for you to type",
      primary: TYPE_FOR_ME,
    };
  }
  if (!hasOptions) {
    return {
      id: `step:${m}`,
      target: "reply",
      pose: "point",
      title: "Answer in your own words",
      body: "There's no format to get right. Kenzo works out what the lead meant.",
      waiting: "Waiting for your answer",
    };
  }
  return {
    id: `step:${m}`,
    target: "options",
    pose: "point",
    title: multi ? "Pick everything that applies" : "Pick what fits",
    body: multi
      ? "Leads choose from your real options, so every enquiry reaches you already tagged for the right person. No “other” box, no guessing."
      : "Every answer is checked against your criteria as it comes in, so a poor fit never reaches your calendar.",
    waiting: multi ? "Pick one or more, then Continue" : "Waiting for your pick",
    primary: PICK_FOR_ME,
  };
}

/* ------------------------------------------------------------------ */
/* The simulated steps after the conversation: booking, email, reminders */

export type SimStage = "booking" | "confirmation" | "reminders";

export function simHint(
  stage: SimStage,
  sim: { hasDay: boolean; hasTime: boolean; remindersDone: boolean },
): Hint {
  if (stage === "booking") {
    if (!sim.hasDay) {
      return {
        id: "sim:day",
        target: "calendar",
        pose: "phone",
        title: "Only times your team is free",
        body: "Leads see real free slots, so there are no double bookings and no email ping-pong to find a time. Pick a day.",
        waiting: "Pick a day",
        primary: PICK_FOR_ME,
      };
    }
    if (!sim.hasTime) {
      return {
        id: "sim:time",
        target: "slots",
        pose: "point",
        title: "Clear times, no mix-ups",
        body: "Every slot shows UK time and the call length, so nobody turns up at the wrong hour. Taken times are crossed out.",
        waiting: "Pick a time",
        primary: PICK_FOR_ME,
      };
    }
    return {
      id: "sim:book",
      target: "book",
      pose: "point",
      title: "Booked in one tap",
      body: "No form to fill in again: Kenzo already has their name and email from the conversation.",
      waiting: "Press Book",
    };
  }
  if (stage === "confirmation") {
    return {
      id: "sim:email",
      target: "email",
      pose: "present",
      title: "Confirmed in seconds",
      body: "The invite with the Zoom link and an add-to-calendar button lands straight away, while they're still keen. In this demo nothing is actually sent.",
      primary: { label: "Next: reminders", action: "next" },
    };
  }
  return {
    id: sim.remindersDone ? "sim:reminders:done" : "sim:reminders",
    target: "reminders",
    pose: "phone",
    title: "Then Kenzo makes sure they turn up",
    body: "Reminders go out 24 hours, 3 hours and 30 minutes before, each with the join link. Fewer no-shows, and your team never chases anyone.",
    waiting: sim.remindersDone ? undefined : "Watch them arrive (sped up)",
    primary: sim.remindersDone ? { label: "Next: your view", action: "toAgency" } : undefined,
  };
}
