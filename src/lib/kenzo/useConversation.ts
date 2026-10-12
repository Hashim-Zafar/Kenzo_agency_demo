"use client";

import { useCallback, useReducer } from "react";
import { kenzoDemo } from "./client";
import type {
  AnswerValue,
  Block,
  BlockChoice,
  BlockKind,
  ConversationView,
  Interaction,
  PublicQuestion,
  StartResponse,
  TurnResponse,
} from "./types";

export type ThreadItem =
  | { id: number; from: "lead"; text: string }
  | {
      id: number;
      from: "kenzo";
      kind: BlockKind;
      code: string | null;
      text: string | null;
      tone: "neutral" | "warning";
      metric: string | null;
      choices: BlockChoice[] | null;
    };

/** One question to "Ask Kenzo" and its answer. Kept for the whole
 *  conversation, separate from the step, so the step stays uncluttered. */
export type AskItem = {
  id: number;
  question: string;
  answer: string | null;
  tone: "neutral" | "warning";
  status: "waiting" | "answered" | "failed";
};

export type Outcome = { kind: "handoff" | "ended"; text: string | null } | null;

export type ConversationState = {
  phase: "idle" | "starting" | "live" | "limit" | "error";
  error: string | null;
  agencyName: string;
  questions: PublicQuestion[];
  view: ConversationView | null;
  /** The question step on screen. */
  stepMetric: string | null;
  /** Value shown pre-selected on the step (prefill / confirm). */
  prefill: AnswerValue | null;
  /** What happened on the step on screen, in order. */
  thread: ThreadItem[];
  /** Questions asked through "Ask Kenzo", oldest first. */
  asks: AskItem[];
  whyOpen: boolean;
  /** metric -> short label, for the step list. */
  answers: Record<string, string>;
  outcome: Outcome;
  busy: boolean;
  /** Counts answered turns, so a tip can belong to one turn. */
  turnNo: number;
  /** The latest turn, for the tour to react to. */
  last: { sent: Interaction["type"] | null; blocks: Block[]; rejected: boolean };
};

const initial: ConversationState = {
  phase: "idle",
  error: null,
  agencyName: "",
  questions: [],
  view: null,
  stepMetric: null,
  prefill: null,
  thread: [],
  asks: [],
  whyOpen: false,
  answers: {},
  outcome: null,
  busy: false,
  turnNo: 0,
  last: { sent: null, blocks: [], rejected: false },
};

type Action =
  | { type: "start" }
  | { type: "started"; data: StartResponse }
  | { type: "send"; interaction: Interaction; echo: string | null; label: string | null }
  | { type: "turned"; data: TurnResponse; interaction: Interaction }
  | { type: "failed"; status: number; error: string }
  | { type: "toggleWhy"; open?: boolean }
  | { type: "clearError" };

let nextId = 1;

function viewOf(data: ConversationView): ConversationView {
  return {
    conversation_status: data.conversation_status,
    lead_status: data.lead_status,
    current_metric: data.current_metric,
    pending_confirmation: data.pending_confirmation ?? null,
    pending_correction: data.pending_correction ?? null,
    active_pursuit: data.active_pursuit ?? null,
  };
}

function applyBlocks(state: ConversationState, blocks: Block[], view: ConversationView) {
  let stepMetric = state.stepMetric;
  let whyOpen = state.whyOpen;
  let prefill: AnswerValue | null = null;
  let outcome = state.outcome;
  const answers = { ...state.answers };
  // Old buttons can't be pressed twice: only this turn's blocks keep choices.
  let thread: ThreadItem[] = state.thread.map((t) =>
    t.from === "kenzo" && t.choices ? { ...t, choices: null } : t,
  );

  const moveTo = (metric: string | null) => {
    if (metric === stepMetric) return;
    if (stepMetric && !answers[stepMetric]) answers[stepMetric] = "Answered";
    stepMetric = metric;
    thread = [];
    whyOpen = false;
  };

  for (const b of blocks) {
    switch (b.kind) {
      case "show_step":
        moveTo(b.metric);
        prefill = b.value ?? null;
        break;
      case "show_explanation":
        whyOpen = true;
        break;
      case "confirm_answer":
        prefill = b.value ?? null;
        thread.push(kenzoItem(b));
        break;
      case "message":
      case "generated":
      case "pursuit_offer":
      case "pursuit_choices":
        if (b.text || b.choices?.length) thread.push(kenzoItem(b));
        break;
      case "handoff":
        if (stepMetric && !answers[stepMetric]) answers[stepMetric] = "Answered";
        outcome = { kind: "handoff", text: b.text };
        break;
      case "conversation_ended":
        outcome = { kind: "ended", text: b.text };
        break;
      case "confirm_correction":
        // The pop-up is driven by view.pending_correction.
        break;
    }
  }
  if (!stepMetric && view.current_metric) stepMetric = view.current_metric;
  return { stepMetric, whyOpen, prefill, outcome, answers, thread };
}

function kenzoItem(b: Block): ThreadItem {
  return {
    id: nextId++,
    from: "kenzo",
    kind: b.kind,
    code: b.code,
    text: b.text,
    tone: b.tone,
    metric: b.metric,
    choices: b.choices,
  };
}

/** Fill in the answer of the ask still waiting, if there is one. */
function settleAsk(asks: AskItem[], patch: Partial<AskItem>): AskItem[] {
  const i = asks.findLastIndex((a) => a.status === "waiting");
  if (i < 0) return asks;
  return asks.map((a, j) => (j === i ? { ...a, ...patch } : a));
}

function reducer(state: ConversationState, action: Action): ConversationState {
  switch (action.type) {
    case "start":
      return { ...initial, phase: "starting" };
    case "started": {
      const view = viewOf(action.data);
      const base = { ...state, phase: "live" as const, agencyName: action.data.agency_name, questions: action.data.questions, view };
      return {
        ...base,
        ...applyBlocks(base, action.data.blocks, view),
        last: { sent: null, blocks: action.data.blocks, rejected: false },
      };
    }
    case "send": {
      const answers =
        action.label && "metric" in action.interaction
          ? { ...state.answers, [action.interaction.metric]: action.label }
          : state.answers;
      if (action.interaction.type === "ask_kenzo") {
        const ask: AskItem = { id: nextId++, question: action.interaction.message, answer: null, tone: "neutral", status: "waiting" };
        return { ...state, busy: true, error: null, asks: [...state.asks, ask] };
      }
      const thread = action.echo
        ? [...state.thread, { id: nextId++, from: "lead" as const, text: action.echo }]
        : state.thread;
      return { ...state, busy: true, error: null, answers, thread };
    }
    case "turned": {
      const view = viewOf(action.data);
      let blocks = action.data.blocks ?? [];
      let asks = state.asks;
      if (action.interaction.type === "ask_kenzo") {
        // Kenzo's words go to the Ask panel; anything else (a step change,
        // an ending) still applies to the conversation as usual.
        const said = blocks.filter((b) => (b.kind === "generated" || b.kind === "message") && b.text && !b.choices?.length);
        blocks = blocks.filter((b) => !said.includes(b));
        asks = settleAsk(asks, {
          answer: said.map((b) => b.text).join("\n\n") || null,
          tone: said.some((b) => b.tone === "warning") ? "warning" : "neutral",
          status: "answered",
        });
      }
      return {
        ...state,
        asks,
        ...applyBlocks(state, blocks, view),
        view,
        busy: false,
        turnNo: state.turnNo + 1,
        last: {
          sent: action.interaction.type,
          blocks: action.data.blocks ?? [],
          rejected: !action.data.accepted,
        },
      };
    }
    case "failed": {
      const asks = settleAsk(state.asks, { status: "failed" });
      if (action.status === 429) return { ...state, asks, busy: false, phase: "limit", error: action.error };
      if (state.phase === "starting" || action.status === 404 || action.status === 503) {
        return { ...state, asks, busy: false, phase: "error", error: action.error };
      }
      return { ...state, asks, busy: false, error: action.error };
    }
    case "toggleWhy":
      return { ...state, whyOpen: action.open ?? !state.whyOpen };
    case "clearError":
      return { ...state, error: null };
  }
}

export function useConversation() {
  const [state, dispatch] = useReducer(reducer, initial);

  const start = useCallback(async () => {
    dispatch({ type: "start" });
    const res = await kenzoDemo.start();
    if (res.ok) dispatch({ type: "started", data: res.data });
    else dispatch({ type: "failed", status: res.status, error: res.error });
  }, []);

  /** Send one interaction. `echo` shows the lead's own words in the thread;
   *  `label` is what the step list shows for a tapped answer. */
  const send = useCallback(
    async (interaction: Interaction, opts?: { echo?: string; label?: string }) => {
      dispatch({ type: "send", interaction, echo: opts?.echo ?? null, label: opts?.label ?? null });
      const res = await kenzoDemo.turn(interaction);
      if (res.ok) dispatch({ type: "turned", data: res.data, interaction });
      else dispatch({ type: "failed", status: res.status, error: res.error });
    },
    [],
  );

  /** "Why do I ask?": open the panel at once, count the click in the background. */
  const explain = useCallback((metric: string) => {
    dispatch({ type: "toggleWhy", open: true });
    void kenzoDemo.turn({ type: "action", action: "explain_question", metric });
  }, []);

  const closeWhy = useCallback(() => dispatch({ type: "toggleWhy", open: false }), []);
  const clearError = useCallback(() => dispatch({ type: "clearError" }), []);

  return { state, start, send, explain, closeWhy, clearError };
}

export function labelFor(question: PublicQuestion | undefined, value: AnswerValue): string {
  const one = (v: AnswerValue) =>
    question?.options.find((o) => o.value === v)?.label ??
    (typeof v === "boolean" ? (v ? "Yes" : "No") : String(v));
  return Array.isArray(value) ? value.map(one).join(", ") : one(value);
}
