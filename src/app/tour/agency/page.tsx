import type { Metadata } from "next";
import { TourShell } from "@/components/tour/TourShell";
import { agencyTour } from "@/lib/tour/tours";

export const metadata: Metadata = { title: "Your view · Kenzo" };

export default function AgencyTourPage() {
  return <TourShell tour={agencyTour} />;
}
