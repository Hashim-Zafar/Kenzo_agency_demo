import { cookies } from "next/headers";
import { CONVERSATION_COOKIE, callKenzo, isUuid, json } from "@/lib/server/kenzo-proxy";

/** Resync after a 409 or a reload. */
export async function GET() {
  const conversationId = (await cookies()).get(CONVERSATION_COOKIE)?.value;
  if (!isUuid(conversationId)) return json(404, { error: "no_conversation" });

  const response = await callKenzo("GET", `/conversations/${conversationId}`);
  const data = (await response.json()) as Record<string, unknown>;
  delete data.lead_id;
  delete data.conversation_id;
  return json(response.status, data);
}
