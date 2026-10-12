/**
 * Server-only bridge between the demo site and the Kenzo API.
 *
 * The Kenzo API must never be called from a browser: it trusts the
 * X-Kenzo-Internal-Token and the tenant headers. Until the real security
 * worker exists, these route handlers play its part for the DEMO agency only:
 *   - the token and tenant come from server env, never from the request;
 *   - the browser never sees the token, the agency id or the schema;
 *   - a visitor can only touch the conversation in their own httpOnly cookie;
 *   - bodies are size-capped, requests are rate limited, cross-site POSTs refused.
 *
 * Import this ONLY from route handlers (app/api/**), never from components.
 */

import * as Sentry from "@sentry/nextjs";
import { randomUUID } from "node:crypto";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CONVERSATION_COOKIE = "kenzo_demo_conversation";
const MAX_BODY_BYTES = 4_096;
const UPSTREAM_TIMEOUT_MS = 45_000;

type DemoEnv = {
  apiUrl: string;
  token: string | null;
  agencyId: string;
  schemaName: string;
  emailDomain: string;
};

// Reserved for documentation (RFC 2606): no real person can own an address
// here and nothing is ever delivered. The API only needs a valid-looking email.
const DEFAULT_EMAIL_DOMAIN = "demo.example.com";

function readEnv(): DemoEnv | null {
  const apiUrl = process.env.KENZO_API_URL;
  const token = process.env.KENZO_INTERNAL_TOKEN || null;
  const agencyId = process.env.KENZO_DEMO_AGENCY_ID;
  const schemaName = process.env.KENZO_DEMO_SCHEMA;
  const emailDomain = process.env.KENZO_DEMO_EMAIL_DOMAIN || DEFAULT_EMAIL_DOMAIN;
  if (!apiUrl || !agencyId || !schemaName) return null;
  if (!UUID_RE.test(agencyId)) return null;
  // Same rule as the API: the token may only be missing in development.
  if (!token && process.env.NODE_ENV === "production") return null;
  return { apiUrl: apiUrl.replace(/\/+$/, ""), token, agencyId, schemaName, emailDomain };
}

export function isUuid(value: string | undefined | null): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/* ---------- small fixed-window rate limiter (per server instance) ----------
   Good enough for one demo server. Behind several instances or serverless,
   put a shared limit in front (Cloudflare rate limiting) as well. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

export function clientIp(request: Request): string {
  // Only trustworthy behind a proxy that sets this header itself.
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** Refuse POSTs that come from another site's page. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readSmallJson(request: Request): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) return null;
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Statuses the API documents; anything else becomes a generic error. */
const PASS_THROUGH = new Set([200, 201, 400, 404, 409, 422, 429]);

export async function callKenzo(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<Response> {
  const env = readEnv();
  const route = `${method} ${path.replace(UUID_IN_PATH, ":id")}`;
  if (!env) {
    report("error", "Kenzo demo is not configured", route, "not_configured");
    return json(503, { error: "demo_not_configured" });
  }

  try {
    const upstream = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(env.token ? { "X-Kenzo-Internal-Token": env.token } : {}),
        "X-Agency-ID": env.agencyId,
        "X-Schema-Name": env.schemaName,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!PASS_THROUGH.has(upstream.status)) {
      report("error", `Kenzo API returned ${upstream.status}`, route, "bad_status", upstream.status);
      return json(502, { error: "unavailable" });
    }
    const data: unknown = await upstream.json().catch(() => null);
    if (data === null) {
      report("error", "Kenzo API sent a body that isn't JSON", route, "bad_body", upstream.status);
      return json(502, { error: "unavailable" });
    }
    // 400/422: the API refused what this site sent. That's a bug on one side.
    if (upstream.status === 400 || upstream.status === 422) {
      report("warning", `Kenzo API refused the request (${upstream.status})`, route, "refused", upstream.status, data);
    }
    return json(upstream.status, data);
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    report("error", timedOut ? "Kenzo API timed out" : "Kenzo API unreachable", route, timedOut ? "timeout" : "unreachable");
    return json(504, { error: "unavailable" });
  }
}

const UUID_IN_PATH = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Sends a problem with the Kenzo API to Sentry: the route, the status and
 *  the API's error code only. Never the request body, ids or visitor text. */
function report(
  level: "error" | "warning",
  message: string,
  route: string,
  problem: string,
  status?: number,
  data?: unknown,
) {
  const detail = (data as { detail?: unknown } | null)?.detail;
  Sentry.captureMessage(message, {
    level,
    fingerprint: ["kenzo-api", route, problem, String(status ?? "")],
    tags: { area: "kenzo-api", route, problem, upstream_status: status === undefined ? "none" : String(status) },
    // A short string detail is an error code; anything else (e.g. validation
    // lists that echo input) is reduced to its field paths.
    extra: { api_error: typeof detail === "string" && detail.length <= 80 ? detail : fieldPaths(detail) },
  });
}

function fieldPaths(detail: unknown): string[] | undefined {
  if (!Array.isArray(detail)) return undefined;
  return detail
    .slice(0, 10)
    .map((d) => (d && typeof d === "object" && Array.isArray((d as { loc?: unknown }).loc) ? (d as { loc: unknown[] }).loc.join(".") : ""))
    .filter(Boolean);
}

/** A made-up visitor, so the demo never collects a real person's details. */
export function demoVisitor(): { name: string; email: string } | null {
  const env = readEnv();
  if (!env) return null;
  const id = randomUUID().slice(0, 8);
  return { name: "Demo visitor", email: `visitor-${id}@${env.emailDomain}` };
}
