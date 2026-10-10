import type { Metadata } from "next";
import { Walkthrough } from "@/components/walkthrough/Walkthrough";

export const metadata: Metadata = { title: "Your customer's view · Kenzo" };

export default function CustomerTourPage() {
  return <Walkthrough />;
}
