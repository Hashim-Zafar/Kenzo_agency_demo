import type { Metadata } from "next";
import { TourShell } from "@/components/tour/TourShell";
import { customerTour } from "@/lib/tour/tours";

export const metadata: Metadata = { title: "Your customer's view · Kenzo" };

export default function CustomerTourPage() {
  return <TourShell tour={customerTour} />;
}
