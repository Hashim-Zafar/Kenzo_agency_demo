/**
 * Sample data for the agency's side of the tour. All made up: Northpoint Media
 * is a fictional agency, and the phone number is from Ofcom's drama range.
 * It follows on from the customer side: Sarah Khan typed a budget under the
 * floor, talked it through, agreed £3,000 and booked a call.
 */

export const AGENCY = "Northpoint Media";
export const AGENCY_DOMAIN = "northpointmedia.co.uk";

export const kpis = [
  { label: "Leads handled", value: "240", note: "+18% vs last period" },
  { label: "Qualified", value: "98", note: "41% of leads" },
  { label: "Meetings booked", value: "67", note: "68% of qualified" },
  { label: "Show rate", value: "80%", note: "54 of 67 attended" },
  { label: "Recovered by Kenzo", value: "7", note: "below threshold → booked" },
];

export const funnel = [
  { label: "Started chat", n: 240, p: 100 },
  { label: "Finished", n: 172, p: 72 },
  { label: "Qualified", n: 98, p: 41 },
  { label: "Booked", n: 67, p: 28 },
  { label: "Attended", n: 54, p: 22 },
];

export const dropoff = [
  { q: "Q1 What do you need help with?", short: "Q1 Help with", p: 6 },
  { q: "Q2 Monthly budget", short: "Q2 Monthly budget", p: 38 },
  { q: "Q3 Decision-maker", short: "Q3 Decision-maker", p: 11 },
  { q: "Q4 When to start", short: "Q4 When to start", p: 9 },
];

export const notQualified = [
  { label: "Budget below minimum", p: 62 },
  { label: "Timeline too far out", p: 17 },
  { label: "Not the decision-maker", p: 12 },
  { label: "Service not offered", p: 9 },
];

export const recovered = [
  { name: "Sarah K.", note: "£1,500 → £3,000" },
  { name: "Dan P.", note: "Asked to discuss → booked" },
  { name: "Priya M.", note: "£2,200 → £3,000" },
];

export const sources = [
  { name: "Meta — Lookalike", leads: 96, booked: 34, rate: 52 },
  { name: "Google — Search", leads: 61, booked: 19, rate: 44 },
  { name: "Meta — Broad", leads: 58, booked: 6, rate: 17 },
  { name: "Organic / direct", leads: 25, booked: 8, rate: 40 },
];

export type LeadStatus = "In progress" | "Qualified" | "Booked" | "Attended" | "No-show" | "Disqualified";

export const statusCounts: { label: "All" | LeadStatus; count: number }[] = [
  { label: "All", count: 1240 },
  { label: "In progress", count: 22 },
  { label: "Qualified", count: 131 },
  { label: "Booked", count: 13 },
  { label: "Attended", count: 54 },
  { label: "No-show", count: 2 },
  { label: "Disqualified", count: 1018 },
];

export type Lead = {
  name: string;
  status: LeadStatus;
  detail: string;
  source: string;
  budget: string;
  timeline: string;
  dm: string;
  date: string;
};

export const leads: Lead[] = [
  { name: "Sarah Khan", status: "Booked", detail: "Thu 15 Oct, 11:00", source: "Meta — Lookalike", budget: "£3,000", timeline: "This month", dm: "Yes", date: "Today 09:14" },
  { name: "Tom Reid", status: "Qualified", detail: "not booked yet", source: "Google — Search", budget: "£4,000", timeline: "1–3 months", dm: "Yes", date: "Today 08:02" },
  { name: "Amy Brooks", status: "In progress", detail: "question 2 of 4", source: "Organic / direct", budget: "—", timeline: "—", dm: "—", date: "Today 07:40" },
  { name: "Lucy Hart", status: "Disqualified", detail: "budget", source: "Meta — Broad", budget: "£600", timeline: "Not sure", dm: "No", date: "Yesterday" },
  { name: "Dan Patel", status: "Attended", detail: "met 3 Oct", source: "Meta — Lookalike", budget: "£3,000", timeline: "This month", dm: "Yes", date: "Yesterday" },
  { name: "Jon Lee", status: "No-show", detail: "missed 1 Oct · follow-up sent", source: "Google — Search", budget: "£2,800", timeline: "1–3 months", dm: "Yes", date: "1 Oct" },
  { name: "Priya Mehta", status: "Booked", detail: "Fri 16 Oct, 14:30", source: "Meta — Lookalike", budget: "£3,000", timeline: "This month", dm: "Shared", date: "1 Oct" },
  { name: "Mark Owen", status: "Disqualified", detail: "timeline", source: "Meta — Broad", budget: "£900", timeline: "6+ months", dm: "No", date: "30 Sep" },
  { name: "Ella Moss", status: "Attended", detail: "met 29 Sep", source: "Google — Search", budget: "£5,000", timeline: "This month", dm: "Yes", date: "29 Sep" },
  { name: "Kofi Mensah", status: "Qualified", detail: "not booked yet", source: "Meta — Lookalike", budget: "£3,200", timeline: "1–3 months", dm: "Yes", date: "29 Sep" },
  { name: "Hannah Cole", status: "Disqualified", detail: "not decision-maker", source: "Meta — Broad", budget: "£2,600", timeline: "This month", dm: "No", date: "28 Sep" },
  { name: "Ryan Doyle", status: "No-show", detail: "missed 27 Sep · rebooked", source: "Organic / direct", budget: "£3,000", timeline: "1–3 months", dm: "Yes", date: "27 Sep" },
  { name: "Zara Ahmed", status: "Attended", detail: "met 26 Sep", source: "Google — Search", budget: "£4,500", timeline: "This month", dm: "Yes", date: "26 Sep" },
  { name: "Ben Turner", status: "Disqualified", detail: "budget", source: "Meta — Broad", budget: "£400", timeline: "Not sure", dm: "Yes", date: "25 Sep" },
  { name: "Grace Liu", status: "Booked", detail: "Mon 19 Oct, 10:00", source: "Meta — Lookalike", budget: "£3,000", timeline: "This month", dm: "Yes", date: "25 Sep" },
  { name: "Omar Farah", status: "Disqualified", detail: "service not offered", source: "Google — Search", budget: "£2,000", timeline: "1–3 months", dm: "Yes", date: "24 Sep" },
];

/** Sarah's conversation, as the dashboard shows it. A flag marks a moment. */
export type ConvoLine = { who: "Kenzo" | "Sarah"; t: string; text: string } | { flag: string };

export const sarah = {
  name: "Sarah Khan",
  contact: "sarah@khanphysio.co.uk · +44 7700 900123 · Meta — Lookalike · Today 09:14",
  convo: [
    { who: "Kenzo", t: "09:14", text: "Hi Sarah, happy to help. What do you need help with?" },
    { who: "Sarah", t: "09:14", text: "Paid social and Google Ads for my physio clinic. Mainly private patients." },
    { who: "Kenzo", t: "09:15", text: "Got it. Roughly what monthly budget do you have for ads?" },
    { who: "Sarah", t: "09:15", text: "Around £1,500 a month." },
    { flag: "Below minimum · £1,500 vs £3,000" },
    { who: "Kenzo", t: "09:15", text: "Thanks for being upfront. Clinics we work with usually start at £3,000 a month. At that level a similar practice got 38% more private bookings in three months. Is that within reach?" },
    { who: "Sarah", t: "09:16", text: "What would the extra £1,500 actually go on?" },
    { who: "Kenzo", t: "09:16", text: "More reach on Meta and Google when people search for physio, and new ads tested every fortnight. Below £3,000 there isn’t enough spend to learn what works." },
    { who: "Sarah", t: "09:17", text: "Ok, £3,000 is fine if the results are there." },
    { flag: "Recovered · budget now £3,000" },
    { who: "Kenzo", t: "09:17", text: "Who makes the final decision?" },
    { who: "Sarah", t: "09:17", text: "Me, it is my clinic." },
    { who: "Kenzo", t: "09:17", text: "And when do you want to start?" },
    { who: "Sarah", t: "09:18", text: "This month ideally." },
    { flag: "Qualified · moved to booking" },
    { who: "Kenzo", t: "09:18", text: "Great. Here are a few times next week." },
    { who: "Sarah", t: "09:18", text: "Thursday 11 works." },
  ] satisfies ConvoLine[],
  brief: [
    { h: "Situation", items: ["Owns a 6-person physio clinic in Leeds; mostly NHS referrals today.", "Wants more private patients from paid social and Google. Gets about 12 a month now.", "Ran Meta ads herself last year; stopped after 2 months."] },
    { h: "Budget", items: ["Opened at £1,500/mo. Agreed £3,000 after Kenzo explained what the extra spend buys.", "Said “fine if the results are there”, so expect questions about guarantees."] },
    { h: "Concerns", items: ["A previous agency “got clicks, no bookings”. Lead with how you report bookings, not reach.", "Wants to know who does the creative."] },
    { h: "Suggested opening", items: ["Recap her goal in one line, then walk through the clinic case study numbers."] },
    { h: "Unanswered", items: ["Contract length — not in your knowledge base. Have your standard terms ready."] },
  ],
  qualification: [
    { q: "Service", a: "Paid social, Google Ads", rule: "Offered service" },
    { q: "Monthly budget", a: "£3,000", rule: "At least £3,000" },
    { q: "Decision-maker", a: "Me", rule: "Not someone else" },
    { q: "Start", a: "This month", rule: "Not just exploring" },
  ],
  booking: { when: "Thu 15 Oct, 11:00", handler: "Sam Ali", reminders: "24h sent · 3h, 30m next" },
  asked: [
    { q: "Do you work with clinics?", a: "Answered" },
    { q: "How long is the contract?", a: "Not answered" },
  ],
};

export const costs = {
  stats: [
    { label: "Spent so far", value: "£18.40" },
    { label: "Projected month-end", value: "£41.20" },
    { label: "Last month", value: "£36.90" },
    { label: "Per booked meeting", value: "£0.27" },
    { label: "Per qualified lead", value: "£0.19" },
  ],
  /** 30 days from 15 Sep, in twentieths of a pound (as the wireframe). */
  daily: [20, 24, 18, 22, 26, 30, 21, 19, 23, 25, 28, 34, 62, 70, 58, 44, 38, 33, 30, 29, 27, 31, 35, 32, 30, 28, 26, 40, 46, 42],
  split: [
    { label: "AI", v: "£11.20", p: 61 },
    { label: "Hosting", v: "£3.60", p: 20 },
    { label: "Database & storage", v: "£2.10", p: 11 },
    { label: "Email", v: "£1.50", p: 8 },
  ],
  invoices: [
    { m: "September 2026", v: "£36.90", s: "Paid" },
    { m: "August 2026", v: "£31.40", s: "Paid" },
    { m: "July 2026", v: "£28.75", s: "Paid" },
  ],
};

export function costDay(i: number): string {
  const d = 15 + i;
  return d <= 30 ? `${d} Sep` : `${d - 30} Oct`;
}

export type RuleQuestion = {
  metric: string;
  question: string;
  answerType: string;
  description: string;
  purpose: string;
  rule: string | null;
  operator: string;
  threshold: string;
  failure: "soft" | "hard" | null;
  minimum: string | null;
  options: { label: string; value: string }[];
  examples: string[];
};

/** The demo agency's four questions, as the customer just answered them. */
export const rules: RuleQuestion[] = [
  {
    metric: "services", question: "What do you need help with?", answerType: "Pick several",
    description: "The services the lead is interested in.", purpose: "Know what the lead wants help with, so the call starts in the right place.",
    rule: null, operator: "", threshold: "", failure: null, minimum: null,
    options: [{ label: "Paid social", value: "paid_social" }, { label: "Google Ads", value: "google_ads" }, { label: "SEO", value: "seo" }, { label: "Content", value: "content" }],
    examples: ["Facebook and Instagram ads", "Google search ads", "a bit of everything"],
  },
  {
    metric: "monthly_ad_budget", question: "What is your monthly ad budget?", answerType: "Number",
    description: "What the lead spends, or is ready to spend, on ads each month.", purpose: "Check the lead can spend enough on ads for us to get results.",
    rule: "≥ £3,000", operator: "At least (≥)", threshold: "3000", failure: "soft", minimum: "2000",
    options: [{ label: "£1,000", value: "1000" }, { label: "£2,000", value: "2000" }, { label: "£3,000", value: "3000" }, { label: "£5,000+", value: "5000" }],
    examples: ["£1,500 a month", "around 3k", "£4,000"],
  },
  {
    metric: "decision_maker", question: "Who makes the final decision?", answerType: "Pick one",
    description: "Who approves working with the agency.", purpose: "Make sure the person on the call can say yes.",
    rule: "≠ Someone else", operator: "Is not (≠)", threshold: "someone_else", failure: "soft", minimum: null,
    options: [{ label: "Me", value: "me" }, { label: "Me and a partner", value: "shared" }, { label: "Someone else", value: "someone_else" }],
    examples: ["I own the business", "me and my co-founder", "my manager decides"],
  },
  {
    metric: "start_timeline", question: "When do you want to start?", answerType: "Pick one",
    description: "How soon the lead wants to start.", purpose: "Know how soon the lead wants to start.",
    rule: "≠ Just exploring", operator: "Is not (≠)", threshold: "exploring", failure: "soft", minimum: null,
    options: [{ label: "This month", value: "this_month" }, { label: "In 1–3 months", value: "one_to_three" }, { label: "Just exploring", value: "exploring" }],
    examples: ["as soon as possible", "after Christmas", "just looking for now"],
  },
];

export const documents = [
  { name: "Pricing & packages 2026.pdf", type: "Pricing", status: "Processing", note: "reading pages", size: "1.2 MB", date: "Just now" },
  { name: "How we work.docx", type: "Process", status: "Processing", note: "queued", size: "340 KB", date: "Just now" },
  { name: "Services overview.pdf", type: "Services", status: "Ready", note: "", size: "2.4 MB", date: "2 Oct" },
  { name: "Clinic case study.pdf", type: "Case study", status: "Ready", note: "", size: "860 KB", date: "28 Sep" },
  { name: "Results by budget tier.pdf", type: "Case study", status: "Ready", note: "", size: "410 KB", date: "28 Sep" },
  { name: "Old brochure scan.pdf", type: "Other", status: "Couldn’t read", note: "scanned image, upload a text version", size: "6.1 MB", date: "20 Sep" },
  { name: "FAQs.txt", type: "FAQ", status: "Ready", note: "", size: "18 KB", date: "20 Sep" },
] as const;

type Call = { t: string; name: string; kind?: "done" | "wait" | "off" };
export const team = [
  { name: "Alex Morgan", ini: "AM", role: "Supervisor", hours: "9:00–17:00", days: [1, 1, 1, 1, 1, 0, 0], week: 1, next: "—", on: false, note: "Only gets escalations", calls: [[], [{ t: "15:00", name: "Escalated · Omar F.", kind: "done" }], [], [], []] as Call[][] },
  { name: "Sam Ali", ini: "SA", role: "Handler", hours: "9:00–17:00", days: [1, 1, 1, 1, 1, 0, 0], week: 5, next: "Thu 11:00", on: true, note: "Kenzo assigns them booked calls", calls: [[{ t: "10:00", name: "Dan P.", kind: "done" }], [{ t: "11:30", name: "Tom R.", kind: "done" }], [], [{ t: "11:00", name: "Sarah K." }, { t: "16:00", name: "Grace L." }], [{ t: "09:30", name: "Ella M.", kind: "wait" }]] as Call[][] },
  { name: "Chloe Grant", ini: "CG", role: "Handler", hours: "10:00–18:00", days: [1, 1, 1, 1, 0, 0, 0], week: 4, next: "Thu 14:30", on: true, note: "Kenzo assigns them booked calls", calls: [[{ t: "14:00", name: "Zara A.", kind: "done" }], [], [{ t: "10:30", name: "Kofi M." }, { t: "15:00", name: "Ryan D." }], [{ t: "14:30", name: "Priya M.", kind: "wait" }], [{ t: "", name: "Not working", kind: "off" }]] as Call[][] },
  { name: "Ravi Shah", ini: "RS", role: "Backup", hours: "Hours not set", days: [0, 0, 0, 0, 0, 0, 0], week: 0, next: "—", on: false, note: "Only gets escalations", calls: [[], [], [], [], []] as Call[][] },
];
export const weekDays = ["Mon 12", "Tue 13", "Wed 14", "Thu 15 · today", "Fri 16"];
