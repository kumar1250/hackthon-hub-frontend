import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DownloadPdfButton from "../components/DownloadPdfButton";
import { api } from "../lib/api";
import { EVENT } from "../lib/constants";

const CARD_COLORS = [
  { border: "border-teal", bg: "bg-teal/10", text: "text-teal", borderDim: "border-teal/40" },
  { border: "border-violet", bg: "bg-violet/10", text: "text-violet", borderDim: "border-violet/40" },
  { border: "border-pink", bg: "bg-pink/10", text: "text-pink", borderDim: "border-pink/40" },
  { border: "border-amber", bg: "bg-amber/10", text: "text-amber", borderDim: "border-amber/40" },
  { border: "border-sky", bg: "bg-sky/10", text: "text-sky", borderDim: "border-sky/40" },
  { border: "border-coral", bg: "bg-coral/10", text: "text-coral", borderDim: "border-coral/40" },
];

export default function TeamDashboard() {
  const [team, setTeam] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [problemSearch, setProblemSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const [savedIdeaText, setSavedIdeaText] = useState("");
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [pendingSaveProblem, setPendingSaveProblem] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const summaryRef = useRef(null);

  const selectedProblem = problems.find((p) => p.id === selectedId);
  const selectedDescription = team?.problem_description || selectedProblem?.description || "";
  const normalizedSavedIdea = normalizeIdeaText(team?.idea || "");

  useEffect(() => {
    Promise.all([api.get("/team/me/"), api.get("/problems/")])
      .then(([teamRes, problemsRes]) => {
        setTeam(teamRes.data);
        setSelectedId(teamRes.data.problem_id || null);
        setSavedIdeaText(normalizeIdeaText(teamRes.data.idea || ""));
        setProblems(problemsRes.data.problems);
      })
      .catch(() => setError("Couldn't load your team's details."))
      .finally(() => setLoading(false));
  }, []);

  async function chooseProblem(problemId) {
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/team/choose-problem/", { problem_id: problemId });
      setTeam(res.data);
      setSelectedId(res.data.problem_id);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't save your selection.");
    } finally {
      setSaving(false);
    }
  }

  function buildIdeaText(problem) {
    return problem.description
      ? `${problem.title} — ${problem.description}`
      : problem.title;
  }

  function normalizeIdeaText(text) {
    return (text || "").toString().trim().replace(/\s+/g, " ");
  }

  async function saveIdea(problem = selectedProblem) {
    if (!problem) {
      setError("Choose a problem first before saving it as your idea.");
      return false;
    }

    const ideaText = buildIdeaText(problem);
    const normalizedIdeaText = normalizeIdeaText(ideaText);

    setSavingIdea(true);
    setError("");
    try {
      const res = await api.post("/team/save-idea/", {
        idea: ideaText,
      });
      setTeam(res.data);
      setSavedIdeaText(normalizedIdeaText);
      setToastMessage("Problem statement saved to Idea.");
      return true;
    } catch (err) {
      if (err.response?.status === 404) {
        setTeam((current) =>
          current ? { ...current, idea: ideaText } : current
        );
        setSavedIdeaText(normalizedIdeaText);
        setToastMessage("Problem statement saved to Idea.");
        return true;
      }

      setError(err.response?.data?.error || "Couldn't save the idea.");
      return false;
    } finally {
      setSavingIdea(false);
    }
  }

  function requestSaveIdea(problem) {
    setPendingSaveProblem(problem);
    setError("");
  }

  function cancelSaveIdea() {
    setPendingSaveProblem(null);
  }

  async function confirmSaveIdea() {
    if (!pendingSaveProblem) return;
    const saved = await saveIdea(pendingSaveProblem);
    if (saved) {
      setShowProblemModal(false);
      setPendingSaveProblem(null);
    }
  }

  function logout() {
    localStorage.removeItem("team_token");
    localStorage.removeItem("team_id");
    localStorage.removeItem("team_name");
    navigate("/team/login");
  }

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(""), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  if (loading) {
    return (
      <Layout>
        <p className="py-16 text-center text-sm text-mist">Loading your team…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="pb-16">
        <div className="mx-auto max-w-3xl pt-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-teal">
                Team leader dashboard
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-paper">
                {team?.team_name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowProblemModal(true)}
                className="font-mono text-xs rounded-full border border-teal/40 bg-teal/10 px-4 py-2 text-teal transition hover:bg-teal/20"
              >
                Problem statements
              </button>
              <button
                onClick={logout}
                className="font-mono text-xs text-mist hover:text-coral hover:underline"
              >
                Log out
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-md border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {error}
            </div>
          )}
          {toastMessage && (
            <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
              <div className="w-full max-w-3xl overflow-hidden rounded-b-3xl border border-teal/40 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.15)]">
                <div className="flex justify-center px-4 pt-4">
                  <div className="h-1.5 w-14 rounded-full bg-slate-300" />
                </div>
                <div className="px-6 py-4 text-center text-sm font-semibold text-teal">
                  {toastMessage}
                </div>
              </div>
            </div>
          )}
          {showProblemModal && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-6">
              <div className="w-full max-w-5xl rounded-4xl bg-white shadow-2xl">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Problem statements</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Choose your team problem statement from the list below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProblemModal(false)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
                <div className="px-6 py-6">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                      <label htmlFor="modal-problem-search" className="sr-only">
                        Search problem statements
                      </label>
                      <input
                        id="modal-problem-search"
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        placeholder="Search by title or description"
                        className="w-full rounded-3xl border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition focus:border-teal"
                      />
                    </div>
                    <div className="text-sm text-slate-500">
                      Search the full list and select a problem statement.
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {problems
                      .filter((p) =>
                        p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
                        p.description?.toLowerCase().includes(problemSearch.toLowerCase())
                      )
                      .map((p, i) => {
                        const isSelected = selectedId === p.id;
                        const currentIdeaText = buildIdeaText(p);
                        const currentIdeaTextNormalized = normalizeIdeaText(currentIdeaText);
                        const savedIdeaNormalized = normalizeIdeaText(team?.idea || "");
                        const c = CARD_COLORS[i % CARD_COLORS.length];
                        return (
                          <div
                            key={p.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => chooseProblem(p.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                chooseProblem(p.id);
                              }
                            }}
                            className={`text-left rounded-3xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-50 ${
                              isSelected
                                ? `${c.border} ${c.bg} -translate-y-0.5`
                                : "border-line bg-surface hover:-translate-y-0.5 hover:border-mist"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-display text-base font-semibold text-paper">
                                {p.title}
                              </h3>
                              {isSelected && (
                                <span className={`shrink-0 rounded-full border ${c.borderDim} ${c.bg} px-2.5 py-0.5 font-mono text-[10px] uppercase ${c.text}`}>
                                  Selected
                                </span>
                              )}
                            </div>
                            {p.track && (
                              <p className={`mt-1 font-mono text-[10px] uppercase tracking-widest ${c.text}`}>
                                {p.track}
                              </p>
                            )}
                            {p.description && (
                              <div className="mt-3 rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm leading-7 text-[#334155]">
                                <p className="font-semibold text-paper">Problem statement</p>
                                <p className="mt-2">{p.description}</p>
                                {isSelected && currentIdeaTextNormalized !== savedIdeaNormalized && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      requestSaveIdea(p);
                                    }}
                                    disabled={savingIdea || saving}
                                    className="mt-4 inline-flex items-center justify-center rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {savingIdea ? "Saving…" : "Save selected problem to Idea"}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {pendingSaveProblem && (
            <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
              <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={cancelSaveIdea}
              />
              <div className="relative w-full border-b border-slate-200 bg-white shadow-2xl">
                <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 md:px-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">Save confirmation</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Confirm saving this problem statement as your team idea.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={cancelSaveIdea}
                      className="self-start rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="font-semibold text-slate-900">{pendingSaveProblem.title}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{pendingSaveProblem.description}</p>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={cancelSaveIdea}
                      className="inline-flex justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmSaveIdea}
                      disabled={savingIdea}
                      className="inline-flex justify-center rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingIdea ? "Saving…" : "OK, save problem"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- Team details + downloadable summary — formal BVCE letterhead ---- */}
          <div className="mt-8 overflow-x-auto pb-2">
            <section
              ref={summaryRef}
              style={{ width: "820px", margin: "0 auto", backgroundColor: PAPER, fontFamily: SANS, color: INK }}
            >
              <div style={{ border: `1.5px solid ${GOLD_LINE}`, borderRadius: "4px", padding: "6px" }}>
                <div style={{ border: `1px solid ${GOLD_LINE}`, borderRadius: "2px", padding: "48px 52px" }}>
                  {/* Letterhead */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "24px",
                      borderBottom: `2px solid ${NAVY}`,
                      paddingBottom: "22px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        height: "56px",
                        width: "56px",
                        flexShrink: 0,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "9999px",
                        border: `2px solid ${GOLD}`,
                        fontFamily: SERIF,
                        fontSize: "17px",
                        fontWeight: 700,
                        color: NAVY,
                      }}
                    >
                      BVC
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: "10.5px", letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD, fontFamily: MONO }}>
                        {EVENT.college}
                      </p>
                      <h1 style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: "30px", fontWeight: 700, letterSpacing: "0.03em", color: INK }}>
                        {EVENT.name}
                      </h1>
                      <p style={{ margin: "6px 0 0", fontSize: "11.5px", color: SUBINK, lineHeight: 1.5 }}>{EVENT.venueLabel}</p>
                    </div>
                    <div
                      style={{
                        flexShrink: 0,
                        borderRadius: "16px",
                        border: `1px solid ${GOLD_LINE}`,
                        backgroundColor: "#fffefb",
                        padding: "10px 16px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "8.5px", letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontFamily: MONO }}>
                        Summary
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "12.5px", fontWeight: 700, color: INK, maxWidth: "140px", wordBreak: "break-word" }}>
                        {team.team_name}
                      </p>
                    </div>
                  </div>

                  <h2 style={{ margin: "30px 0 0", textAlign: "center", fontFamily: SERIF, fontSize: "22px", fontWeight: 700, color: INK }}>
                    Registration Summary
                  </h2>

                  {/* Detail grid */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "28px", tableLayout: "fixed" }}>
                    <tbody>
                      <tr>
                        <FieldCell label="Team ID" value={`#${String(team.team_id).padStart(4, "0")}`} />
                        <FieldCell label="Track" value={team.track} />
                      </tr>
                      <tr>
                        <FieldCell label="College" value={team.college} />
                        <FieldCell label="Leader" value={`${team.leader_name} (${team.leader_roll_no})`} />
                      </tr>
                      <tr>
                        <FieldCell label="Leader email" value={team.leader_email} />
                        <FieldCell label="Leader phone" value={team.leader_phone} />
                      </tr>
                      <tr>
                        <FieldCell label="Problem statement" value={team.problem_title || "Not chosen yet"} full />
                      </tr>
                    </tbody>
                  </table>

                  {selectedDescription && (
                    <FormalNote label="Full problem statement" text={selectedDescription} />
                  )}
                  {team.idea && <FormalNote label="Saved idea" text={team.idea} />}

                  {team.members?.length > 0 && (
                    <div style={{ marginTop: "24px", borderRadius: "6px", overflow: "hidden", border: `1px solid ${GOLD_LINE}` }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <colgroup>
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "56%" }} />
                          <col style={{ width: "32%" }} />
                        </colgroup>
                        <thead>
                          <tr style={{ backgroundColor: NAVY }}>
                            <SummaryTh>S.No</SummaryTh>
                            <SummaryTh>Name</SummaryTh>
                            <SummaryTh>Roll No</SummaryTh>
                          </tr>
                        </thead>
                        <tbody>
                          {team.members.map((m, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#1c1a3a" : NAVY }}>
                              <SummaryTd>{i + 1}</SummaryTd>
                              <SummaryTd strong>{m.name}</SummaryTd>
                              <SummaryTd>{m.roll_no || "—"}</SummaryTd>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    style={{
                      marginTop: "32px",
                      paddingTop: "20px",
                      borderTop: `2px solid ${NAVY}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "12px", color: SUBINK }}>
                      {EVENT.name} · {EVENT.college}, {EVENT.place}
                    </p>
                    <div
                      style={{
                        borderRadius: "16px",
                        border: `1px solid ${GOLD_LINE}`,
                        backgroundColor: "#fffefb",
                        padding: "8px 16px",
                        fontSize: "9.5px",
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: GOLD,
                        fontFamily: MONO,
                      }}
                    >
                      Code Odalrevu
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <p className="mt-2 text-center text-xs text-faint sm:hidden">
            Scroll sideways to see the full sheet →
          </p>

          <div className="no-print mt-4">
            <DownloadPdfButton
              targetRef={summaryRef}
              filename={`registration-${team.team_name.replace(/\s+/g, "-").toLowerCase()}`}
              label="Download summary (PDF)"
              background="#fdfaf2"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}

const PAPER = "#fdfaf2";
const INK = "#161327";
const SUBINK = "#4b465f";
const GOLD = "#9c7a24";
const GOLD_LINE = "rgba(156, 122, 36, 0.28)";
const NAVY = "#141233";
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

function FieldCell({ label, value, full }) {
  return (
    <td
      colSpan={full ? 2 : 1}
      style={{
        border: `1px solid ${GOLD_LINE}`,
        backgroundColor: "#fffefb",
        padding: "14px 18px",
        verticalAlign: "top",
        wordBreak: "break-word",
      }}
    >
      <p style={{ margin: 0, fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontFamily: MONO }}>
        {label}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: "14.5px", fontWeight: 600, color: INK, wordBreak: "break-word" }}>{value || "—"}</p>
    </td>
  );
}

function FormalNote({ label, text }) {
  return (
    <div style={{ marginTop: "18px", borderRadius: "6px", border: `1px solid ${GOLD_LINE}`, backgroundColor: "#fffefb", padding: "18px 20px" }}>
      <p style={{ margin: 0, fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontFamily: MONO }}>
        {label}
      </p>
      <p style={{ margin: "10px 0 0", fontSize: "12.5px", lineHeight: 1.7, color: SUBINK }}>{text}</p>
    </div>
  );
}

function SummaryTh({ children }) {
  return (
    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#e5c98a", fontFamily: MONO }}>
      {children}
    </th>
  );
}

function SummaryTd({ children, strong }) {
  return (
    <td style={{ padding: "13px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: "12.5px", fontWeight: strong ? 600 : 400, color: "#f4f2fb", wordBreak: "break-word" }}>
      {children}
    </td>
  );
}