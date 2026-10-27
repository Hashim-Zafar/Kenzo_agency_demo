import { clientIp, json, rateLimited, sameOrigin, warmKenzo } from "@/lib/server/kenzo-proxy";

/**
 * Wake the Kenzo API before the visitor reaches the live demo. Called once
 * per page load (see WarmKenzo); the visitor never waits on it.
 *
 * POST, not GET: with cacheComponents a GET handler can be prerendered, and a
 * warmup must run at request time. It also lets us refuse cross-site calls.
 * The answer is only whether the API is up: no internals, no timings.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, { error: "forbidden" });
  if (rateLimited(`warmup:${clientIp(request)}`, 10, 10 * 60_000)) {
    return json(429, { error: "too_many_requests" });
  }
  return json(200, { warm: await warmKenzo() });
}
