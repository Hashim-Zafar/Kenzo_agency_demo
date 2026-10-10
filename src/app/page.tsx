import Link from "next/link";
import { Mascot } from "@/components/mascot/Mascot";

// Placeholder — the real landing page comes later.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-page px-6 py-16 text-center text-fg">
      <Mascot pose="wave" priority className="w-32 sm:w-40" />
      <div className="max-w-xl space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Meet Kenzo
        </h1>
        <p className="text-fg-muted">
          See exactly what your customers experience — then see what lands on your side.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/tour/customer"
          className="rounded-control bg-accent px-6 py-3 font-medium text-accent-fg transition duration-(--duration-fast) ease-kenzo hover:bg-accent-hover"
        >
          See it from your customer&apos;s view
        </Link>
        <Link
          href="/tour/agency"
          className="rounded-control border-strong px-6 py-3 font-medium text-brand transition duration-(--duration-fast) ease-kenzo hover:bg-surface-muted"
        >
          Skip to your view
        </Link>
      </div>
    </main>
  );
}
