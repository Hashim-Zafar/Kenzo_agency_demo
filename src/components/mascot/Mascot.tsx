import Image from "next/image";

export type MascotPose =
  | "point-left"
  | "point-right"
  | "present"
  | "thinking"
  | "celebrate"
  | "phone"
  | "head"
  | "gesture"
  // older poses, still used by the agency tour
  | "wave"
  | "laptop"
  | "envelope"
  | "notepad";

const POSES: Record<MascotPose, { src: string; w: number; h: number; alt: string }> = {
  "point-left": { src: "/mascot/kenzo-point-left.webp", w: 573, h: 800, alt: "Kenzo pointing" },
  "point-right": { src: "/mascot/kenzo-point-right.webp", w: 555, h: 800, alt: "Kenzo pointing" },
  present: { src: "/mascot/kenzo-present.webp", w: 655, h: 800, alt: "Kenzo with arms open" },
  thinking: { src: "/mascot/kenzo-thinking.webp", w: 502, h: 800, alt: "Kenzo thinking" },
  celebrate: { src: "/mascot/kenzo-celebrate.webp", w: 623, h: 800, alt: "Kenzo celebrating" },
  phone: { src: "/mascot/kenzo-phone.webp", w: 569, h: 800, alt: "Kenzo holding a phone" },
  head: { src: "/mascot/kenzo-head.webp", w: 182, h: 256, alt: "Kenzo" },
  gesture: { src: "/mascot/kenzo-gesture-down.webp", w: 570, h: 800, alt: "Kenzo" },
  wave: { src: "/mascot/kenzo-wave.png", w: 179, h: 295, alt: "Kenzo waving" },
  laptop: { src: "/mascot/kenzo-laptop.png", w: 233, h: 252, alt: "Kenzo typing on a laptop" },
  envelope: { src: "/mascot/kenzo-envelope.png", w: 171, h: 265, alt: "Kenzo holding an envelope" },
  notepad: { src: "/mascot/kenzo-notepad.png", w: 167, h: 275, alt: "Kenzo writing on a notepad" },
};

export function Mascot({
  pose,
  className = "",
  priority = false,
  decorative = false,
  style,
}: {
  pose: MascotPose;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
  style?: React.CSSProperties;
}) {
  const p = POSES[pose];
  return (
    <Image
      src={p.src}
      width={p.w}
      height={p.h}
      alt={decorative ? "" : p.alt}
      priority={priority}
      className={`h-auto select-none ${className}`}
      style={style}
      draggable={false}
    />
  );
}
