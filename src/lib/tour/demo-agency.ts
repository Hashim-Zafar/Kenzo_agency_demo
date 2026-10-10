/**
 * Facts about the DEMO agency the tour copy needs. The Kenzo API never
 * reveals thresholds or rules (by design), so they live here.
 * If you change the demo agency's config in the database, update this file.
 */
export const demoAgency = {
  /** How the minimum reads in Kenzo's tips. */
  minimumLabel: "£2,500 a month",
  /** What the tour suggests typing to land under the minimum. */
  belowMinimumExample: "around £2k a month",
  /** Question where the "just type it" tip appears. null = the first number question. */
  typingMetric: null as string | null,
};
