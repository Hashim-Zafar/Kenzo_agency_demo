"use client";

import { useState } from "react";
import {
  AGENCY,
  AGENCY_DOMAIN,
  BUDGET,
  costDay,
  costs,
  documents,
  dropoff,
  funnel,
  kpis,
  leads,
  notQualified,
  recovered,
  rules,
  sarah,
  sources,
  statusCounts,
  team,
  weekDays,
  type LeadStatus,
} from "@/lib/agency/sample";
import type { Screen } from "@/lib/agency/tour";

/*
 * The agency dashboard, laid out as in the "Kenzo Dashboard Wireframes"
 * (Overview, Leads, Lead detail, Costs, Qualification rules, Knowledge base,
 * Team & handlers) with sample data. Buttons that would change settings are
 * for show: nothing here talks to a server.
 */

const NAV: { screen: Exclude<Screen, "inbox" | "lead">; label: string }[] = [
  { screen: "overview", label: "Overview" },
  { screen: "leads", label: "Leads" },
  { screen: "costs", label: "Costs" },
  { screen: "rules", label: "Qualification rules" },
  { screen: "knowledge", label: "Knowledge base" },
  { screen: "team", label: "Team & handlers" },
];

export function DashboardShell({
  screen,
  onNav,
  children,
}: {
  screen: Screen;
  onNav: (s: Screen) => void;
  children: React.ReactNode;
}) {
  const active = screen === "lead" ? "leads" : screen;
  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Dashboard" className="sticky top-0 flex h-[calc(100dvh-var(--tour-header-h,64px))] w-(--dash-nav-width) shrink-0 flex-col gap-0.5 border-r-(length:--border-width-default) border-line-strong bg-dash-nav px-2.5 py-4">
        <div className="px-2.5 pt-1 pb-3.5 font-display text-lg font-semibold">kenzo</div>
        {NAV.map((n) => (
          <button
            key={n.screen}
            type="button"
            onClick={() => onNav(n.screen)}
            aria-current={active === n.screen ? "page" : undefined}
            className={`rounded-button px-2.5 py-2 text-left text-sm transition ${
              active === n.screen ? "bg-line-strong font-semibold text-fg" : "text-fg-muted hover:bg-line"
            }`}
          >
            {n.label}
          </button>
        ))}
        <div className="mt-auto px-2.5 text-xs text-fg-subtle">{AGENCY}</div>
      </nav>
      <main data-tour-zone="main" className="flex min-w-0 flex-1 flex-col gap-3 px-6 py-5">
        <div className="mx-auto flex w-full max-w-(--dash-max-width) flex-col gap-3">{children}</div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- bits */

function Card({ children, className = "", tour, label }: { children: React.ReactNode; className?: string; tour?: string; label?: string }) {
  return (
    <section data-tour={tour} aria-label={label} className={`min-w-0 rounded-card border-default bg-surface p-4 ${className}`}>
      {children}
    </section>
  );
}

function H2({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="m-0 flex-1 font-display text-sm font-medium">{children}</h2>
      {note && <span className="text-xs text-fg-subtle">{note}</span>}
    </div>
  );
}

function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-2.5">
      <div className="min-w-0 flex-1">
        <h1 className="m-0 font-display text-[22px] font-semibold">{title}</h1>
        {sub && <div className="mt-0.5 text-xs text-fg-subtle">{sub}</div>}
      </div>
      {children}
    </header>
  );
}

const SAMPLE = <span className="border-b border-dashed border-control text-xs text-fg-subtle">Sample data</span>;
const btn = "min-h-10 rounded-button border-default bg-surface px-3 text-sm hover:bg-surface-muted";
const btnDark = "min-h-10 rounded-button bg-inverse px-3 text-sm font-semibold text-inverse-fg";
const input = "min-h-10 rounded-button border-default bg-surface px-2.5 text-sm";

/** A row of small ticks, filled to p% (the wireframe's bar style). */
function Ticks({ p, n, small = false }: { p: number; n: number; small?: boolean }) {
  const on = Math.round((p / 100) * n);
  return (
    <div className={`flex min-w-0 flex-1 gap-0.5 ${small ? "h-3.5" : "h-[22px]"}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className={`min-w-px flex-1 rounded-[1px] ${i < on ? "bg-chart" : "bg-chart-track"}`} />
      ))}
    </div>
  );
}

function Meter({ label, value, p }: { label: string; value: string; p: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Ticks p={p} n={40} small />
    </div>
  );
}

/* ---------------------------------------------------------------- inbox */

export function InboxScreen({ email }: { email: "booked" | "brief" }) {
  const mails = [
    { id: "brief", from: "Kenzo", when: email === "brief" ? "now" : "", subject: "Your brief: Sarah Khan, 11:00", sub: "In 30 minutes · Join Zoom", show: email === "brief" },
    { id: "booked", from: "Kenzo", when: email === "booked" ? "now" : "Mon", subject: "New booking: Sarah Khan", sub: "Thu 15 Oct 2026, 11:00 am", show: true },
    { id: "inv", from: "Accounts", when: "Fri", subject: "Invoice #2041", sub: "", show: true },
    { id: "notes", from: "Chloe", when: "Fri", subject: "Team standup notes", sub: "", show: true },
  ].filter((m) => m.show);
  return (
    <div className="flex flex-1 items-start justify-center p-8">
      <section aria-label="Your inbox" className="flex h-[640px] w-full max-w-[960px] flex-col overflow-hidden rounded-frame border-default bg-surface shadow-frame">
        <div className="flex items-center justify-between border-b-(length:--border-width-default) border-line px-5 py-3">
          <span className="font-semibold">Inbox</span>
          <span className="text-sm text-fg-subtle">you@{AGENCY_DOMAIN}</span>
        </div>
        <div className="flex min-h-0 flex-1">
          <ul className="m-0 w-[300px] shrink-0 list-none border-r-(length:--border-width-default) border-line p-0">
            {mails.map((m) => {
              const open = m.id === email;
              return (
                <li key={m.id} className={`border-b-(length:--border-width-default) border-line px-4 py-3 ${open ? "bg-accent-soft" : ""}`}>
                  <div className="flex justify-between text-sm">
                    <span className={open ? "font-semibold" : "text-fg-muted"}>{m.from}</span>
                    <span className="text-xs text-fg-subtle">{m.when}</span>
                  </div>
                  <div className={`truncate text-sm ${open ? "font-semibold" : ""}`}>{m.subject}</div>
                  {m.sub && <div className="truncate text-xs text-fg-subtle">{m.sub}</div>}
                </li>
              );
            })}
          </ul>
          <div className="min-w-0 flex-1 overflow-y-auto p-6">
            <article data-tour="email" key={email} className="flex animate-rise flex-col gap-4 rounded-card p-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">From Kenzo · to you</span>
              {email === "booked" ? (
                <>
                  <h2 className="m-0 font-display text-xl font-semibold">New booking: Sarah Khan</h2>
                  <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-fg-subtle">When</dt>
                    <dd className="m-0 font-semibold">Thursday 15 Oct 2026, 11:00 am (UK time)</dd>
                    <dt className="text-fg-subtle">Wants</dt>
                    <dd className="m-0 font-semibold">Paid social, Google Ads</dd>
                    <dt className="text-fg-subtle">Budget</dt>
                    <dd className="m-0 font-semibold">
                      {BUDGET.target} / mo <span className="font-normal text-fg-subtle">(agreed after talking it through)</span>
                    </dd>
                    <dt className="text-fg-subtle">Decides</dt>
                    <dd className="m-0 font-semibold">She does</dd>
                    <dt className="text-fg-subtle">Handler</dt>
                    <dd className="m-0 font-semibold">{sarah.booking.handler}</dd>
                  </dl>
                </>
              ) : (
                <>
                  <h2 className="m-0 font-display text-xl font-semibold">Your brief: Sarah Khan, 11:00</h2>
                  <Brief />
                </>
              )}
              <div className="flex gap-2.5">
                <span className="rounded-button bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg">Open in dashboard</span>
                <span className="rounded-button border-default px-4 py-2.5 text-sm font-semibold">Join Zoom</span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

function Brief() {
  return (
    <div className="flex flex-col">
      {sarah.brief.map((b, i) => (
        <div key={b.h}>
          <h3 className={`mb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle ${i ? "mt-3" : "mt-0"}`}>{b.h}</h3>
          <ul className="m-0 pl-[18px] text-sm leading-relaxed">
            {b.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- overview */

export function OverviewScreen({ onOpenLead }: { onOpenLead: () => void }) {
  return (
    <>
      <PageHead title="Overview">
        {SAMPLE}
        <button type="button" className={btn}>Last 30 days ▾</button>
      </PageHead>

      <section data-tour="kpis" aria-label="Key numbers" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-card border-default bg-surface p-4">
            <div className="text-xs text-fg-subtle">{k.label}</div>
            <div className="mt-0.5 text-[26px] font-semibold tracking-tight">{k.value}</div>
            <div className="text-xs text-fg-subtle">{k.note}</div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-stretch gap-3">
        <Card tour="funnel" label="Funnel" className="flex flex-[3_1_520px] flex-col gap-3">
          <H2 note="% of chats started">Funnel</H2>
          {funnel.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-[92px] text-sm">{f.label}</div>
              <Ticks p={f.p} n={60} />
              <span className="min-w-10 border-default px-1.5 py-0.5 text-center text-xs font-semibold">{f.p}%</span>
              <div className="w-9 text-right text-sm font-semibold">{f.n}</div>
            </div>
          ))}
        </Card>
        <Card tour="dropoff" label="Drop-off by question" className="flex flex-[2_1_320px] flex-col gap-2.5">
          <H2>Drop-off by question</H2>
          {dropoff.map((d) => (
            <Meter key={d.q} label={d.q} value={`${d.p}%`} p={d.p} />
          ))}
          <div className="border-t-(length:--border-width-default) border-line pt-2.5 text-sm leading-snug">
            <strong>Q2 Budget loses 38%.</strong> Reword it, or tighten ad targeting.
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <Card tour="dq" label="Why leads didn't qualify" className="flex flex-[1_1_320px] flex-col gap-2.5">
          <H2>Why leads didn&apos;t qualify</H2>
          {notQualified.map((r) => (
            <Meter key={r.label} label={r.label} value={`${r.p}%`} p={r.p} />
          ))}
          <div className="text-xs text-fg-subtle">Mostly budget → ads may reach people who can&apos;t afford you.</div>
        </Card>
        <Card tour="recovered" label="Recovered leads" className="flex flex-[1_1_280px] flex-col gap-1.5">
          <div className="mb-1">
            <H2>Recovered leads</H2>
          </div>
          {recovered.map((r) => (
            <button key={r.name} type="button" onClick={onOpenLead} className="flex justify-between gap-2 border-b-(length:--border-width-default) border-line py-2.5 text-left text-sm hover:bg-surface-muted">
              <span className="font-semibold">{r.name}</span>
              <span className="text-fg-subtle">{r.note}</span>
            </button>
          ))}
          <span className="mt-1 text-xs text-fg-subtle underline">View all 7 →</span>
        </Card>
        <Card tour="sources" label="Lead quality by ad source" className="flex flex-[2_1_460px] flex-col gap-2 overflow-x-auto">
          <H2 note="From UTM tags">Quality by ad source</H2>
          <table className="w-full min-w-[440px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-fg-subtle">
                <th className="py-1.5 pr-1.5 font-medium">Campaign</th>
                <th className="p-1.5 font-medium">Leads</th>
                <th className="p-1.5 font-medium">Booked</th>
                <th className="w-2/5 p-1.5 font-medium">Qualified rate</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.name} className="border-t-(length:--border-width-default) border-line">
                  <td className="py-2 pr-1.5">{s.name}</td>
                  <td className="p-1.5">{s.leads}</td>
                  <td className="p-1.5">{s.booked}</td>
                  <td className="p-1.5">
                    <div className="flex items-center gap-2">
                      <Ticks p={s.rate} n={30} small />
                      <strong className="w-9 text-right">{s.rate}%</strong>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- leads */

const STATUS_STYLE: Record<LeadStatus, string> = {
  Attended: "font-semibold text-fg",
  Booked: "font-semibold text-accent-pressed",
  Qualified: "font-semibold text-fg-muted",
  "In progress": "italic text-fg-muted",
  "No-show": "text-fg-muted underline decoration-dotted underline-offset-[3px]",
  Disqualified: "text-fg-subtle",
};

function compact(n: number) {
  return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
}

export function LeadsScreen({ onOpenLead }: { onOpenLead: () => void }) {
  const [filter, setFilter] = useState<"All" | LeadStatus>("All");
  const rows = leads.filter((l) => filter === "All" || l.status === filter);
  const total = statusCounts.find((s) => s.label === filter)?.count ?? 0;
  return (
    <>
      <PageHead title="Leads">
        {SAMPLE}
        <label data-tour="tools-search" className="flex">
          <span className="sr-only">Search leads</span>
          <input type="search" placeholder="Search name, email or answer…" className={`${input} w-[280px] max-w-full`} />
        </label>
        <label data-tour="tools-source" className="flex">
          <span className="sr-only">Source</span>
          <select className={input}>
            <option>All sources</option>
            <option>Meta — Lookalike</option>
            <option>Google — Search</option>
          </select>
        </label>
        <label data-tour="tools-period" className="flex">
          <span className="sr-only">Period</span>
          <select className={input}>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>All time</option>
          </select>
        </label>
        <button type="button" data-tour="tools-export" className={btn}>Export CSV</button>
      </PageHead>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-card border-default bg-surface">
        <div data-tour="tabs" role="group" aria-label="Filter by status" className="flex gap-0.5 overflow-x-auto border-b-(length:--border-width-default) border-line px-2">
          {statusCounts.map((s) => {
            const on = s.label === filter;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setFilter(s.label)}
                title={`${s.count.toLocaleString("en-GB")} leads`}
                className={`inline-flex min-h-[42px] items-center gap-1.5 border-b-2 px-3 text-sm whitespace-nowrap ${on ? "border-fg font-semibold text-fg" : "border-transparent text-fg-subtle"}`}
              >
                {s.label}
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${on ? "bg-inverse text-inverse-fg" : "bg-line text-fg-muted"}`}>{compact(s.count)}</span>
              </button>
            );
          })}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-surface-muted text-left text-fg-subtle">
                {["Lead", "Status", "Source", "Budget", "Timeline", "Decision-maker", "Date"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} data-tour={r.name === "Sarah Khan" ? "lead-row" : undefined} className="border-t-(length:--border-width-default) border-line hover:bg-surface-muted">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button type="button" onClick={onOpenLead} className="font-semibold underline underline-offset-2">{r.name}</button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={STATUS_STYLE[r.status]}>{r.status}</span> <span className="text-xs text-fg-subtle">{r.detail}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.source}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.budget}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.timeline}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.dm}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-fg-subtle">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t-(length:--border-width-default) border-line px-3 py-2">
          <span className="text-xs text-fg-subtle">{rows.length < 6 ? `${total} of ${total}` : `1–${Math.min(50, total)} of ${total.toLocaleString("en-GB")}`}</span>
          <div className="flex gap-1.5">
            <button type="button" className={btn}>Previous</button>
            <button type="button" className={btn}>Next</button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- lead detail */

export function LeadScreen({ onBack }: { onBack: () => void }) {
  return (
    <>
      <header>
        <button type="button" onClick={onBack} className="text-xs text-fg-subtle hover:text-fg">← All leads</button>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
          <h1 className="m-0 font-display text-[22px] font-semibold">{sarah.name}</h1>
          <span className="border-l-[3px] border-accent pl-2 text-sm font-semibold">Booked</span>
          <span className="text-xs text-fg-subtle">{sarah.contact}</span>
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-3">
        <section data-tour="convo" aria-label="Conversation" className="flex max-h-[calc(100dvh-180px)] min-w-0 flex-[3_1_440px] flex-col rounded-card border-default bg-surface">
          <div className="flex items-baseline justify-between border-b-(length:--border-width-default) border-line px-3.5 pt-3 pb-2">
            <h2 className="m-0 font-display text-sm font-medium">Conversation</h2>
            <span className="text-xs text-fg-subtle">19 messages · 5 min</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3.5">
            {sarah.convo.map((m, i) =>
              "flag" in m ? (
                <div key={i} className="my-1 flex items-center gap-2.5 text-xs font-semibold text-accent-pressed">
                  <span className="flex-1 border-t border-dashed border-accent-soft-line" />
                  {m.flag}
                  <span className="flex-1 border-t border-dashed border-accent-soft-line" />
                </div>
              ) : (
                <div key={i} className={m.who === "Kenzo" ? "flex" : "flex justify-end"}>
                  <div className={`max-w-[78%] rounded-button px-3 py-2 ${m.who === "Kenzo" ? "border-default bg-surface" : "bg-line"}`}>
                    <div className="mb-0.5 text-xs text-fg-subtle">
                      {m.who} · {m.t}
                    </div>
                    <div className="text-sm leading-normal">{m.text}</div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <div className="flex min-w-0 flex-[2_1_360px] flex-col gap-3">
          <section data-tour="brief" aria-label="AI call brief" className="rounded-card border-strong border-fg bg-surface">
            <div className="flex items-baseline justify-between px-3.5 pt-3 pb-2">
              <h2 className="m-0 font-display text-sm font-medium">AI call brief</h2>
              <span className="text-xs text-fg-subtle">Sent to handler 30 min before</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto px-3.5 pb-3.5">
              <Brief />
            </div>
          </section>

          <section data-tour="qual" aria-label="Qualification" className="rounded-card border-default bg-surface">
            <div className="flex items-baseline justify-between px-3.5 pt-3 pb-2">
              <h2 className="m-0 font-display text-sm font-medium">Qualification</h2>
              <span className="text-xs text-fg-subtle">4 of 4 met</span>
            </div>
            <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-2 px-3.5 pb-1.5 text-xs text-fg-subtle">
              <span>Metric</span>
              <span>Answer</span>
              <span>Your rule</span>
            </div>
            {sarah.qualification.map((a) => (
              <div key={a.q} className="grid grid-cols-[1.1fr_1fr_1fr] items-baseline gap-2 border-t-(length:--border-width-default) border-line px-3.5 py-1.5 text-sm">
                <span className="text-fg-subtle">{a.q}</span>
                <strong>{a.a}</strong>
                <span className="text-fg-subtle">{a.rule}</span>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <section data-tour="booking" aria-label="Booking" className="rounded-card border-default bg-surface">
              <div className="flex items-baseline justify-between px-3.5 pt-3 pb-2">
                <h2 className="m-0 font-display text-sm font-medium">Booking</h2>
                <span className="text-xs text-fg-subtle underline">Join Zoom</span>
              </div>
              {[
                ["When", sarah.booking.when],
                ["Handler", sarah.booking.handler],
                ["Reminders", sarah.booking.reminders],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2.5 border-t-(length:--border-width-default) border-line px-3.5 py-1.5 text-sm">
                  <span className="text-fg-subtle">{k}</span>
                  <strong className="text-right">{v}</strong>
                </div>
              ))}
            </section>
            <section data-tour="asked" aria-label="Questions asked" className="rounded-card border-default bg-surface">
              <div className="flex items-baseline justify-between px-3.5 pt-3 pb-2">
                <h2 className="m-0 font-display text-sm font-medium">Lead asked</h2>
                <span className="text-xs text-fg-subtle">{sarah.asked.length}</span>
              </div>
              {sarah.asked.map((a) => (
                <div key={a.q} className="flex justify-between gap-2.5 border-t-(length:--border-width-default) border-line px-3.5 py-1.5 text-sm">
                  <span>{a.q}</span>
                  <span className="shrink-0 text-fg-subtle">{a.a}</span>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- costs */

export function CostsScreen() {
  const [sel, setSel] = useState(13);
  const avg = costs.daily.reduce((a, b) => a + b, 0) / costs.daily.length / 20;
  const c = costs.daily[sel] / 20;
  const diff = Math.round((c / avg - 1) * 100);
  const gbp = (x: number) => `£${x.toFixed(2)}`;
  const shades = ["bg-chart", "bg-fg-muted", "bg-chart-mid", "bg-line-strong"];
  return (
    <>
      <PageHead title="Running costs">
        {SAMPLE}
        <button type="button" className={btn}>October 2026 ▾</button>
      </PageHead>

      <section data-tour="stats" aria-label="This month" className="flex flex-wrap rounded-card border-default bg-surface">
        {costs.stats.map((s) => (
          <div key={s.label} className="min-w-0 flex-[1_1_150px] border-r-(length:--border-width-default) border-line px-4 py-3 last:border-r-0">
            <div className="text-xs text-fg-subtle">{s.label}</div>
            <div className="mt-0.5 text-2xl font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </section>

      <Card tour="daily" label="Daily usage" className="flex flex-wrap gap-4">
        <div className="flex min-w-0 flex-[3_1_480px] flex-col gap-2">
          <H2 note="Last 30 days · click a day">Daily cost</H2>
          <div className="flex gap-2">
            <div className="flex h-[180px] w-7 flex-col justify-between text-right text-xs text-fg-subtle">
              <span>£4</span>
              <span>£2</span>
              <span>£0</span>
            </div>
            <div className="relative h-[180px] min-w-0 flex-1">
              <div className="absolute inset-x-0 top-0 border-t-(length:--border-width-default) border-line" />
              <div className="absolute inset-x-0 top-1/2 border-t-(length:--border-width-default) border-line" />
              <div className="absolute inset-0 flex items-end gap-[3px] border-b-(length:--border-width-default) border-control">
                {costs.daily.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSel(i)}
                    aria-label={`${costDay(i)}: ${gbp(v / 20)}`}
                    title={`${costDay(i)}: ${gbp(v / 20)}`}
                    className={`min-w-1 flex-1 transition ${i === sel ? "bg-chart" : "bg-chart-mid/60 hover:bg-fg-muted"}`}
                    style={{ height: `${Math.round((v / 20 / 4) * 100)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between pl-9 text-xs text-fg-subtle">
            <span>15 Sep</span>
            <span>22 Sep</span>
            <span>29 Sep</span>
            <span>6 Oct</span>
            <span>14 Oct</span>
          </div>
        </div>
        <aside aria-label="Selected day" className="flex min-w-0 flex-[1_1_220px] flex-col border-l-(length:--border-width-default) border-line pl-4">
          <div className="text-xs text-fg-subtle">
            {costDay(sel)}
            {sel === 13 ? " · busiest day" : ""}
          </div>
          <div className="my-0.5 text-2xl font-semibold">{gbp(c)}</div>
          <div className="mb-2 text-xs text-fg-subtle">
            {diff >= 0 ? `${diff}% above` : `${Math.abs(diff)}% below`} your daily average ({gbp(avg)})
          </div>
          {[
            ["Conversations", String(Math.round(costs.daily[sel] * 0.6))],
            ["Qualified", String(Math.round(costs.daily[sel] * 0.25))],
            ["Booked", String(Math.round(costs.daily[sel] * 0.12))],
            ["AI", gbp(c * 0.61)],
            ["Hosting · DB · email", gbp(c * 0.39)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-t-(length:--border-width-default) border-line py-1.5 text-sm">
              <span className="text-fg-subtle">{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </aside>
      </Card>

      <div className="flex flex-wrap items-stretch gap-3">
        <Card tour="split" label="Where the money goes" className="flex flex-[2_1_420px] flex-col gap-2.5">
          <H2>Where this month&apos;s £18.40 went</H2>
          <div className="flex h-[18px] gap-0.5">
            {costs.split.map((d, i) => (
              <div key={d.label} className={shades[i]} style={{ flex: `${d.p} 1 0` }} />
            ))}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-5">
            {costs.split.map((d, i) => (
              <div key={d.label} className="flex items-center justify-between gap-2.5 border-t-(length:--border-width-default) border-line py-1.5 text-sm">
                <span className="flex items-center gap-2">
                  <i className={`size-2.5 ${shades[i]}`} aria-hidden="true" />
                  {d.label}
                </span>
                <span>
                  <strong>{d.v}</strong> <span className="text-xs text-fg-subtle">{d.p}%</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card tour="alerts" label="Alerts and cap" className="flex flex-[1_1_280px] flex-col gap-2">
          <H2>Alerts &amp; limit</H2>
          <label className="flex items-center gap-2.5 text-sm">
            Email me at <input type="text" defaultValue="£40" className={`${input} w-20`} />
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" className="size-[18px]" />
            Pause at <input type="text" defaultValue="£60" className={`${input} w-20`} />
          </label>
          <div className="text-xs text-fg-subtle">If paused, leads see your normal contact form.</div>
        </Card>
      </div>

      <section data-tour="invoices" aria-label="Invoices" className="overflow-x-auto rounded-card border-default bg-surface">
        <div className="px-4 pt-3 pb-1">
          <H2>Invoices</H2>
        </div>
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <tbody>
            {costs.invoices.map((i) => (
              <tr key={i.m} className="border-t-(length:--border-width-default) border-line">
                <td className="px-4 py-2">{i.m}</td>
                <td className="px-4 py-2 font-semibold">{i.v}</td>
                <td className="px-4 py-2 text-fg-subtle">{i.s}</td>
                <td className="px-4 py-2 text-right underline">Download PDF</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="m-0 text-xs leading-normal text-fg-subtle">Metered by Kenzo for your account at Cloudflare&apos;s published rates. Shown in GBP; billed in USD at the day&apos;s exchange rate.</p>
    </>
  );
}

/* ---------------------------------------------------------------- rules */

const h3 = "m-0 text-xs font-semibold uppercase tracking-wider text-fg-subtle";
const field = "flex min-w-0 flex-col gap-1 text-sm text-fg-subtle";
const fieldInput = `${input} w-full text-fg`;

export function RulesScreen({ open, setOpen }: { open: number; setOpen: (n: number) => void }) {
  const current = rules[(open || 1) - 1];
  return (
    <>
      <PageHead title="Qualification questions" sub="Edit what Kenzo asks and the answers you accept. How Kenzo holds the conversation is managed by Kenzo.">
        <button type="button" className={btn}>View as JSON</button>
        <button type="button" className={btnDark}>Save changes</button>
      </PageHead>

      <div className="flex flex-wrap items-start gap-3">
        <div data-tour="rule-list" className="flex min-w-0 flex-[3_1_520px] flex-col gap-2">
          {rules.map((q, i) => {
            const n = i + 1;
            const isOpen = n === open;
            return (
              <div key={q.metric} className={`rounded-card border-default bg-surface p-4 ${isOpen ? "border-fg" : ""}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span aria-hidden="true" className="cursor-grab text-lg text-fg-subtle">⋮⋮</span>
                  <span className="w-[18px] text-sm font-semibold text-fg-subtle">{n}</span>
                  <div className="min-w-0 flex-[1_1_240px]">
                    <div className="text-[15px] font-semibold">{q.question}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-fg-subtle">{q.metric}</span>
                      <span className="text-xs text-fg-subtle">
                        · {q.rule ? `${q.rule}${q.minimum ? ` (warm from £${Number(q.minimum).toLocaleString("en-GB")})` : ""}` : "No rule · used in the call brief"}
                      </span>
                      {q.failure && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                          <i className={`size-2 border-[1.5px] ${q.failure === "hard" ? "border-fg bg-fg" : "border-fg-subtle"}`} aria-hidden="true" />
                          {q.failure === "soft" ? "Soft" : "Hard"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => setOpen(isOpen ? 0 : n)} className={btn}>
                    {isOpen ? "Close" : "Edit"}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-3 flex flex-col gap-4 border-t-(length:--border-width-default) border-line pt-3.5">
                    <div className="flex flex-col gap-3">
                      <h3 className={h3}>Question</h3>
                      <label className={field}>
                        Question Kenzo asks
                        <input className={fieldInput} defaultValue={q.question} />
                      </label>
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                        <label className={field}>
                          Metric key
                          <input className={`${fieldInput} bg-page font-mono text-fg-subtle`} readOnly defaultValue={q.metric} />
                          <span className="text-xs">Fixed after creation — reports use it.</span>
                        </label>
                        <label className={field}>
                          Answer type
                          <select className={fieldInput} defaultValue={q.answerType}>
                            <option>Number</option>
                            <option>Pick one</option>
                            <option>Pick several</option>
                            <option>Yes / no</option>
                          </select>
                        </label>
                      </div>
                      <label className={field}>
                        Description
                        <textarea rows={2} className={`${fieldInput} py-2`} defaultValue={q.description} />
                        <span className="text-xs">What this answer means.</span>
                      </label>
                      <label className={field}>
                        Purpose
                        <textarea rows={2} className={`${fieldInput} py-2`} defaultValue={q.purpose} />
                        <span className="text-xs">Why you ask. Shown to Kenzo when a lead asks why.</span>
                      </label>
                    </div>

                    <div data-tour="pass-rule" className="flex flex-col gap-3">
                      <h3 className={h3}>Pass rule</h3>
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
                        <label className={field}>
                          Operator
                          <select className={fieldInput} defaultValue={q.operator}>
                            <option>At least (≥)</option>
                            <option>At most (≤)</option>
                            <option>Equals (=)</option>
                            <option>Is not (≠)</option>
                          </select>
                        </label>
                        <label className={field}>
                          Threshold
                          <input className={fieldInput} defaultValue={q.threshold} />
                        </label>
                      </div>
                      <div className="text-sm text-fg-subtle">Failure type</div>
                      <div className="flex flex-wrap gap-2">
                        {(["soft", "hard"] as const).map((f) => (
                          <label key={f} className={`flex flex-[1_1_220px] items-start gap-2.5 rounded-button border-default p-3 text-sm ${q.failure === f ? "border-fg bg-surface-muted" : ""}`}>
                            <input type="radio" name={`fail-${q.metric}`} defaultChecked={q.failure === f} className="mt-0.5 size-[18px]" />
                            <span>
                              <strong>{f === "soft" ? "Soft" : "Hard"}</strong>
                              <br />
                              <span className="text-xs text-fg-subtle">{f === "soft" ? "Kenzo can talk it through before deciding." : "Must be met to qualify."}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      {q.alternative && (
                        <label className={field}>
                          Alternative offer
                          <input className={fieldInput} defaultValue={q.alternative} />
                          <span className="text-xs">Kenzo may offer this instead of the target while talking it through.</span>
                        </label>
                      )}
                      {q.minimum && (
                        <label className={`${field} max-w-[320px]`}>
                          Warm floor
                          <input className={fieldInput} defaultValue={q.minimum} />
                          <span className="text-xs">From here up to the target, the lead still books, marked warm. Below it, Kenzo offers to talk it through.</span>
                        </label>
                      )}
                    </div>

                    <div data-tour="quick-replies" className="flex flex-col gap-3">
                      <h3 className={h3}>Quick-reply options</h3>
                      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 text-xs text-fg-subtle">
                        <span>Label</span>
                        <span>Value</span>
                        <span />
                      </div>
                      {q.options.map((o) => (
                        <div key={o.value} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2">
                          <input aria-label="Option label" className={fieldInput} defaultValue={o.label} />
                          <input aria-label="Option value" className={`${fieldInput} font-mono`} defaultValue={o.value} />
                          <button type="button" aria-label="Remove option" className={`${btn} w-11 px-0`}>✕</button>
                        </div>
                      ))}
                      <button type="button" className={`${btn} self-start border-dashed`}>+ Add option</button>
                      <label className="flex min-h-11 items-center gap-2.5 text-sm">
                        <input type="checkbox" defaultChecked className="size-5" />
                        Let leads type their own answer
                      </label>
                    </div>

                    <div data-tour="examples" className="flex flex-col gap-3">
                      <h3 className={h3}>Example answers</h3>
                      <div className="text-xs text-fg-subtle">Ways leads might phrase it. Helps Kenzo read free-text answers.</div>
                      <div className="flex flex-wrap gap-2">
                        {q.examples.map((e) => (
                          <span key={e} className="inline-flex items-center gap-1.5 rounded border-default bg-surface-muted py-0.5 pr-0.5 pl-2.5 text-sm">
                            {e}
                            <span aria-hidden="true" className="w-6 text-center text-fg-subtle">×</span>
                          </span>
                        ))}
                      </div>
                      <div className="flex max-w-[460px] gap-2">
                        <input aria-label="New example answer" placeholder="Add an example…" className={`${fieldInput} flex-1`} />
                        <button type="button" className={btn}>Add</button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between gap-2 border-t-(length:--border-width-default) border-line pt-4">
                      <button type="button" className={`${btn} text-danger-fg`}>Delete question</button>
                      <button type="button" onClick={() => setOpen(0)} className={btn}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button type="button" className={`${btn} self-start border-dashed`}>+ Add question</button>
        </div>

        <aside className="flex min-w-0 flex-[2_1_300px] flex-col gap-3">
          <Card tour="preview" label="What the lead sees" className="flex flex-col gap-3">
            <H2>What the lead sees</H2>
            <div className="text-xs text-fg-subtle">Preview of the open question.</div>
            <div className="flex flex-col gap-2.5 rounded-card bg-page p-3.5">
              <div className="max-w-[90%] rounded-card border-default bg-surface px-3.5 py-2.5 text-sm">{current.question}</div>
              <div className="flex flex-wrap gap-1.5">
                {current.options.map((o) => (
                  <span key={o.value} className="rounded border-(length:--border-width-default) border-control bg-surface px-2.5 py-1.5 text-sm">{o.label}</span>
                ))}
              </div>
              <div className="rounded border-default bg-surface px-3 py-2 text-sm text-fg-subtle">Or type your answer…</div>
            </div>
          </Card>
          <Card tour="summary" label="Summary" className="flex flex-col gap-2.5">
            <H2>Summary</H2>
            {rules.map((q) => (
              <div key={q.metric} className="flex justify-between gap-2 border-b border-dashed border-line py-2 text-sm">
                <span className="font-mono">{q.metric}</span>
                <span>{q.rule ?? "No rule"}</span>
              </div>
            ))}
            <div className="text-xs text-fg-subtle">Hard rules must all pass. Soft rules use their warm floor; questions without a rule only feed the call brief.</div>
          </Card>
        </aside>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- knowledge */

export function KnowledgeScreen() {
  return (
    <>
      <PageHead title="Knowledge base" sub="Kenzo answers leads’ questions only from these documents.">
        <label data-tour="kb-url" className="flex">
          <span className="sr-only">Import from URL</span>
          <input type="url" placeholder={`https://${AGENCY_DOMAIN}/services`} className={`${input} w-[300px] max-w-full`} />
        </label>
        <button type="button" data-tour="kb-import" className={btn}>Import URL</button>
        <button type="button" data-tour="kb-upload" className={btnDark}>Upload files</button>
      </PageHead>

      <section className="flex flex-col overflow-hidden rounded-card border-default bg-surface">
        <div className="flex flex-wrap items-center gap-2.5 border-b-(length:--border-width-default) border-line px-4 py-3">
          <div className="flex-1">
            <H2>Documents</H2>
          </div>
          <span className="text-xs text-fg-subtle">7 documents · 2 processing · 1 needs attention</span>
        </div>
        <div data-tour="kb-drop" className="mx-4 mt-3 mb-1 flex flex-wrap items-center gap-3 rounded-button border-[1.5px] border-dashed border-control bg-surface-muted px-4 py-3.5">
          <div className="flex-[1_1_260px]">
            <div className="text-sm font-semibold">Drop PDFs, Word docs or text files here</div>
            <div className="text-xs text-fg-subtle">Services, pricing, case studies, FAQs, process docs. Each one is read and added to Kenzo&apos;s knowledge automatically.</div>
          </div>
          <button type="button" className={btn}>Browse files</button>
        </div>
        <div className="overflow-x-auto">
          <table data-tour="docs" className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-surface-muted text-left text-fg-subtle">
                {["Document", "Type", "Status", "Size", "Added"].map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">{h}</th>
                ))}
                <th className="px-4 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.name} className="border-t-(length:--border-width-default) border-line">
                  <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{d.name}</td>
                  <td className="px-4 py-2.5 text-fg-subtle">{d.type}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={
                        d.status === "Ready"
                          ? "font-semibold"
                          : d.status === "Processing"
                            ? "italic text-fg-muted"
                            : "font-semibold text-danger-fg underline decoration-wavy underline-offset-[3px]"
                      }
                    >
                      {d.status}
                    </span>{" "}
                    {d.note && <span className="text-xs text-fg-subtle">— {d.note}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-fg-subtle">{d.size}</td>
                  <td className="px-4 py-2.5 text-fg-subtle">{d.date}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <span className="mr-3.5 underline">Replace</span>
                    <span className="underline">Remove</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- team */

export function TeamScreen({ onOpenLead }: { onOpenLead: () => void }) {
  const [on, setOn] = useState(() => team.map((p) => p.on));
  const shades = ["bg-line-strong text-fg", "bg-chart-mid/50 text-fg", "bg-chart-mid text-surface", "bg-fg-muted text-surface"];
  return (
    <>
      <PageHead title="Team & handlers" sub="Who takes Kenzo’s booked calls, and when they’re available.">
        <button type="button" className={btnDark}>+ Add person</button>
      </PageHead>

      <section data-tour="people" aria-label="People" className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-3.5">
        {team.map((p, i) => (
          <div key={p.name} className="flex flex-col rounded-card border-default bg-surface">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3.5">
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-card text-sm font-semibold ${shades[i]}`}>{p.ini}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">{p.name}</div>
                <div className="mt-0.5 text-xs text-fg-subtle">{p.role}</div>
              </div>
              <button type="button" className={`${btn} min-h-8 text-xs`}>Edit</button>
            </div>
            <div className="flex flex-col gap-2 px-4 pb-3.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-fg-subtle">Working days</span>
                <span className="font-semibold">{p.hours}</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {"MTWTFSS".split("").map((d, j) => (
                  <span key={j} className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${p.days[j] ? "text-fg" : "text-fg-subtle/60"}`}>
                    {d}
                    <i className={`block h-1 w-full ${p.days[j] ? "bg-chart" : "bg-chart-track"}`} />
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t-(length:--border-width-default) border-line px-4 py-3">
              <div>
                <div className="text-xs text-fg-subtle">Calls this week</div>
                <b className="text-lg">{p.week}</b>
              </div>
              <div>
                <div className="text-xs text-fg-subtle">Next call</div>
                <b className="text-lg">{p.next}</b>
              </div>
            </div>
            <div className="mt-auto flex items-center gap-3 rounded-b-card border-t-(length:--border-width-default) border-line bg-surface-muted px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">Takes new bookings</div>
                <div className="mt-px text-xs text-fg-subtle">{on[i] ? "Kenzo assigns them booked calls" : p.note}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on[i]}
                aria-label={`${p.name} takes new bookings`}
                onClick={() => setOn((o) => o.map((v, j) => (j === i ? !v : v)))}
                className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition ${on[i] ? "bg-inverse" : "bg-line-strong"}`}
              >
                <i className={`absolute top-0.5 size-[18px] rounded-full bg-surface shadow transition-all ${on[i] ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section data-tour="week" aria-label="This week's calls" className="overflow-x-auto rounded-card border-default bg-surface">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <div className="flex-1">
            <H2>This week&apos;s calls</H2>
          </div>
          <span className="text-xs text-fg-subtle">12–16 Oct</span>
          <button type="button" aria-label="Previous week" className={`${btn} min-h-8`}>‹</button>
          <button type="button" aria-label="Next week" className={`${btn} min-h-8`}>›</button>
        </div>
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[150px_repeat(5,minmax(0,1fr))] border-t-(length:--border-width-default) border-line bg-surface-muted">
            <div className="px-3.5 py-1.5 text-xs text-fg-subtle">Person</div>
            {weekDays.map((d, i) => (
              <div key={d} className={`border-l-(length:--border-width-default) border-line px-2 py-1.5 text-xs ${i === 3 ? "font-semibold text-fg" : "text-fg-subtle"}`}>{d}</div>
            ))}
          </div>
          {team.map((p) => (
            <div key={p.name} className="grid grid-cols-[150px_repeat(5,minmax(0,1fr))] border-t-(length:--border-width-default) border-line">
              <div className="flex min-w-0 items-center gap-2 px-3.5 py-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-line text-[10px] font-semibold">{p.ini}</span>
                <span className="truncate text-sm">{p.name}</span>
              </div>
              {p.calls.map((calls, di) => (
                <div key={di} className={`flex min-h-[54px] min-w-0 flex-col gap-1 border-l-(length:--border-width-default) border-line p-1.5 ${di === 3 ? "bg-surface-muted" : ""}`}>
                  {calls.map((c) =>
                    c.kind === "off" ? (
                      <span key={c.name} className="px-1.5 py-1 text-[11px] text-fg-subtle">{c.name}</span>
                    ) : (
                      <button
                        key={c.t + c.name}
                        type="button"
                        onClick={c.name === "Sarah K." ? onOpenLead : undefined}
                        title={`${c.t} — ${c.name}`}
                        className={`truncate border-l-[3px] px-1.5 py-1 text-left text-[11px] leading-tight ${
                          c.kind === "done" ? "border-fg bg-line-strong" : c.kind === "wait" ? "border-dashed border-fg-muted bg-surface-muted" : "border-accent bg-accent-soft"
                        }`}
                      >
                        <strong>{c.t}</strong> {c.name}
                      </button>
                    ),
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
