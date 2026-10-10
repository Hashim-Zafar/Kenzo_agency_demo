import type { ConversationState } from "@/lib/kenzo/useConversation";
import type { MascotPose } from "@/components/mascot/Mascot";
import { demoAgency } from "./demo-agency";

/** What the guide does when its main button is pressed. */
export type HintAction = "start" | "dismiss" | "pickFirst" | "typeSuggestion" | "restart";

export type Hint = {
  /** Each id is explained once; after that the guide steps back. */
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

/** Hints tied to a step disappear once the visitor acts on that step. */
export const STEP_HINTS = new Set(["options", "typing", "confirm", "correction", "pursuit"]);

export function deriveHint(s: ConversationState, seen: ReadonlySet<string>): Hint | null {
  if (s.phase === "idle") {
    return {
      id: "intro",
      target: null,
      pose: "present",
      title: "You're the customer now",
      body: "This is the live Kenzo, not a recording. Answer however you like, and I'll show you what happens behind each step.",
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

  if (view?.pending_correction && !seen.has("correction")) {
    return {
      id: "correction",
      target: "correction",
      pose: "thinking",
      title: "They changed an earlier answer",
      body: "Kenzo never overwrites an answer on its own. It asks first, then re-checks the fit.",
      waiting: "Waiting for your choice",
    };
  }

  const lastKinds = new Set(s.last.blocks.map((b) => b.kind));

  if (lastKinds.has("pursuit_offer") && !seen.has("pursuit")) {
    return {
      id: "pursuit",
      target: "pursuit",
      pose: "present",
      title: "Under your minimum, but not turned away",
      body: `That answer is under ${demoAgency.minimumLabel}. Instead of a flat no, Kenzo offers to talk it through. The minimum comes from your settings.`,
      waiting: "Waiting for your pick",
    };
  }

  if (view?.active_pursuit?.stage === "pursuing" && lastKinds.has("generated") && !seen.has("pursuing")) {
    return {
      id: "pursuing",
      target: "thread-last",
      pose: "point",
      title: "Kenzo makes your case",
      body: "It only uses offers you've set up, so it never promises something you don't sell.",
      primary: { label: "Got it", action: "dismiss" },
    };
  }

  const wentOffScript =
    (s.last.sent === "metric_text" || s.last.sent === "ask_kenzo") &&
    lastKinds.has("generated") &&
    !lastKinds.has("show_step");
  if (wentOffScript && !seen.has("offscript")) {
    return {
      id: "offscript",
      target: "thread-last",
      pose: "thinking",
      title: "A question instead of an answer, that's fine",
      body: "Kenzo answered from your own documents and kept their place. The question is still waiting.",
      primary: { label: "Carry on", action: "dismiss" },
    };
  }

  const warned = s.last.blocks.some((b) => b.kind === "message" && b.tone === "warning");
  if (warned && !seen.has("warning")) {
    return {
      id: "warning",
      target: "thread-last",
      pose: "thinking",
      title: "Kenzo stays on track",
      body: "Off-topic or manipulative messages get a short, fixed reply. Nothing the lead typed is repeated back.",
      primary: { label: "Carry on", action: "dismiss" },
    };
  }

  if (view?.pending_confirmation && view.pending_confirmation.metric === metric && !seen.has("confirm")) {
    return {
      id: "confirm",
      target: "confirm",
      pose: "point",
      title: "Kenzo checks before saving",
      body: "When a typed answer could be read two ways, it asks once instead of guessing.",
      waiting: "Waiting for you to confirm",
    };
  }

  const question = s.questions.find((q) => q.metric === metric);
  if (!question) return null;

  const typingStep =
    demoAgency.typingMetric !== null
      ? question.metric === demoAgency.typingMetric
      : question.answer_type === "number" &&
        question.metric === s.questions.find((q) => q.answer_type === "number")?.metric;
  if (typingStep && question.allows_text && !seen.has("typing")) {
    return {
      id: "typing",
      target: "reply",
      pose: "point",
      title: "Leads don't have to tap",
      body: `Try typing a budget under this agency's minimum of ${demoAgency.minimumLabel}.`,
      suggestion: demoAgency.belowMinimumExample,
      waiting: "Waiting for you to type",
      primary: { label: "Type it for me", action: "typeSuggestion" },
    };
  }

  const hasOptions = question.options.length > 0 || question.answer_type === "boolean";
  if (hasOptions && !seen.has("options")) {
    return {
      id: "options",
      target: "options",
      pose: "point",
      title: "No form, one question at a time",
      body: "Pick any option. Each answer shapes what Kenzo asks next.",
      waiting: "Waiting for your pick",
      primary: { label: "Pick for me", action: "pickFirst" },
    };
  }

  return null;
}
