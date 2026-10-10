import { cookies } from "next/headers";
import {
  CONVERSATION_COOKIE,
  callKenzo,
  clientIp,
  isUuid,
  json,
  rateLimited,
  readSmallJson,
  sameOrigin,
} from "@/lib/server/kenzo-proxy";

/** One interaction on the visitor's own conversation. The API validates the
 *  interaction strictly; this only checks size, origin and ownership. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, { error: "forbidden" });
  if (rateLimited(`turn:${clientIp(request)}`, 40, 60_000)) {
    return json(429, { error: "too_many_turns" });
  }

  const conversationId = (await cookies()).get(CONVERSATION_COOKIE)?.value;
  if (!isUuid(conversationId)) return json(404, { error: "no_conversation" });

  const interaction = await readSmallJson(request);
  if (!interaction) return json(400, { error: "invalid_request" });

  const response = await callKenzo(
    "POST",
    `/conversations/${conversationId}/turns`,
    interaction,
  );
  return stripIds(response);
}

async function stripIds(response: Response): Promise<Response> {
  const data = (await response.json()) as Record<string, unknown>;
  delete data.lead_id;
  delete data.conversation_id;
  return json(response.status, data);
}
