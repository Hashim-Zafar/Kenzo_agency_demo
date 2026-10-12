import type { Metadata } from "next";
import { AgencyTour } from "@/components/agency/AgencyTour";

export const metadata: Metadata = { title: "Your view · Kenzo" };

export default function AgencyTourPage() {
  return <AgencyTour />;
}
