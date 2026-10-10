export type MascotPose = "wave" | "laptop" | "envelope" | "notepad";

/** Which scene component renders on the stage for a step. */
export type SceneKey =
  | "customer-intro"
  | "customer-agent"
  | "customer-booking"
  | "customer-confirmation"
  | "customer-reminders"
  | "agency-intro"
  | "agency-booked"
  | "agency-brief"
  | "agency-dashboard"
  | "tour-end";

export type TourStep = {
  id: string;
  scene: SceneKey;
  pose: MascotPose;
  /** Short label for the progress rail. */
  label: string;
  /** What Kenzo the mascot says on this step. */
  narration: string;
  /** Step exists in the flow but its scene isn't built yet. */
  pending?: boolean;
};

export type Tour = {
  id: "customer" | "agency";
  title: string;
  steps: TourStep[];
  /** Where the final step leads. */
  next?: { href: string; label: string };
};
