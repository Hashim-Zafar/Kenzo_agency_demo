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

export const kenzoDemo = {
  start: () => call<StartResponse>("/api/demo/start", { method: "POST", body: "{}" }),
  turn: (interaction: Interaction) =>
    call<TurnResponse>("/api/demo/turn", { method: "POST", body: JSON.stringify(interaction) }),
  state: () => call<ConversationView>("/api/demo/state"),
};
