import type { Metadata } from "next";
import { Suspense } from "react";
import { Walkthrough, type StartStage } from "@/components/walkthrough/Walkthrough";

export const metadata: Metadata = { title: "Your customer's view · Kenzo" };

const STAGES: StartStage[] = ["agent", "booking", "confirmation", "reminders"];

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** /tour/customer?step=booking (or confirmation, reminders) skips ahead. */
export default function CustomerTourPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-page" />}>
      <Tour searchParams={searchParams} />
    </Suspense>
  );
}

async function Tour({ searchParams }: { searchParams: SearchParams }) {
  const step = (await searchParams).step;
  const initial = STAGES.find((s) => s === step) ?? "agent";
  return <Walkthrough key={initial} initialStage={initial} />;
}
