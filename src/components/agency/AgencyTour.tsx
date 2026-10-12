"use client";

import Link from "next/link";
import { useState } from "react";
import { Guide } from "@/components/tour/Guide";
import { firstStopOf, STOPS, stopHint, type Screen } from "@/lib/agency/tour";
import type { Hint } from "@/lib/tour/hints";
import { useIsMobile } from "@/lib/useIsMobile";
import { CardStory } from "./CardStory";
import {
  CostsScreen,
  DashboardShell,
  InboxScreen,
  KnowledgeScreen,
  LeadScreen,
  LeadsScreen,
  OverviewScreen,
  RulesScreen,
  TeamScreen,
} from "./Dashboard";

/** The agency's side: on larger screens their inbox and real dashboard with
 *  Kenzo walking through it; on phones, one card at a time. */
export function AgencyTour() {
  return useIsMobile() ? <CardStory /> : <DesktopTour />;
}

const END: Hint = {
  id: "agency:end",
  target: null,
  pose: "celebrate",
  eyebrow: "That's the tour",
  title: "Leads in, qualified calls out",
  body: "Your customers get a conversation instead of a form. You get qualified, booked calls, a brief before each one, and a dashboard that shows where every lead went.",
  primary: { label: "Start again", action: "restart" },
  back: true,
};

function DesktopTour() {
  const [i, setI] = useState(0);
  const [ended, setEnded] = useState(false);
  const [guideOn, setGuideOn] = useState(true);
  // The visitor can open another question on the Rules screen; the tour's
  // own choice applies again once they move on.
  const [ruleOverride, setRuleOverride] = useState<{ stop: number; open: number } | null>(null);

  const stop = STOPS[i];
  const screen = stop.screen;
  const openRule = ruleOverride?.stop === i ? ruleOverride.open : (stop.openRule ?? 0);

  const go = (next: number) => {
    const target = Math.max(0, Math.min(STOPS.length - 1, next));
    if (STOPS[target].screen !== screen) window.scrollTo({ top: 0 });
    setEnded(false);
    setI(target);
  };
  const toScreen = (s: Screen) => go(firstStopOf(s));

  const hint = ended ? END : stopHint(i);
  const onPrimary = () => {
    if (ended) {
      go(0);
      return;
    }
    if (i === STOPS.length - 1) setEnded(true);
    else go(i + 1);
  };
  const onBack = () => (ended ? setEnded(false) : go(i - 1));

  return (
    <div className="flex min-h-dvh flex-col bg-page text-fg" style={{ "--tour-header-h": "65px" } as React.CSSProperties}>
      <header className="sticky top-0 z-(--z-frame) flex h-(--tour-header-h) items-center gap-6 border-b-(length:--border-width-default) border-line bg-page px-10">
        <Link href="/" className="font-display text-xl font-semibold text-brand">
          Kenzo
        </Link>
        <nav aria-label="Whose view" className="flex gap-1 rounded-control border-(length:--border-width-default) border-line-strong bg-surface p-1">
          <Link href="/tour/customer" className="flex min-h-9 items-center rounded-control px-4 text-sm font-semibold text-fg-muted hover:bg-surface-muted">
            Your customer&apos;s view
          </Link>
          <span aria-current="page" className="flex min-h-9 items-center rounded-control bg-accent-soft px-4 text-sm font-semibold text-accent-pressed">
            Your view
          </span>
        </nav>
        <span className="flex-1" />
        <button type="button" onClick={() => setGuideOn((v) => !v)} className="min-h-10 rounded-control px-3 text-sm font-semibold text-fg-muted hover:bg-surface-muted">
          {guideOn ? "Hide guide" : "Show guide"}
        </button>
        <button type="button" onClick={() => go(0)} className="min-h-10 rounded-control px-3 text-sm font-semibold text-fg-muted hover:bg-surface-muted">
          Start again
        </button>
      </header>

      {screen === "inbox" ? (
        <InboxScreen email={stop.email ?? "booked"} />
      ) : (
        <DashboardShell screen={screen} onNav={toScreen}>
          {screen === "overview" && <OverviewScreen onOpenLead={() => toScreen("lead")} />}
          {screen === "leads" && <LeadsScreen onOpenLead={() => toScreen("lead")} />}
          {screen === "lead" && <LeadScreen onBack={() => toScreen("leads")} />}
          {screen === "costs" && <CostsScreen />}
          {screen === "rules" && <RulesScreen open={openRule} setOpen={(n) => setRuleOverride({ stop: i, open: n })} />}
          {screen === "knowledge" && <KnowledgeScreen />}
          {screen === "team" && <TeamScreen onOpenLead={() => toScreen("lead")} />}
        </DashboardShell>
      )}

      {(guideOn || ended) && <Guide key={hint.id} hint={hint} onPrimary={onPrimary} onBack={onBack} busy={false} />}
    </div>
  );
}
