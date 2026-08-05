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

          {/* ---- Team details + downloadable summary ---- */}
          <section
            ref={summaryRef}
            className="mt-8 overflow-hidden rounded-4xl border border-[#ffbf5d33] bg-[#fffdf8] shadow-[0_30px_60px_rgba(15,23,42,0.08)]"
          >
            <div className="rounded-t-4xl bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#8b6a17]">
                    {EVENT.college}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.24em] text-[#111827] sm:text-4xl">
                    {EVENT.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#475569] sm:text-base">
                    {EVENT.venueLabel}
                  </p>
                </div>
                <div className="rounded-3xl border border-[#d1fae5] bg-[#ecfdf5] px-4 py-3 text-sm text-[#047857] shadow-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#047857]">
                    Registration summary
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#111827]">{team.team_name}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#ffbf5d33] bg-white p-6 sm:p-8">
              <div className="grid gap-4 lg:grid-cols-2">
                <DetailCard label="Team ID" value={`#${String(team.team_id).padStart(4, "0")}`} />
                <DetailCard label="Track" value={team.track} />
                <DetailCard label="College" value={team.college} />
                <DetailCard label="Leader" value={`${team.leader_name} (${team.leader_roll_no})`} />
                <DetailCard label="Leader email" value={team.leader_email} />
                <DetailCard label="Leader phone" value={team.leader_phone} />
                <DetailCard
                  label="Problem statement"
                  value={team.problem_title || "Not chosen yet"}
                  className="lg:col-span-2"
                />
              </div>

              {selectedDescription && (
                <div className="mt-6 rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-[#8b6a17]">Full problem statement</p>
                      <p className="mt-3 text-sm leading-7 text-[#334155]">{selectedDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {team.idea && (
                <div className="mt-6 rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#8b6a17]">Saved idea</p>
                  <p className="mt-3 text-sm leading-7 text-[#334155]">{team.idea}</p>
                </div>
              )}

              {team.members?.length > 0 && (
                <div className="mt-6 rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6a17]">Team members</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#64748b]">{team.members.length} total</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-paper">
                    {team.members.map((m, i) => (
                      <li key={i} className="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-3">
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-xs text-[#64748b]">{m.roll_no}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-4 border-t border-[#ffbf5d33] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#475569]">
                  {EVENT.name} · {EVENT.college}, {EVENT.place}
                </p>
                <p className="rounded-3xl border border-[#ffbf5d4d] bg-white px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-[#8b6a17] shadow-sm">
                  CODE ODALREVU
                </p>
              </div>
            </div>
          </section>

          <div className="no-print mt-4">
            <DownloadPdfButton
              targetRef={summaryRef}
              filename={`registration-${team.team_name.replace(/\s+/g, "-").toLowerCase()}`}
              label="Download summary (PDF)"
              background="#ffffff"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}

function DetailCard({ label, value, className = "" }) {
  return (
    <div className={`rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-sm ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.35em] text-[#8b6a17]">{label}</p>
      <p className="mt-3 text-base font-semibold text-[#111827]">{value || "—"}</p>
    </div>
  );
}
