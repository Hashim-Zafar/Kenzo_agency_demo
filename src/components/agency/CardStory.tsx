"use client";

import Link from "next/link";
import { useState } from "react";
import { Strip } from "@/components/tour/Guide";
import { AGENCY_DOMAIN, costs, dropoff, funnel, kpis, notQualified, recovered, sarah, sources } from "@/lib/agency/sample";
import type { Hint } from "@/lib/tour/hints";

/*
 * The agency's side on a phone. The full dashboard is made for a bigger
 * screen, so every part of it is told one card at a time. Kenzo's tip sits in
 * its own space at the bottom and never covers the card; a ring marks the
 * part he's talking about.
 */

type Card = { section: string; eyebrow: string; title: string; body: string; content: React.ReactNode };

const box = "rounded-card border-default bg-surface p-3.5";
const ringed = `${box} guide-ring`;
const muted = "text-xs text-fg-subtle";

function Bar({ p, dark = false }: { p: number; dark?: boolean }) {
  return (
    <div className="mt-1 h-2 overflow-hidden rounded-full bg-chart-track" aria-hidden="true">
      <i className={`block h-full rounded-full ${dark ? "bg-chart" : "bg-accent"}`} style={{ width: `${p}%` }} />
    </div>
  );
}

function Row({ left, right, sub, p, dark }: { left: React.ReactNode; right?: React.ReactNode; sub?: string; p?: number; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 border-t-(length:--border-width-default) border-line py-1.5 first:border-t-0">
      <div className="flex justify-between gap-2.5 text-sm">
        <span>{left}</span>
        {right !== undefined && <strong className="text-right">{right}</strong>}
      </div>
      {sub && <div className={muted}>{sub}</div>}
      {p !== undefined && <Bar p={p} dark={dark} />}
    </div>
  );
}

function Title({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mb-1 flex items-baseline justify-between">
      <strong className="text-sm">{children}</strong>
      {note && <span className={muted}>{note}</span>}
    </div>
  );
}

function Chip({ children, on = false }: { children: React.ReactNode; on?: boolean }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${on ? "bg-inverse text-inverse-fg" : "bg-surface-muted text-fg-muted"}`}>{children}</span>;
}

const CARDS: Card[] = [
  {
    section: "Your inbox",
    eyebrow: "The moment they book",
    title: "You know before you open anything",
    body: "Who, when, what they want and how they qualified, in your inbox the moment they book.",
    content: (
      <div className={`${ringed} flex flex-col gap-3`}>
        <div className="flex justify-between text-xs text-fg-subtle">
          <span className="font-semibold uppercase tracking-wider">Kenzo · email</span>
          <span>now</span>
        </div>
        <div className="text-lg font-semibold">New booking: Sarah Khan</div>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 text-sm">
          {[
            ["When", "Thu 15 Oct 2026, 11:00 am"],
            ["Wants", "Paid social, Google Ads"],
            ["Budget", "£3,000 / mo"],
            ["Decides", "She does"],
            ["Handler", sarah.booking.handler],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-fg-subtle">{k}</dt>
              <dd className="m-0 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <span className="self-start rounded-button bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg">Open in dashboard</span>
      </div>
    ),
  },
  {
    section: "Your inbox",
    eyebrow: "30 minutes before the call",
    title: "Never walk into a call blind",
    body: "Kenzo writes this from the conversation and sends it to whoever takes the call, 30 minutes before.",
    content: (
      <div className={`${ringed}`}>
        <div className="flex items-baseline justify-between">
          <strong>Your brief: Sarah Khan</strong>
          <span className={muted}>11:00 am</span>
        </div>
        {[
          ["Situation", ["Physio clinic in Leeds, 6 staff. Wants more private patients.", "Ran Meta ads herself; stopped after 2 months."]],
          ["Budget", ["Opened at £1,500. Agreed £3,000 after talking it through."]],
          ["Concerns", ["Last agency “got clicks, no bookings”."]],
          ["Suggested opening", ["Recap her goal, then show how you report bookings."]],
          ["Couldn’t answer", ["Contract length. Have your terms ready."]],
        ].map(([h, items]) => (
          <div key={h as string}>
            <h3 className="mt-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">{h}</h3>
            <ul className="m-0 pl-[18px] text-sm leading-normal">
              {(items as string[]).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
        <span className="mt-3.5 inline-block rounded-button bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg">Join Zoom</span>
      </div>
    ),
  },
  {
    section: "Overview",
    eyebrow: "Last 30 days · sample data",
    title: "Your month in five numbers",
    body: "Every lead handled, qualified, booked and turned up. The dark one is new: leads a form would have turned away.",
    content: (
      <>
        <div className="grid grid-cols-2 gap-2.5">
          {kpis.slice(0, 4).map((k) => (
            <div key={k.label} className={box}>
              <div className={muted}>{k.label}</div>
              <div className="mt-1 font-display text-2xl font-semibold">{k.value}</div>
              <div className={muted}>{k.note}</div>
            </div>
          ))}
        </div>
        <div className="guide-ring flex items-center gap-3.5 rounded-card bg-inverse p-3.5 text-inverse-fg">
          <div className="font-display text-[34px] font-semibold text-highlight">{kpis[4].value}</div>
          <div>
            <div className="font-semibold">Recovered by Kenzo</div>
            <div className="text-sm text-inverse-muted">Below your budget floor, booked anyway</div>
          </div>
        </div>
      </>
    ),
  },
  {
    section: "Overview",
    eyebrow: "Funnel",
    title: "See every step, not just the end",
    body: "A form only shows who finished. Kenzo shows how many started, finished, qualified, booked and turned up.",
    content: (
      <div className={ringed}>
        <Title note="% of chats started">Funnel</Title>
        {funnel.map((f) => (
          <Row key={f.label} left={f.label} right={f.p === 100 ? String(f.n) : `${f.n} · ${f.p}%`} p={f.p} dark />
        ))}
      </div>
    ),
  },
  {
    section: "Overview",
    eyebrow: "Where and why leads stop",
    title: "Know what to fix",
    body: "Which question loses the most people, and every lead that didn’t qualify grouped by the rule it missed.",
    content: (
      <>
        <div className={box}>
          <Title>Drop-off by question</Title>
          {dropoff.map((d) => (
            <Row key={d.q} left={d.short} right={`${d.p}%`} p={d.p} />
          ))}
          <div className="mt-1 border-t-(length:--border-width-default) border-line pt-2.5 text-sm">
            <strong>Budget loses 38%.</strong> Reword it, or tighten ad targeting.
          </div>
        </div>
        <div className={ringed}>
          <Title>Why leads didn’t qualify</Title>
          {notQualified.map((r) => (
            <Row key={r.label} left={r.label} right={`${r.p}%`} p={r.p} />
          ))}
        </div>
      </>
    ),
  },
  {
    section: "Overview",
    eyebrow: "Recovered leads",
    title: "Leads a form would have lost",
    body: "Each came in under your minimum, talked it through with Kenzo and booked. Tap one to read the conversation.",
    content: (
      <div className={ringed}>
        {recovered.map((r) => (
          <Row key={r.name} left={<strong>{r.name}</strong>} right={<span className="font-normal text-fg-subtle">{r.note}</span>} />
        ))}
        <div className="pt-2 text-sm text-fg-subtle">View all 7 →</div>
      </div>
    ),
  },
  {
    section: "Overview",
    eyebrow: "Quality by ad source · from UTM tags",
    title: "Which ads bring good leads",
    body: "Qualified rate and bookings for every campaign, not just clicks. Move budget to what actually books.",
    content: (
      <div className={ringed}>
        {sources.map((s) => (
          <Row key={s.name} left={<strong>{s.name}</strong>} right={`${s.rate}%`} sub={`${s.leads} leads · ${s.booked} booked`} p={s.rate} />
        ))}
      </div>
    ),
  },
  {
    section: "Leads",
    eyebrow: "Every lead, sorted",
    title: "Every lead, already filed",
    body: "By how far they got: in progress, qualified, booked, attended, no-show or disqualified. Search by name, email or any answer, and export to your CRM.",
    content: (
      <>
        <div className="rounded-control border-default bg-surface px-3.5 py-2.5 text-sm text-fg-subtle">Search name, email or answer…</div>
        <div className="flex flex-wrap gap-1.5">
          <Chip on>All 1.2k</Chip>
          <Chip>In progress 22</Chip>
          <Chip>Qualified 131</Chip>
          <Chip>Booked 13</Chip>
          <Chip>Attended 54</Chip>
          <Chip>No-show 2</Chip>
          <Chip>Disqualified 1k</Chip>
        </div>
        <div className={ringed}>
          <div className="flex justify-between">
            <strong>Sarah Khan</strong>
            <span className="text-sm font-semibold text-accent-pressed">Booked</span>
          </div>
          <div className="mt-0.5 text-sm text-fg-subtle">Thu 15 Oct, 11:00 · Meta — Lookalike</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip>£3,000</Chip>
            <Chip>This month</Chip>
            <Chip>Decides: yes</Chip>
          </div>
        </div>
        <div className={box}>
          <div className="flex justify-between">
            <strong>Tom Reid</strong>
            <span className="text-sm font-semibold text-fg-muted">Qualified</span>
          </div>
          <div className="text-sm text-fg-subtle">Not booked yet · £4,000</div>
        </div>
        <div className={box}>
          <div className="flex justify-between">
            <strong>Jon Lee</strong>
            <span className="text-sm text-fg-muted underline decoration-dotted">No-show</span>
          </div>
          <div className="text-sm text-fg-subtle">Missed 1 Oct · follow-up sent</div>
        </div>
        <div className={muted}>Filter by ad source or period · Export CSV</div>
      </>
    ),
  },
  {
    section: "Lead detail",
    eyebrow: "Sarah Khan · the conversation",
    title: "Read every word",
    body: "The whole conversation, marked where it mattered: when she came in low, when Kenzo talked it through, and when she qualified.",
    content: (
      <div className="flex flex-col gap-2">
        {sarah.convo.slice(2, 10).map((m, i) =>
          "flag" in m ? (
            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-accent-pressed">
              <span className="flex-1 border-t border-dashed border-accent-soft-line" />
              {m.flag}
              <span className="flex-1 border-t border-dashed border-accent-soft-line" />
            </div>
          ) : (
            <div
              key={i}
              className={`max-w-[85%] rounded-card px-3 py-2 text-[13px] leading-[19px] ${m.who === "Kenzo" ? "self-start border-default bg-surface" : "self-end bg-lead-bubble text-lead-bubble-fg"}`}
            >
              {m.text}
            </div>
          ),
        )}
        <div className="flex items-center gap-2 text-xs font-semibold text-accent-pressed">
          <span className="flex-1 border-t border-dashed border-accent-soft-line" />
          Qualified · moved to booking
          <span className="flex-1 border-t border-dashed border-accent-soft-line" />
        </div>
      </div>
    ),
  },
  {
    section: "Lead detail",
    eyebrow: "Sarah Khan · checked and booked",
    title: "Why she qualified, at a glance",
    body: "Each answer next to your rule, the booking with its reminders, and what she asked Kenzo, including what your documents couldn’t answer.",
    content: (
      <>
        <div className={ringed}>
          <Title note="4 of 4 met">Qualification</Title>
          {sarah.qualification.map((a) => (
            <Row key={a.q} left={<span className="text-fg-subtle">{a.q}</span>} right={<>{a.a} <span className="text-xs font-normal text-fg-subtle">· {a.rule.toLowerCase()}</span></>} />
          ))}
        </div>
        <div className={box}>
          <Title>Booking</Title>
          <Row left={<span className="text-fg-subtle">When</span>} right={sarah.booking.when} />
          <Row left={<span className="text-fg-subtle">Handler</span>} right={sarah.booking.handler} />
          <Row left={<span className="text-fg-subtle">Reminders</span>} right={<span className="font-normal">{sarah.booking.reminders}</span>} />
        </div>
        <div className={box}>
          <Title>She asked</Title>
          {sarah.asked.map((a) => (
            <Row key={a.q} left={a.q} right={<span className="font-normal text-fg-subtle">{a.a}</span>} />
          ))}
        </div>
      </>
    ),
  },
  {
    section: "Costs",
    eyebrow: "October 2026 · sample data",
    title: "Every penny, out in the open",
    body: "What you’ve spent, where the month will land, and what each meeting costs. Split by line, no bundled fee.",
    content: (
      <>
        <div className={ringed}>
          <div className={muted}>Spent so far</div>
          <div className="font-display text-3xl font-semibold">{costs.stats[0].value}</div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {costs.stats.slice(1).map((s) => (
              <div key={s.label}>
                <div className={muted}>{s.label}</div>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className={box}>
          <Title>Where it went</Title>
          {costs.split.map((d) => (
            <Row key={d.label} left={d.label} right={<>{d.v} <span className="font-normal text-fg-subtle">{d.p}%</span></>} />
          ))}
        </div>
      </>
    ),
  },
  {
    section: "Costs",
    eyebrow: "Day by day, limits and invoices",
    title: "You set the limit",
    body: "Get an email at an amount you pick, or pause at a cap. Paused means leads see your normal form, so nobody is lost. Invoices are here too.",
    content: (
      <>
        <div className={box}>
          <Title note="Tap a day">Daily cost</Title>
          <div className="mt-2.5 flex h-[70px] items-end gap-[3px] border-b-(length:--border-width-default) border-line-strong" aria-hidden="true">
            {costs.daily.map((v, i) => (
              <i key={i} className={`flex-1 rounded-t-[2px] ${i === 13 ? "bg-chart" : "bg-accent-soft-line"}`} style={{ height: `${Math.round((v / 70) * 100)}%` }} />
            ))}
          </div>
          <div className="mt-2 text-sm">
            <strong>28 Sep · £3.50</strong> <span className="text-fg-subtle">· 42 chats, 8 booked</span>
          </div>
        </div>
        <div className={ringed}>
          <Title>Alerts &amp; limit</Title>
          <Row left="Email me at" right="£40" />
          <Row left="Pause Kenzo at" right="£60" />
          <div className={`${muted} pt-1.5`}>If paused, leads see your normal contact form.</div>
        </div>
        <div className={box}>
          <Title>Invoices</Title>
          {costs.invoices.slice(0, 2).map((i) => (
            <Row key={i.m} left={`${i.m} · ${i.v}`} right={<span className="font-normal text-fg-subtle">PDF</span>} />
          ))}
        </div>
      </>
    ),
  },
  {
    section: "Qualification rules",
    eyebrow: "Your questions, your rules",
    title: "Change the rules, no developer",
    body: "The questions Kenzo just asked you. Hard rules must be met. Soft rules have a lowest answer you’d still consider, and Kenzo talks those leads through instead of turning them away.",
    content: (
      <>
        <div className={box}>
          <strong className="text-sm">1 · What do you need help with?</strong>
          <div className={muted}>No rule · used in the call brief</div>
        </div>
        <div className={ringed}>
          <strong className="text-sm">2 · What is your monthly ad budget?</strong>
          <Row left={<span className="text-fg-subtle">Pass rule</span>} right="At least £3,000" />
          <Row left={<span className="text-fg-subtle">Type</span>} right={<>Soft <span className="text-xs font-normal text-fg-subtle">· still consider from £2,000</span></>} />
          <div className={`${muted} pt-1.5`}>Quick replies: £1,000 · £2,000 · £3,000 · £5,000+</div>
          <div className={`${muted} pt-1`}>Examples: “£1,500 a month”, “around 3k”</div>
        </div>
        <div className={box}>
          <strong className="text-sm">3 · Who makes the final decision?</strong>
          <div className={muted}>Not someone else · Soft</div>
        </div>
        <div className={box}>
          <strong className="text-sm">4 · When do you want to start?</strong>
          <div className={muted}>Not just exploring · Soft</div>
        </div>
      </>
    ),
  },
  {
    section: "Knowledge base",
    eyebrow: "What Kenzo knows about you",
    title: "Kenzo only answers from these",
    body: "When a lead asks a question, Kenzo answers from your documents and nothing else. If a file can’t be read, it tells you why.",
    content: (
      <>
        <div className="rounded-card border-[1.5px] border-dashed border-accent-soft-line bg-accent-soft p-3.5">
          <strong className="text-sm">Upload PDFs, Word docs or text</strong>
          <div className={`${muted} mt-0.5`}>Or import a page from {AGENCY_DOMAIN}.</div>
        </div>
        <div className={ringed}>
          <Row left="Services overview.pdf" right="Ready" />
          <Row left="Clinic case study.pdf" right="Ready" />
          <Row left="FAQs.txt" right="Ready" />
          <Row left="Pricing & packages 2026.pdf" right={<em className="font-normal text-fg-subtle">Processing</em>} />
          <Row left="Old brochure scan.pdf" right={<span className="text-danger-fg">Couldn’t read</span>} sub="Scanned image. Upload a text version." />
        </div>
      </>
    ),
  },
  {
    section: "Team & handlers",
    eyebrow: "Who takes the calls",
    title: "That’s your whole dashboard",
    body: "Set who takes calls and when, and Kenzo only books people who are free. The full dashboard is made for a bigger screen: open this link on your laptop.",
    content: (
      <>
        <div className={ringed}>
          {[
            ["Sam Ali", "Handler · Mon–Fri 9:00–17:00 · next call Thu 11:00", true],
            ["Chloe Grant", "Handler · Mon–Thu 10:00–18:00 · next call Thu 14:30", true],
            ["Ravi Shah", "Backup · only gets escalations", false],
          ].map(([n, s, on]) => (
            <div key={n as string} className="flex items-center justify-between gap-3 border-t-(length:--border-width-default) border-line py-2 first:border-t-0">
              <div>
                <strong className="text-sm">{n}</strong>
                <div className={muted}>{s}</div>
              </div>
              <span aria-label={on ? "Takes new bookings" : "Not taking bookings"} className={`relative h-[22px] w-[38px] shrink-0 rounded-full ${on ? "bg-inverse" : "bg-line-strong"}`}>
                <i className={`absolute top-0.5 size-[18px] rounded-full bg-surface ${on ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </div>
          ))}
        </div>
        <div className={box}>
          <Title note="12–16 Oct">Thursday’s calls</Title>
          <Row left={<><strong>11:00</strong> Sarah K.</>} right={<span className="font-normal text-fg-subtle">Sam</span>} />
          <Row left={<><strong>14:30</strong> Priya M.</>} right={<span className="font-normal text-fg-subtle">Chloe</span>} />
          <Row left={<><strong>16:00</strong> Grace L.</>} right={<span className="font-normal text-fg-subtle">Sam</span>} />
        </div>
      </>
    ),
  },
];

export function CardStory() {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const card = CARDS[i];
  const last = i === CARDS.length - 1;

  const go = (n: number) => {
    setI(Math.max(0, Math.min(CARDS.length - 1, n)));
    window.scrollTo({ top: 0 });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/tour/agency`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const hint: Hint = {
    id: `card:${i}`,
    target: null,
    pose: "present",
    title: card.title,
    body: card.body,
    primary: last ? { label: copied ? "Link copied" : "Copy link", action: "next" } : { label: "Next", action: "next" },
    back: i > 0,
  };

  return (
    <div className="flex min-h-dvh flex-col bg-page pb-(--guide-strip-h,0px) text-fg">
      <header className="flex h-[52px] items-center gap-2 border-b-(length:--border-width-default) border-line bg-page pr-1.5 pl-4">
        <Link href="/" className="font-display text-[15px] font-semibold text-brand">
          Kenzo
        </Link>
        <Link href="/tour/customer" className="text-xs text-fg-subtle underline underline-offset-2">
          Your customer&apos;s view
        </Link>
        <span className="flex-1" />
        {!last && (
          <button type="button" onClick={() => go(CARDS.length - 1)} className="min-h-10 rounded-control px-3 text-sm font-semibold text-fg-muted">
            Skip
          </button>
        )}
      </header>
      <div className="flex flex-col gap-1.5 px-4 pt-2.5" aria-label={`Card ${i + 1} of ${CARDS.length}`}>
        <div className="flex justify-between text-xs text-fg-subtle">
          <b className="font-semibold text-accent-pressed">{card.section}</b>
          <span>
            {i + 1} of {CARDS.length}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-progress-track">
          <i className="block h-full rounded-full bg-progress transition-all duration-(--duration-base)" style={{ width: `${((i + 1) / CARDS.length) * 100}%` }} />
        </div>
      </div>
      <main key={`card-${i}`} className="flex animate-rise flex-col gap-2.5 px-4 pt-3.5 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{card.eyebrow}</span>
        {card.content}
        {last && (
          <button type="button" onClick={() => go(0)} className="mt-1 self-start text-sm font-semibold text-link underline underline-offset-4">
            Start again
          </button>
        )}
      </main>
      <Strip key={`strip-${i}`} hint={hint} onPrimary={last ? copyLink : () => go(i + 1)} onBack={() => go(i - 1)} busy={false} rect={null} />
    </div>
  );
}
