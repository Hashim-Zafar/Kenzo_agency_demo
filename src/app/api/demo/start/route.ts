import { cookies } from "next/headers";
import {
  CONVERSATION_COOKIE,
  callKenzo,
  clientIp,
  demoVisitor,
  isUuid,
  json,
  rateLimited,
  sameOrigin,
} from "@/lib/server/kenzo-proxy";

/** Start a demo conversation as a made-up visitor. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, { error: "forbidden" });
  if (rateLimited(`start:${clientIp(request)}`, 5, 10 * 60_000)) {
    return json(429, { error: "too_many_starts" });
  }

  const visitor = demoVisitor();
  if (!visitor) return json(503, { error: "demo_not_configured" });

  const response = await callKenzo("POST", "/conversations", visitor);
  if (response.status !== 201) return response;

  const data = (await response.json()) as Record<string, unknown>;
  const conversationId = data.conversation_id;
  if (typeof conversationId !== "string" || !isUuid(conversationId)) {
    return json(502, { error: "unavailable" });
  }

  (await cookies()).set(CONVERSATION_COOKIE, conversationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/demo",
    maxAge: 2 * 60 * 60,
  });

  // The browser has no use for ids; the cookie carries the conversation.
  delete data.lead_id;
  delete data.conversation_id;
  return json(201, data);
}
