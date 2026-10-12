import type { ConversationAction, Scalar } from "@/lib/kenzo/types";

/**
 * The tour script for the DEMO agency, step by step.
 *
 * The Kenzo API never reveals thresholds or rules (by design), so the copy
 * that mentions them lives here. If you change the demo agency's config in
 * the database, update this file to match.
 */

export type StepScript = {
  /** What the guide spotlights on this step. */
  target: "options" | "reply" | "ask";
  title: string;
  /** How this step helps the agency. */
  body: string;
  waiting: string;
  /** "Pick for me" selects this (default: the first option). Never sent for them. */
  pickValue?: Scalar | Scalar[];
  /** "Type it for me" types this into the box. Never sent for them. */
  typeText?: string;
  /** On this step's below-minimum offer, the only button the tour allows. */
  offerChoice?: Extract<ConversationAction, "accept_pursuit" | "decline_pursuit">;
};

export const demoAgency = {
  steps: {
    services: {
      target: "options",
      title: "Only the services you sell",
      body: "Leads pick from your real services, so every enquiry reaches you already tagged for the right specialist. No “other” box, no guessing.",
      waiting: "Pick one or more, then Continue",
      pickValue: ["paid_social", "google_ads"],
    },
    monthly_ad_budget: {
      target: "reply",
      title: "Leads answer in their own words",
      body: "You want £3,000 a month, and anything under £2,000 is below your floor. Type a budget under £2,000 and see what Kenzo does instead of turning them away.",
      waiting: "Waiting for you to type",
      typeText: "around £1,500 a month",
      offerChoice: "accept_pursuit",
    },
    decision_maker: {
      target: "ask",
      title: "Leads can ask anything, mid-flow",
      body: "“Ask Kenzo” answers from your own documents, then brings them straight back to this step. Questions get answered before the call, so your team doesn't spend it on basics.",
      waiting: "Ask something, or pick who decides",
      pickValue: "me",
    },
    start_timeline: {
      target: "options",
      title: "No rule, still useful",
      body: "Not every question has to pass or fail. This one has no rule: Kenzo just notes when they want to start, so your team knows who's ready now and who's still looking.",
      waiting: "Pick when you'd start",
      pickValue: "within_month",
    },
  } satisfies Record<string, StepScript>,

  /** Suggested replies while talking it through (budget). */
  pursuitReplies: [
    "Mostly cash flow, it's tight this quarter",
    "What would £3k get me that £1.5k wouldn't?",
  ],
} as const;

export function stepScript(metric: string | null): StepScript | null {
  if (!metric) return null;
  return (demoAgency.steps as Record<string, StepScript>)[metric] ?? null;
}
