import type { Metadata } from "next";
import localFont from "next/font/local";
import { WarmKenzo } from "@/components/WarmKenzo";
import "./globals.css";

// Self-hosted, from the Kenzo design system (SIL Open Font License 1.1).
const aspekta = localFont({
  src: "./fonts/Aspekta-Variable.woff2",
  variable: "--font-aspekta",
  weight: "100 900",
  display: "swap",
});

const unbounded = localFont({
  src: "./fonts/Unbounded-Variable-latin.woff2",
  variable: "--font-unbounded",
  weight: "200 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kenzo",
  description: "See Kenzo from your customers' side and from yours.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${aspekta.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <WarmKenzo />
        {children}
      </body>
    </html>
  );
}
