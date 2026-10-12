import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/observability/sentry-options";

Sentry.init({
  ...sentryOptions,
  // Keep what visitors type out of breadcrumbs: no console capture of
  // messages and no DOM text from clicks beyond the element selector.
  integrations: (defaults) => defaults.filter((i) => i.name !== "Console"),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
