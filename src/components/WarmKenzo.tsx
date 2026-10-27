"use client";

import { useEffect } from "react";
import { kenzoDemo } from "@/lib/kenzo/client";

/**
 * Wakes the Kenzo API as soon as any page opens, so it's awake by the time
 * the visitor starts the live demo (the free-tier API sleeps when idle, and
 * waking it takes longer than a visitor will wait). Renders nothing.
 */
export function WarmKenzo() {
  useEffect(() => {
    void kenzoDemo.warmup();
  }, []);
  return null;
}
