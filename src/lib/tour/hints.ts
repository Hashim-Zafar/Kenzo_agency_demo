import type { ConversationState } from "@/lib/kenzo/useConversation";
import type { AnswerValue, PublicQuestion } from "@/lib/kenzo/types";
import { labelFor } from "@/lib/kenzo/useConversation";
import type { MascotPose } from "@/components/mascot/Mascot";
import { demoAgency } from "./demo-agency";

/** What the guide does when its button is pressed. */
export type HintAction = "start" | "dismiss" | "pickForMe" | "typeForMe" | "restart";

export type Hint = {
  /** Unique per moment; the guide re-aims when it changes. */
  id: string;
  /** data-tour value of the element to spotlight; null = centred card. */
  target: string | null;
  /** "point" = Kenzo points toward the target from whichever side he's on. */
  pose: MascotPose | "point";
  title: string;
  body?: string;
  suggestion?: string;
  waiting?: string;
  primary?: { label: string; action: HintAction };
};

export type HintContext = {
  /** Reaction tips the visitor closed with "Got it". */
  dismissed: ReadonlySet<string>;
  /** What "Pick for me" selected on the step on screen (not sent yet). */
  suggested: AnswerValue | null;
  /** What's in the reply box right now. */
  reply: string;
};

/**
 * One guide per step. Order of precedence:
 *   1. the conversation's own moments (intro, ending, limits, errors)
 *   2. things waiting on the visitor (correction pop-up, below-minimum offer,
 *      talking it through, confirming a value)
 *   3. a reaction to the last turn (went off script, warning) until "Got it"
 *   4. the step's own guide, which stays until the step is answered
 */
export function deriveHint(s: ConversationState, ctx: HintContext): Hint | null {
  /* ---- 1. the conversation's own moments ---- */
  if (s.phase === "idle") {
    return {
      id: "intro",
      target: null,
      pose: "present",
      title: "You're the customer now",
      body: "This is the live Kenzo, not a recording. I'll guide you through every step and show you what happens behind it.",
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
      title: "Qualified, straight to booking",
      body: "A good-fit lead goes on to pick a time. No back-and-forth emails, and you never chase a form.",
      primary: { label: "See it again", action: "restart" },
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
        ? "Leads who don't match your criteria are told politely, and nothing lands in your calendar."
        : "Kenzo closes conversations that stop making sense, so your team's time is protected.",
      primary: { label: "Try another path", action: "restart" },
    };
  }

  const view = s.view;
  const metric = s.stepMetric;
  const index = s.questions.findIndex((q) => q.metric === metric);
  const question = index >= 0 ? s.questions[index] : undefined;
  if (!question || !metric) return null;

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
  if (pursuit?.stage === "offered") {
    return {
      id: `pursuit-offer:${metric}`,
      target: "pursuit",
      pose: "present",
      title: "Under the minimum, but not turned away",
      body: `That's under ${demoAgency.minimumLabel}. Instead of a flat no, Kenzo offers to talk it through. The minimum comes from your settings.`,
      waiting: "Pick either one to see where it goes",
    };
  }
  if (pursuit?.stage === "pursuing") {
    return {
      id: `pursuing:${metric}`,
      target: question.allows_text || question.answer_type === "text" ? "pursuit|reply" : "pursuit",
      pose: "point",
      title: "Talk it through with Kenzo",
      body: "Ask what you'd get for your budget, or push back. Kenzo makes the agency's case using only offers they've set up. You can also tap one of its suggestions.",
      waiting: "Waiting for your reply",
    };
  }

  if (s.prefill !== null) {
    return {
      id: `confirm:${metric}:${s.turnNo}`,
      target: "confirm",
      pose: "point",
      title: "Kenzo checks before saving",
      body: "When a typed answer could be read more than one way, it asks once instead of guessing.",
      waiting: "Confirm it, or pick another answer",
    };
  }

  /* ---- 3. reaction to the last turn ---- */
  const lastKinds = new Set(s.last.blocks.map((b) => b.kind));
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
      title: "A question instead of an answer, that's fine",
      body: "Kenzo answered from the agency's own documents and kept their place. The question is still waiting.",
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
  return stepHint(s, question, index, ctx);
}

function stepHint(
  s: ConversationState,
  question: PublicQuestion,
  index: number,
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

  // The "type a budget under the minimum" showcase.
  const typingMetric =
    demoAgency.typingMetric ??
    s.questions.find((q) => q.answer_type === "number" && q.allows_text)?.metric ??
    null;
  if (m === typingMetric && question.allows_text) {
    const typed = ctx.reply.trim().length > 0;
    return {
      id: `step:${m}:${typed ? "typed" : "typing"}`,
      target: "reply",
      pose: "point",
      title: typed ? "Now press send" : "Leads don't have to tap",
      body: typed
        ? "Kenzo reads typed answers like “2-3k” or “about £2k a month”, so leads can answer however they talk."
        : `Try typing a budget under this agency's minimum of ${demoAgency.minimumLabel}, and see what Kenzo does.`,
      suggestion: typed ? undefined : demoAgency.belowMinimumExample,
      waiting: typed ? "Waiting for you to send" : "Waiting for you to type",
      primary: typed ? undefined : { label: "Type it for me", action: "typeForMe" },
    };
  }

  // Free-text or number steps with no options.
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

  // Option steps: each one shows off something different.
  const pick = { label: "Pick for me", action: "pickForMe" as const };
  if (index === 0) {
    return {
      id: `step:${m}`,
      target: "options",
      pose: "point",
      title: "No form, one question at a time",
      body: multi
        ? "Pick everything that applies, then press Continue. Each answer shapes what Kenzo asks next."
        : "Pick any option. Each answer shapes what Kenzo asks next.",
      waiting: "Waiting for your pick",
      primary: pick,
    };
  }

  const features: Hint[] = [];
  if (question.why_we_ask) {
    features.push({
      id: `step:${m}`,
      target: "options",
      pose: "point",
      title: "Leads can see why you ask",
      body: "“Why do I ask?” under the question gives your reason in your words. Leads answer more honestly when they know why.",
      waiting: "Pick an answer when you're ready",
      primary: pick,
    });
  }
  features.push({
    id: `step:${m}`,
    target: "options",
    pose: "point",
    title: "Questions are welcome mid-flow",
    body: "Try “Ask Kenzo”, or type a question in the reply box. Kenzo answers from your own documents, then brings them back to this step.",
    waiting: "Ask something, or pick an answer",
    primary: pick,
  });
  features.push({
    id: `step:${m}`,
    target: "options",
    pose: "point",
    title: multi ? "Pick everything that applies" : "Pick what fits",
    body: "Every answer is checked against your criteria as it comes in, so a poor fit never reaches your calendar.",
    waiting: "Waiting for your pick",
    primary: pick,
  });
  return features[(index - 1) % features.length];
}
