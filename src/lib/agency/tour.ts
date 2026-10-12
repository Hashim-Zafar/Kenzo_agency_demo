import type { Hint } from "@/lib/tour/hints";

/** The agency's side of the tour: their inbox, then their dashboard. */
export type Screen = "inbox" | "overview" | "leads" | "lead" | "costs" | "rules" | "knowledge" | "team";

export type Stop = {
  screen: Screen;
  /** data-tour value(s) Kenzo points at ("a|b" = both as one area). */
  target: string;
  title: string;
  body: string;
  /** Inbox: which email is open. Rules: which question is open (0 = none). */
  email?: "booked" | "brief";
  openRule?: number;
};

export const SCREEN_LABEL: Record<Screen, string> = {
  inbox: "Your inbox",
  overview: "Overview",
  leads: "Leads",
  lead: "Lead detail",
  costs: "Costs",
  rules: "Qualification rules",
  knowledge: "Knowledge base",
  team: "Team & handlers",
};

export const STOPS: Stop[] = [
  { screen: "inbox", target: "email", email: "booked", title: "You know before you open the dashboard",
    body: "The moment a lead books, you get who, when, what they want and how they qualified. Nothing to copy out of a form." },
  { screen: "inbox", target: "email", email: "brief", title: "Never walk into a call blind",
    body: "30 minutes before the call, whoever takes it gets a brief Kenzo wrote from the conversation: her situation, budget, worries and how to open." },

  { screen: "overview", target: "kpis", title: "Your month in five numbers",
    body: "Every lead Kenzo handled, how many qualified, booked and turned up. The last one is new: leads under your budget floor that Kenzo talked round and booked anyway." },
  { screen: "overview", target: "funnel", title: "Where leads fall away",
    body: "Each bar is a share of everyone who started a chat. A form only shows you who finished. Kenzo shows you every step before that." },
  { screen: "overview", target: "dropoff", title: "Which question loses people",
    body: "Here the budget question loses 38%. Kenzo flags it and tells you what to try: reword it, or tighten your ad targeting." },
  { screen: "overview", target: "dq", title: "Why leads didn’t make it",
    body: "Every lead that didn’t qualify, grouped by what happened. If most fail on budget, your ads may be reaching people who can’t afford you." },
  { screen: "overview", target: "recovered", title: "Leads a form would have lost",
    body: "Each of these came in below your minimum, talked it through with Kenzo and booked. Click one to read the whole conversation." },
  { screen: "overview", target: "sources", title: "Which ads bring good leads",
    body: "Kenzo reads the UTM tags on every lead, so you see qualified rate and bookings for each campaign, not just clicks." },

  { screen: "leads", target: "tabs", title: "Every lead, sorted for you",
    body: "Kenzo files each lead by how far it got: in progress, qualified, booked, attended, no-show or disqualified. The numbers update as it happens." },
  { screen: "leads", target: "lead-row", title: "Their answers, in one row",
    body: "Budget, timeline and decision-maker for every lead, side by side. Sarah Khan just booked. Click any name for the full story." },
  { screen: "leads", target: "tools-search|tools-source|tools-period|tools-export", title: "Find anyone in seconds",
    body: "Search by name, email or even an answer. Filter by ad source or period, and export to CSV for your CRM." },

  { screen: "lead", target: "convo", title: "The whole conversation, word for word",
    body: "Marked where it matters: when her budget came in below your minimum, when Kenzo talked it through, and when she qualified." },
  { screen: "lead", target: "brief", title: "Your call brief, written for you",
    body: "Kenzo turns the conversation into a brief and sends it to your handler 30 minutes before the call: her situation, budget, worries and how to open." },
  { screen: "lead", target: "qual", title: "Checked against your rules",
    body: "Each answer next to the rule you set, so you can see exactly why she qualified." },
  { screen: "lead", target: "booking|asked", title: "The call, and what she asked",
    body: "When the call is, who takes it and which reminders have gone out. Next to it, what she asked Kenzo, including the one question your documents couldn’t answer." },

  { screen: "costs", target: "stats", title: "What Kenzo costs you, live",
    body: "Spent so far, where the month will land, and what each booked meeting and qualified lead costs you." },
  { screen: "costs", target: "daily", title: "Day by day",
    body: "Click any day to see what it cost and what it bought: conversations, qualified leads and bookings." },
  { screen: "costs", target: "split", title: "Where the money goes",
    body: "AI, hosting, database and email, each on its own line. No bundled mystery fee." },
  { screen: "costs", target: "alerts", title: "You set the limit",
    body: "Get an email at an amount you choose, or pause Kenzo at a cap. When paused, leads see your normal contact form, so nobody is lost." },
  { screen: "costs", target: "invoices", title: "Invoices in one place",
    body: "Every month, ready to download as a PDF for your accounts." },

  { screen: "rules", target: "rule-list", openRule: 0, title: "Your questions, your rules",
    body: "These are the questions Kenzo just asked as your customer. Drag to reorder. Each one shows its pass rule, or none: a question can just collect information for the call." },
  { screen: "rules", target: "pass-rule", openRule: 2, title: "Hard rules and soft rules",
    body: "A hard rule must be met. A soft rule has a floor: between the floor and your target the lead still books, marked warm. Below the floor, Kenzo offers to talk it through instead of turning them away." },
  { screen: "rules", target: "quick-replies|examples", openRule: 2, title: "Buttons, and how people really answer",
    body: "Set the quick replies leads can tap, and add examples of how people phrase it, like “around 3k”, so Kenzo reads typed answers correctly." },
  { screen: "rules", target: "preview", openRule: 2, title: "See what the lead sees",
    body: "A live preview of the question you’re editing, exactly as a lead will see it." },
  { screen: "rules", target: "summary", openRule: 0, title: "Every rule at a glance",
    body: "The whole set on one card. Change a number here and the next lead is judged by it. No developer needed." },

  { screen: "knowledge", target: "kb-url|kb-import|kb-upload|kb-drop", title: "Teach Kenzo about your agency",
    body: "Upload PDFs, Word docs or text files, or import a page from your website. Kenzo reads each one for you." },
  { screen: "knowledge", target: "docs", title: "Kenzo only answers from these",
    body: "When a lead asks something, Kenzo answers from these documents and nothing else. If a file can’t be read, it tells you why and what to upload instead." },

  { screen: "team", target: "people", title: "Who takes the calls",
    body: "Add your team, set their working days and hours, and switch off “Takes new bookings” when someone’s away. Kenzo only books people who are free." },
  { screen: "team", target: "week", title: "This week’s calls",
    body: "Every booked call by person and day. Click one to open the lead and the brief. That’s your whole dashboard, and Kenzo keeps it filled for you." },
];

export function firstStopOf(screen: Screen): number {
  return STOPS.findIndex((s) => s.screen === screen);
}

/** Kenzo's tip for stop i, in the shape the guide understands. */
export function stopHint(i: number): Hint {
  const s = STOPS[i];
  const last = i === STOPS.length - 1;
  const next = STOPS[i + 1];
  const nextLabel = last ? "Finish" : next.screen !== s.screen ? `Next: ${SCREEN_LABEL[next.screen]}` : "Next";
  const inScreen = STOPS.filter((x) => x.screen === s.screen);
  return {
    id: `agency:${i}`,
    target: s.target,
    pose: last ? "celebrate" : "point",
    eyebrow: `${SCREEN_LABEL[s.screen]} · ${inScreen.indexOf(s) + 1} of ${inScreen.length}`,
    title: s.title,
    body: s.body,
    primary: { label: nextLabel, action: "next" },
    back: i > 0,
  };
}
