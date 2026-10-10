import Link from "next/link";
import { Mascot } from "@/components/mascot/Mascot";

// Placeholder — the real landing page comes later.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-kenzo-50 px-6 py-16 text-center text-ink-900">
      <Mascot pose="wave" priority className="w-32 sm:w-40" />
      <div className="max-w-xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Meet Kenzo
        </h1>
        <p className="text-ink-700">
          See exactly what your customers experience — then see what lands on your side.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/tour/customer"
          className="rounded-full bg-kenzo-600 px-6 py-3 font-medium text-white transition hover:bg-kenzo-700"
        >
          See it from your customer&apos;s view
        </Link>
        <Link
          href="/tour/agency"
          className="rounded-full px-6 py-3 font-medium text-kenzo-700 ring-1 ring-kenzo-200 transition hover:bg-kenzo-100"
        >
          Skip to your view
        </Link>
      </div>
    </main>
  );
}
