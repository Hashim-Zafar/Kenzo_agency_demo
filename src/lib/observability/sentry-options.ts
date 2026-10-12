import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Shared Sentry settings for the browser, the server and the edge.
 *
 * Errors only: no performance tracing, no session replay, no personal data.
 * Sentry stays off until NEXT_PUBLIC_SENTRY_DSN is set (a DSN is public by
 * design: it can only send events, not read them).
 */
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;

export const sentryOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  // SENTRY_DEBUG=1 prints what the SDK does to the server log (never in the browser bundle).
  debug: process.env.SENTRY_DEBUG === "1",
  beforeSend: scrub,
};

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const EMAIL = /[^\s@"']+@[^\s@"']+\.[a-z]{2,}/gi;

/** Last line of defence: drop cookies, headers and bodies, and blank out
 *  conversation ids and email addresses wherever they appear. */
function scrub(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
    if (event.request.url) event.request.url = clean(event.request.url);
    if (typeof event.request.query_string === "string") delete event.request.query_string;
  }
  delete event.user;
  if (event.message) event.message = clean(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = clean(ex.value);
  }
  for (const crumb of event.breadcrumbs ?? []) {
    if (crumb.message) crumb.message = clean(crumb.message);
    if (crumb.data && typeof crumb.data.url === "string") crumb.data.url = clean(crumb.data.url);
  }
  return event;
}

function clean(text: string): string {
  return text.replace(UUID, ":id").replace(EMAIL, "[email]");
}
