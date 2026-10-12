"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

/** Last-resort screen when the whole app fails to render. Reports to Sentry. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en-GB">
      <body className="flex min-h-dvh items-center justify-center bg-page p-6 text-fg">
        <main className="flex max-w-md flex-col gap-4 rounded-card border-default bg-surface p-6 shadow-card">
          <h1 className="m-0 font-display text-xl font-semibold">Something went wrong</h1>
          <p className="m-0 text-fg-muted">We&apos;ve been told about it. Try again, or come back in a minute.</p>
          <button type="button" onClick={reset} className="min-h-11 self-start rounded-button bg-accent px-5 font-semibold text-accent-fg hover:bg-accent-hover">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
