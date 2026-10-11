import type { ConversationState } from "@/lib/kenzo/useConversation";
import { labelFor } from "@/lib/kenzo/useConversation";
import type { AnswerValue, ConversationAction, PublicQuestion } from "@/lib/kenzo/types";
import type { MascotPose } from "@/components/mascot/Mascot";
import { demoAgency, stepScript } from "./demo-agency";

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
 * One guide per moment. Order of precedence:
 *   1. the conversation's own moments (intro, ending, limits, errors)
 *   2. things waiting on the visitor (correction, the below-minimum offer,
 *      talking it through, confirming a value)
 *   3. a reaction to the last turn (off script, warning) until "Got it"
 *   4. the step's own guide from the demo script
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
  if (s.phase === "starting") return null;
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
  const index = s.questions.findIndex((q) => q.metric === metric);
  const question = index >= 0 ? s.questions[index] : undefined;
  if (!question || !metric) return null;
  const script = stepScript(metric);

  /* ---- 2. waiting on the visitor ---- */
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

  const pursuit = view?.active_pursuit?.metric === metric ? view.active_pursuit : null;
  const lastCodes = new Set(s.last.blocks.map((b) => b.code));
  const lastKinds = new Set(s.last.blocks.map((b) => b.kind));

  if (pursuit?.stage === "offered") {
    const choice = script?.offerChoice;
    if (choice === "decline_pursuit") {
      return {
        id: `offer:${metric}`,
        target: "pursuit",
        pose: "present",
        title: "Leads are never pushed",
        body: "Tap “Keep going”. Kenzo keeps their answer and moves on, with no second attempt. Every lead gets a polite, respectful experience, even the ones who aren't a fit.",
        waiting: "Tap “Keep going”",
        allowedActions: ["decline_pursuit"],
      };
    }
    return {
      id: `offer:${metric}`,
      target: "pursuit",
      pose: "present",
      title: "Below your floor, but not turned away",
      body: "Instead of a flat no, Kenzo offers to talk it through. Leads you'd have lost to a form get a second chance. Tap “Talk it through”.",
      waiting: "Tap “Talk it through”",
      allowedActions: choice ? [choice] : undefined,
    };
  }

  if (pursuit?.stage === "pursuing") {
    const [firstReply, secondReply] = demoAgency.pursuitReplies;
    const typed = ctx.reply.trim().length > 0;
    if (lastKinds.has("pursuit_choices")) {
      return {
        id: `pitch:${metric}:${s.turnNo}`,
        target: "pursuit",
        pose: "present",
        title: "Now Kenzo makes your case",
        body: "It argues from offers and facts you've set up, never invented ones. The lead decides: take your number, or keep theirs.",
        waiting: "Your call",
      };
    }
    if (lastCodes.has("pursuit_opener")) {
      return typed
        ? sendHint(`opener:${metric}:typed`)
        : {
            id: `opener:${metric}`,
            target: "reply",
            pose: "point",
            title: "Kenzo asks before it pitches",
            body: "That opening question is yours, written in your settings. No sales pitch until the lead has said what's holding them back.",
            suggestion: firstReply,
            waiting: "Reply in your own words",
            primary: TYPE_FOR_ME,
          };
    }
    return typed
      ? sendHint(`listening:${metric}:${s.turnNo}:typed`)
      : {
          id: `listening:${metric}:${s.turnNo}`,
          target: "reply",
          pose: "thinking",
          title: "Kenzo listens first",
          body: "It answers their point from your own facts, without pushing. When the moment's right, it makes your case.",
          suggestion: secondReply,
          waiting: "Reply again",
          primary: TYPE_FOR_ME,
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

  /* ---- 3. reaction to the last turn ---- */
  const offScript =
    (s.last.sent === "metric_text" || s.last.sent === "ask_kenzo") &&
    lastKinds.has("generated") &&
    !lastKinds.has("show_step");
  const offScriptId = `offscript:${s.turnNo}`;
  if (offScript && !ctx.dismissed.has(offScriptId)) {
    return {
      id: offScriptId,
      target: "thread-last",
      pose: "thinking",
      title: s.last.sent === "ask_kenzo" ? "Answered from your documents" : "A question instead of an answer, that's fine",
      body: "Kenzo answered from your own documents and kept their place. Nothing made up, and the step is still waiting.",
      primary: { label: "Got it", action: "dismiss" },
    };
  }
  const warned = s.last.blocks.some((b) => b.kind === "message" && b.tone === "warning");
  const warnId = `warning:${s.turnNo}`;
  if (warned && !ctx.dismissed.has(warnId)) {
    return {
      id: warnId,
      target: "thread-last",
      pose: "thinking",
      title: "Kenzo stays on track",
      body: "Off-topic or manipulative messages get a short, fixed reply. Nothing the lead typed is repeated back.",
      primary: { label: "Got it", action: "dismiss" },
    };
  }

  /* ---- 4. the step's own guide ---- */
  return stepHint(question, script, ctx);
}

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

function stepHint(
  question: PublicQuestion,
  script: ReturnType<typeof stepScript>,
  ctx: HintContext,
): Hint {
  const m = question.metric;
  const hasOptions = question.options.length > 0 || question.answer_type === "boolean";
  const multi = question.answer_type === "multi_choice";

  // "Pick for me" filled something in: point at Continue.
  if (ctx.suggested !== null && hasOptions) {
    return {
      id: `step:${m}:picked`,
      target: "continue",
      pose: "point",
      title: `I picked “${labelFor(question, ctx.suggested)}” for you`,
      body: multi
        ? "Add or remove options if you like, then press Continue to send."
        : "Press Continue to send it, or tap a different option instead.",
      waiting: "Waiting for you to continue",
    };
  }

  const canType = question.allows_text || question.answer_type === "text";

  if (script) {
    if (script.target === "reply" && canType) {
      if (ctx.reply.trim()) return sendHint(`step:${m}:typed`);
      return {
        id: `step:${m}`,
        target: "reply",
        pose: "point",
        title: script.title,
        body: script.body,
        suggestion: script.typeText,
        waiting: script.waiting,
        primary: script.typeText ? TYPE_FOR_ME : undefined,
      };
    }
    return {
      id: `step:${m}`,
      target: script.target === "ask" ? "ask" : hasOptions ? "options" : "reply",
      pose: script.target === "ask" ? "present" : "point",
      title: script.title,
      body: script.body,
      waiting: script.waiting,
      primary: hasOptions ? PICK_FOR_ME : undefined,
    };
  }

  // A step the script doesn't cover (config changed): a sensible default.
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
    body: "Every answer is checked against your criteria as it comes in, so a poor fit never reaches your calendar.",
    waiting: "Waiting for your pick",
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
