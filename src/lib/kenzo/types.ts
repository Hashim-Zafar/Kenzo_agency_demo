/** Mirrors the Kenzo v5 API (app/api/schemas.py, src/state.py). The demo's
 *  own server strips ids before anything reaches the browser. */

export type Scalar = string | number | boolean;
export type AnswerValue = Scalar | Scalar[];

export type AnswerType = "single_choice" | "multi_choice" | "number" | "boolean" | "text";

export type PublicOption = { label: string; value: Scalar };

export type PublicQuestion = {
  metric: string;
  question: string;
  why_we_ask: string | null;
  answer_type: AnswerType;
  options: PublicOption[];
  allows_text: boolean;
};

export type BlockKind =
  | "message"
  | "conversation_ended"
  | "show_explanation"
  | "show_step"
  | "handoff"
  | "confirm_answer"
  | "confirm_correction"
  | "pursuit_offer"
  | "pursuit_choices"
  | "generated";

export type ConversationAction =
  | "explain_question"
  | "apply_correction"
  | "keep_answer"
  | "accept_pursuit"
  | "decline_pursuit"
  | "pursuit_accept_target"
  | "pursuit_accept_alternative"
  | "pursuit_keep_answer";

export type BlockChoice = { action: ConversationAction; label: string };

export type Block = {
  kind: BlockKind;
  tone: "neutral" | "warning";
  code: string | null;
  text: string | null;
  metric: string | null;
  value: AnswerValue | null;
  choices: BlockChoice[] | null;
};

export type Held = { metric: string; value: AnswerValue };

export type ConversationView = {
  conversation_status: string;
  lead_status: "pending" | "qualified" | "warm" | "unqualified" | string;
  current_metric: string | null;
  pending_confirmation: Held | null;
  pending_correction: Held | null;
  active_pursuit: { metric: string; stage: "offered" | "pursuing" } | null;
};

export type TurnResponse = ConversationView & {
  accepted: boolean;
  rejection_reason: string | null;
  blocks: Block[];
};

export type StartResponse = TurnResponse & {
  agency_name: string;
  questions: PublicQuestion[];
};

export type Interaction =
  | { type: "action"; action: ConversationAction; metric: string }
  | { type: "structured_answer"; metric: string; value: AnswerValue }
  | { type: "metric_text"; metric: string; message: string }
  | { type: "ask_kenzo"; message: string };

/** Limits the API enforces; mirrored so the UI stops typing before it does. */
export const MAX_MESSAGE_CHARS = 1_000;
