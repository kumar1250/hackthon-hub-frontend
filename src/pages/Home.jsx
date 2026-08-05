import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { api } from "../lib/api";
import {
  EVENT as DEFAULT_EVENT,
  TRACKS as DEFAULT_TRACKS,
  MIN_TEAM_SIZE as DEFAULT_MIN,
  MAX_TEAM_SIZE as DEFAULT_MAX,
} from "../lib/constants";

const TRACK_COLORS = [
  { text: "text-teal", border: "border-teal/40", bg: "bg-teal/10", glow: "hover:shadow-[0_0_28px_rgba(43,230,200,0.22)]", chip: "from-teal to-sky" },
  { text: "text-violet", border: "border-violet/40", bg: "bg-violet/10", glow: "hover:shadow-[0_0_28px_rgba(166,123,255,0.22)]", chip: "from-violet to-pink" },
  { text: "text-pink", border: "border-pink/40", bg: "bg-pink/10", glow: "hover:shadow-[0_0_28px_rgba(255,107,214,0.22)]", chip: "from-pink to-coral" },
  { text: "text-amber", border: "border-amber/40", bg: "bg-amber/10", glow: "hover:shadow-[0_0_28px_rgba(255,182,72,0.22)]", chip: "from-amber to-coral" },
  { text: "text-sky", border: "border-sky/40", bg: "bg-sky/10", glow: "hover:shadow-[0_0_28px_rgba(79,180,255,0.22)]", chip: "from-sky to-violet" },
  { text: "text-coral", border: "border-coral/40", bg: "bg-coral/10", glow: "hover:shadow-[0_0_28px_rgba(255,107,129,0.22)]", chip: "from-coral to-amber" },
];

const JUDGING_BAR_COLORS = [
  "from-teal to-sky",
  "from-violet to-pink",
  "from-pink to-coral",
  "from-amber to-coral",
  "from-sky to-violet",
  "from-lime to-teal",
  "from-coral to-amber",
];

const TRACK_ICONS = {
  "AI / ML": "🤖",
  "Web Development": "🌐",
  "App Development": "📱",
  Cybersecurity: "🛡️",
  "IoT & Hardware": "🔌",
  "Open Innovation": "💡",
};
function trackIcon(track, i) {
  if (track && TRACK_ICONS[track]) return TRACK_ICONS[track];
  const fallback = ["🚀", "⚡", "🎯", "🧩", "🔥", "✨"];
  return fallback[i % fallback.length];
}

const STEP_ICONS = ["👥", "📝", "🎟️"];

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
}

// Sensible fallback while /api/site-content/ is loading (or if it ever
// fails) so the page never renders blank — matches the shape the backend
// returns from teams/settings_utils.py.
const FALLBACK = {
  event: {
    name: DEFAULT_EVENT.name,
    tagline: DEFAULT_EVENT.tagline,
    subtitle:
      "build something real, in one sitting, with your crew. Team registration is open.",
    college: DEFAULT_EVENT.college,
    place: DEFAULT_EVENT.place,
    dateLabel: DEFAULT_EVENT.dateLabel,
    venueLabel: DEFAULT_EVENT.venueLabel,
    status: "registrations_open",
    minTeamSize: DEFAULT_MIN,
    maxTeamSize: DEFAULT_MAX,
  },
  tracks: DEFAULT_TRACKS,
  rules: [
    "Team size: 3–5 members",
    "Use any technology",
    "Internet allowed",
    "AI tools allowed (ChatGPT, GitHub Copilot, Claude, Gemini, etc.)",
    "Must explain the code during evaluation",
    "Work must be developed during the hackathon",
  ],
  judging_criteria: [
    { label: "Idea", value: 20 },
    { label: "User Interface", value: 15 },
    { label: "Functionality", value: 25 },
    { label: "Innovation", value: 15 },
    { label: "Code Quality", value: 10 },
    { label: "Presentation", value: 10 },
    { label: "Q&A", value: 5 },
  ],
  deliverables: ["Source Code (ZIP)", "README", "PPT (3–5 slides)", "Live Demo"],
  presentation_format: [
    "Team introduction — 30 sec",
    "Problem — 30 sec",
    "Solution — 2 min",
    "Live demo — 3 min",
    "Future scope — 1 min",
    "Questions — 1 min",
  ],
  how_to_register: [
    { title: "Form a team", desc: "1 to 5 members, one leader." },
    { title: "Fill the form", desc: "Team, track and contact details — takes about two minutes." },
    { title: "Get your ticket", desc: "Instant confirmation with a downloadable PDF ticket." },
  ],
  event_flow: [
    { time: "9:00 AM", title: "Check-in & Kickoff", desc: "Teams check in, collect swag, opening ceremony." },
    { time: "10:00 AM", title: "Hacking Begins", desc: "Teams start building on their chosen problem statement." },
    { time: "1:00 PM", title: "Mentor Rounds", desc: "Mentors visit tables to guide teams and unblock issues." },
    { time: "4:00 PM", title: "Checkpoint Review", desc: "Judges do a quick progress check-in with every team." },
    { time: "8:00 PM", title: "Submission Deadline", desc: "Final code, README and PPT submission closes." },
    { time: "9:00 PM", title: "Final Presentations", desc: "Teams demo and present to the judging panel." },
    { time: "11:00 PM", title: "Winners Announced", desc: "Closing ceremony and prize distribution." },
  ],
  coordinators: [],
};

const FLOW_ICONS = ["🚩", "💻", "🧑‍🏫", "📋", "⏰", "🎤", "🏆"];
const FLOW_COLORS = [
  { dot: "from-teal to-sky", ring: "ring-teal/30", text: "text-teal" },
  { dot: "from-sky to-violet", ring: "ring-sky/30", text: "text-sky" },
  { dot: "from-violet to-pink", ring: "ring-violet/30", text: "text-violet" },
  { dot: "from-pink to-coral", ring: "ring-pink/30", text: "text-pink" },
  { dot: "from-amber to-coral", ring: "ring-amber/30", text: "text-amber" },
  { dot: "from-coral to-pink", ring: "ring-coral/30", text: "text-coral" },
  { dot: "from-lime to-teal", ring: "ring-lime/30", text: "text-lime" },
];

function SectionHeader({ index, title, accent }) {
  return (
    <Reveal>
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accent} font-mono text-xs font-bold text-ink shadow-sm`}
        >
          {index}
        </span>
        <h2 className="font-display text-xl font-bold tracking-tight text-paper sm:text-2xl">
          {title}
        </h2>
      </div>
    </Reveal>
  );
}

export default function Home() {
  const [content, setContent] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/site-content/")
      .then((res) => {
        if (cancelled || !res.data) return;
        // Merge over the fallback so any key the admin hasn't touched
        // yet still renders something sensible.
        setContent((prev) => ({ ...prev, ...res.data }));
      })
      .catch(() => {
        /* keep FALLBACK on error */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    event,
    tracks,
    rules,
    judging_criteria,
    deliverables,
    presentation_format,
    how_to_register,
    event_flow,
    coordinators,
  } = content;

  const total = (judging_criteria || []).reduce((sum, row) => sum + Number(row.value || 0), 0);
  const maxJudgingValue = Math.max(1, ...(judging_criteria || []).map((r) => Number(r.value || 0)));

  return (
    <Layout>
      {/* Hero */}
      <section className="relative mx-auto max-w-5xl overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 md:pt-24">
        {/* Decorative floating emoji chips — hidden on small screens to stay clean */}
        <div className="pointer-events-none absolute inset-0 hidden select-none lg:block" aria-hidden="true">
          <span className="animate-floaty2 absolute right-2 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface/80 text-xl shadow-lg backdrop-blur">
            💻
          </span>
          <span className="animate-floaty3 absolute right-40 top-32 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/80 text-lg shadow-lg backdrop-blur">
            🏆
          </span>
          <span className="animate-floaty2 absolute right-10 top-72 flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface/80 text-lg shadow-lg backdrop-blur" style={{ animationDelay: "1.2s" }}>
            ⚡
          </span>
        </div>

        <div className="animate-pop-in inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-teal sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-glow" />
          {event.college} · {event.place}
        </div>

        <h1 className="mt-5 font-display text-4xl font-black leading-[1.04] tracking-tight text-paper sm:mt-6 sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-teal via-violet to-pink bg-clip-text text-transparent animate-gradient">
            {event.name}
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-mist sm:text-lg">
          {event.tagline} — {event.subtitle}
        </p>

        {/* Quick stat chips — horizontally scrollable on mobile */}
        <div className="scrollbar-none mt-6 -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {[
            { icon: "🧭", label: `${(tracks || []).length} tracks`, tint: "border-violet/30 bg-violet/10 text-violet" },
            { icon: "👥", label: `${event.minTeamSize}–${event.maxTeamSize} members`, tint: "border-teal/30 bg-teal/10 text-teal" },
            { icon: "🟢", label: event.status?.replace(/_/g, " ") || "open", tint: "border-lime/30 bg-lime/10 text-lime" },
            { icon: "📅", label: event.dateLabel, tint: "border-pink/30 bg-pink/10 text-pink" },
          ].map((s, i) => (
            <span
              key={i}
              className={`chip-pop flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wide ${s.tint}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span>{s.icon}</span>
              {s.label}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            to="/register"
            className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-teal via-sky to-violet px-7 py-3.5 text-center font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(43,230,200,0.4)] active:scale-95 sm:w-auto"
          >
            <span className="absolute inset-0 animate-shimmer" />
            <span className="relative">Register your team →</span>
          </Link>
          <Link
            to="/problem-statements"
            className="w-full rounded-full border border-line px-7 py-3.5 text-center font-mono text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-pink hover:text-pink active:scale-95 sm:w-auto"
          >
            Browse problems
          </Link>
        </div>

        {/* Terminal-style info card — the signature element */}
        <Reveal delay={150}>
          <div className="animate-floaty mt-10 max-w-md rounded-2xl border border-line bg-surface/80 font-mono text-xs shadow-2xl backdrop-blur sm:mt-14">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal/70" />
              <span className="ml-2 text-mist">event.info</span>
            </div>
            <div className="space-y-2 px-4 py-4 text-mist">
              <p>
                <span className="text-teal">$</span> date{" "}
                <span className="text-paper">{event.dateLabel}</span>
              </p>
              <p className="break-words">
                <span className="text-sky">$</span> venue{" "}
                <span className="text-paper">{event.venueLabel}</span>
              </p>
              <p>
                <span className="text-violet">$</span> tracks{" "}
                <span className="text-paper">{(tracks || []).length} available</span>
              </p>
              <p>
                <span className="text-pink">$</span> status{" "}
                <span className="text-amber">{event.status}</span>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Hackathon details */}
      <section className="mx-auto max-w-5xl border-t border-line/70 py-12 sm:py-16">
        <SectionHeader index="03" title="Hackathon details" accent="from-teal to-sky" />

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="group relative overflow-hidden rounded-3xl border border-teal/25 bg-surface/70 p-6 transition-transform hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal to-sky" />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/15 text-base">📜</span>
                <h3 className="font-display text-xl font-semibold text-paper">Rules</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-mist">
                {(rules || []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal/15 text-[10px] text-teal">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="group relative overflow-hidden rounded-3xl border border-violet/25 bg-surface/70 p-6 transition-transform hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet to-pink" />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet/15 text-base">⚖️</span>
                <h3 className="font-display text-xl font-semibold text-paper">Judging criteria</h3>
              </div>
              <div className="mt-5 space-y-3">
                {(judging_criteria || []).map((row, i) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-paper">{row.label}</span>
                      <span className="font-semibold text-paper">{row.value}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-line/50">
                      <div
                        className={`bar-grow-x h-full rounded-full bg-gradient-to-r ${JUDGING_BAR_COLORS[i % JUDGING_BAR_COLORS.length]}`}
                        style={{
                          width: `${(Number(row.value || 0) / maxJudgingValue) * 100}%`,
                          animationDelay: `${i * 90}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-line pt-3 font-mono text-xs">
                  <span className="font-semibold text-paper">Total</span>
                  <span className="font-semibold text-teal">{total}</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="group relative overflow-hidden rounded-3xl border border-pink/25 bg-surface/70 p-6 transition-transform hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink to-coral" />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink/15 text-base">📦</span>
                <h3 className="font-display text-xl font-semibold text-paper">Deliverables</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-mist">
                {(deliverables || []).map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pink/15 text-[10px] text-pink">✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="group relative overflow-hidden rounded-3xl border border-amber/25 bg-surface/70 p-6 transition-transform hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber to-coral" />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/15 text-base">🎤</span>
                <h3 className="font-display text-xl font-semibold text-paper">Presentation format</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-mist">
                {(presentation_format || []).map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber/15 text-[10px] text-amber">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Event flow — visual roadmap of the day, editable by admin */}
      {event_flow && event_flow.length > 0 && (
        <section className="mx-auto max-w-5xl border-t border-line/70 py-12 sm:py-16">
          <SectionHeader index="🗺️" title="Event flow" accent="from-lime to-teal" />
          <p className="mt-2 ml-11 text-sm text-mist">
            The route from check-in to winners — set by the admin, updated live here.
          </p>

          <div className="relative mt-8">
            {/* Vertical connector line: left-aligned on mobile, centered on desktop */}
            <div
              className="absolute top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-teal via-violet to-pink opacity-40 left-[19px] md:left-1/2 md:-translate-x-1/2"
              aria-hidden="true"
            />

            <ol className="relative space-y-8">
              {event_flow.map((step, i) => {
                const c = FLOW_COLORS[i % FLOW_COLORS.length];
                const onRight = i % 2 === 0;
                return (
                  <Reveal key={(step.title || "stage") + i} delay={i * 90}>
                    <li className="relative flex flex-col gap-4 pl-12 md:grid md:grid-cols-2 md:items-center md:gap-10 md:pl-0">
                      {/* Node dot */}
                      <span
                        className={`absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${c.dot} text-base shadow-md ring-4 ring-surface md:left-1/2 md:-translate-x-1/2`}
                      >
                        {FLOW_ICONS[i % FLOW_ICONS.length]}
                      </span>

                      {/* Card */}
                      <div
                        className={`group rounded-2xl border border-line bg-surface/80 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg sm:p-5 ${
                          onRight ? "md:order-1 md:text-right" : "md:order-2"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${c.text} border-current/30 bg-current/10`}
                        >
                          {step.time}
                        </span>
                        <h3 className="mt-2 font-display text-base font-semibold text-paper sm:text-lg">
                          {step.title}
                        </h3>
                        {step.desc && (
                          <p className="mt-1 text-sm text-mist">{step.desc}</p>
                        )}
                      </div>

                      {/* Spacer to keep the grid balanced on desktop */}
                      <div className={`hidden md:block ${onRight ? "md:order-2" : "md:order-1"}`} aria-hidden="true" />
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* Tracks */}
      <section className="mx-auto max-w-5xl border-t border-line/70 py-12 sm:py-16">
        <SectionHeader index="01" title="Tracks" accent="from-violet to-pink" />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {(tracks || []).map((track, i) => {
            const c = TRACK_COLORS[i % TRACK_COLORS.length];
            return (
              <Reveal key={track} delay={i * 60}>
                <div
                  className={`group flex items-center gap-3 rounded-2xl border ${c.border} ${c.bg} px-4 py-4 text-sm font-medium text-paper transition-all hover:-translate-y-1 ${c.glow}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.chip} text-lg shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-6`}
                  >
                    {trackIcon(track, i)}
                  </span>
                  <div>
                    <span className={`block font-mono text-[10px] ${c.text}`}>#{String(i + 1).padStart(2, "0")}</span>
                    <span className="leading-tight">{track}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl border-t border-line/70 py-12 sm:py-16">
        <SectionHeader index="02" title="How to register" accent="from-pink to-amber" />
        <div className="relative mt-8">
          {/* connecting line — desktop only */}
          <svg
            className="pointer-events-none absolute left-0 top-6 hidden w-full md:block"
            height="2"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="16%"
              y1="1"
              x2="84%"
              y2="1"
              stroke="url(#lineGrad)"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="timeline-dash"
            />
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c2ff" />
                <stop offset="50%" stopColor="#8d5cff" />
                <stop offset="100%" stopColor="#ffbf5d" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {(how_to_register || []).map((step, i) => {
              const colors = ["from-teal to-sky", "from-violet to-pink", "from-amber to-coral"];
              return (
                <Reveal key={step.title + i} delay={i * 90}>
                  <div className="group relative rounded-2xl border border-line bg-surface/70 p-5 text-center transition-transform hover:-translate-y-1 sm:text-left">
                    <div
                      className={`relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} font-display text-lg font-bold text-ink shadow-md transition-transform group-hover:scale-110 sm:mx-0`}
                    >
                      {STEP_ICONS[i % STEP_ICONS.length]}
                    </div>
                    <div className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-mist">
                      Step {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-paper">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-mist">{step.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coordinators */}
      {coordinators && coordinators.length > 0 && (
        <section className="mx-auto max-w-5xl border-t border-line/70 py-12 sm:py-16">
          <SectionHeader index="04" title="Coordinators" accent="from-sky to-lime" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {coordinators.map((c, i) => {
              const colors = ["from-teal to-sky", "from-violet to-pink", "from-amber to-coral", "from-pink to-violet", "from-sky to-teal", "from-coral to-amber"];
              return (
                <Reveal key={(c.name || "coordinator") + i} delay={i * 70}>
                  <div className="group flex items-start gap-4 rounded-2xl border border-line bg-surface/70 p-5 transition-transform hover:-translate-y-1">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colors[i % colors.length]} font-display text-sm font-bold text-ink shadow-sm transition-transform group-hover:scale-110`}
                    >
                      {initials(c.name)}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-paper">{c.name}</h3>
                      {c.role && (
                        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-teal">
                          {c.role}
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                        {c.phone && (
                          <a
                            href={`tel:${c.phone}`}
                            className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-mist transition-colors hover:border-teal hover:text-teal"
                          >
                            📞 {c.phone}
                          </a>
                        )}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-mist transition-colors hover:border-violet hover:text-violet"
                          >
                            ✉️ {c.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </Layout>
  );
}