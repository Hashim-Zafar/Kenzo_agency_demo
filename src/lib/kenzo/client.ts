import * as Sentry from "@sentry/nextjs";
import type { ConversationView, Interaction, StartResponse, TurnResponse } from "./types";

/** Browser -> the demo site's own server (never the Kenzo API directly). */

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

async function call<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    // A rejected move (409) carries the state to resync to, so treat it as
    // data. A 409 "turn_in_progress" carries only a code: that's an error.
    const rejectedMove = res.status === 409 && data !== null && typeof data.detail !== "string";
    if (res.ok || rejectedMove) return { ok: true, status: res.status, data: data as T };
    const code =
      (typeof data?.detail === "string" && data.detail) ||
      (typeof data?.error === "string" && data.error) ||
      "unavailable";
    return { ok: false, status: res.status, error: code };
  } catch {
    return { ok: false, status: 0, error: "network" };
  }
}

/** Server-side failures (502/503/504) are already reported by the bridge;
 *  rate limits are expected. Everything else is worth a look. */
const EXPECTED = new Set([429, 502, 503, 504]);

/** The shape of an interaction, never its text: what Sentry may keep. */
function describe(i: Interaction): Record<string, string> {
  const d: Record<string, string> = { type: i.type };
  if ("action" in i && typeof i.action === "string") d.action = i.action;
  if ("metric" in i && typeof i.metric === "string") d.metric = i.metric;
  return d;
}

function track<T>(name: string, result: ApiResult<T>, shape?: Record<string, string>): ApiResult<T> {
  const data = result.ok ? (result.data as { blocks?: { kind?: unknown }[] } | null) : null;
  Sentry.addBreadcrumb({
    category: "kenzo",
    message: name,
    level: result.ok ? "info" : "warning",
    data: {
      ...shape,
      status: result.status,
      ...(result.ok ? { blocks: (data?.blocks ?? []).map((b) => String(b.kind)).join(", ") } : { error: result.error }),
    },
  });
  if (!result.ok && !EXPECTED.has(result.status)) {
    Sentry.captureMessage(`Kenzo ${name} failed (${result.status || "network"})`, {
      level: result.status === 0 ? "warning" : "error",
      fingerprint: ["kenzo-client", name, String(result.status), result.error],
      tags: { area: "kenzo-client", call: name, status: String(result.status), error_code: result.error.slice(0, 60) },
      extra: shape,
    });
  }
  return result;
}

/** A cold API (free-tier sleep) or a stale database connection: worth one
 *  more try. Never a 4xx: those are answers, not outages. */
const RETRYABLE = new Set([0, 502, 503, 504]);
const START_RETRY_DELAY_MS = 1_500;

async function startOnce(): Promise<ApiResult<StartResponse>> {
  return call<StartResponse>("/api/demo/start", { method: "POST", body: "{}" });
}

let warming: Promise<void> | null = null;

export const kenzoDemo = {
  /** Wake the API ahead of time. Once per page load, never awaited by the
   *  UI, never reported: failing here is expected while the API sleeps. */
  warmup: (): Promise<void> => {
    warming ??= fetch("/api/demo/warmup", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    }).then(
      () => undefined,
      () => undefined,
    );
    return warming;
  },
  /** Start a conversation. Retries ONCE on an outage-type failure, so the
   *  visitor doesn't see "can't reach Kenzo" just because it was waking up.
   *  Starting twice is harmless: an abandoned demo conversation. */
  start: async () => {
    let result = await startOnce();
    if (!result.ok && RETRYABLE.has(result.status)) {
      Sentry.addBreadcrumb({
        category: "kenzo",
        message: "start retry",
        level: "info",
        data: { status: result.status, error: result.error },
      });
      await new Promise((resolve) => setTimeout(resolve, START_RETRY_DELAY_MS));
      result = await startOnce();
    }
    return track("start", result);
  },
  turn: async (interaction: Interaction) =>
    track(
      "turn",
      await call<TurnResponse>("/api/demo/turn", { method: "POST", body: JSON.stringify(interaction) }),
      describe(interaction),
    ),
  state: async () => track("state", await call<ConversationView>("/api/demo/state")),
};
