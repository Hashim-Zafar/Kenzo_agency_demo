import Image from "next/image";
import type { MascotPose } from "@/lib/tour/types";

// Source art is low-res (~170–240px wide) placeholder cutouts.
// Replace with high-res transparent PNGs (or SVG) before launch.
const POSES: Record<MascotPose, { src: string; w: number; h: number; alt: string }> = {
  wave: { src: "/mascot/kenzo-wave.png", w: 179, h: 295, alt: "Kenzo waving" },
  laptop: { src: "/mascot/kenzo-laptop.png", w: 233, h: 252, alt: "Kenzo typing on a laptop" },
  envelope: { src: "/mascot/kenzo-envelope.png", w: 171, h: 265, alt: "Kenzo holding an envelope" },
  notepad: { src: "/mascot/kenzo-notepad.png", w: 167, h: 275, alt: "Kenzo writing on a notepad" },
};

export function Mascot({
  pose,
  className = "",
  priority = false,
}: {
  pose: MascotPose;
  className?: string;
  priority?: boolean;
}) {
  const p = POSES[pose];
  return (
    <Image
      src={p.src}
      width={p.w}
      height={p.h}
      alt={p.alt}
      priority={priority}
      className={`h-auto select-none ${className}`}
      draggable={false}
    />
  );
}
