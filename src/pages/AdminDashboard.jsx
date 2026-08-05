import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import { TRACKS } from "../lib/constants";

export default function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [teamsRes, statsRes] = await Promise.all([
        api.get("/admin/teams/", {
          params: { search: search || undefined, track: track || undefined },
        }),
        api.get("/admin/dashboard/"),
      ]);
      setTeams(teamsRes.data.teams || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, track]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id, name) {
    if (!confirm(`Delete team "${name}"? This can't be undone.`)) return;
    await api.delete(`/admin/teams/${id}/`);
    load();
  }

  function handleDownload() {
    window.open("/api/admin/download/", "_blank");
  }

  function handleLogout() {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_username");
    navigate("/admin/login");
  }

  return (
    <Layout>
      <div className="pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-teal">
                Admin
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-paper">
                Registrations
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/admin/site-content")}
                className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:border-teal"
              >
                Site Content
              </button>
              <button
                onClick={() => navigate("/admin/problems")}
                className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:border-teal"
              >
                Problem Statements
              </button>
              <button
                onClick={handleDownload}
                className="rounded-full bg-gradient-to-r from-teal to-sky px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
              >
                Download .xlsx
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist transition-colors hover:border-coral hover:text-coral"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-surface px-5 py-4">
                <p className="font-mono text-xs uppercase tracking-wide text-mist">
                  Teams
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-paper">
                  {stats.total_teams}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-surface px-5 py-4">
                <p className="font-mono text-xs uppercase tracking-wide text-mist">
                  Participants
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-paper">
                  {stats.total_participants}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-surface px-5 py-4">
                <p className="font-mono text-xs uppercase tracking-wide text-mist">
                  Tracks
                </p>
                <p className="mt-1 text-sm text-paper">
                  {Object.entries(stats.by_track || {})
                    .map(([t, c]) => `${t}: ${c}`)
                    .join(" · ") || "—"}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mt-8 flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team, leader, college…"
              className="min-w-[220px] flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
            />
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
            >
              <option value="">All tracks</option>
              {TRACKS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface font-mono text-[11px] uppercase tracking-wide text-mist">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Leader</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Problem Statement</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-mist">Loading…</td>
                  </tr>
                )}
                {!loading && teams.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-mist">
                      No registrations yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  teams.map((t) => (
                    <tr
                      key={t.team_id}
                      className="border-b border-line/60 transition-colors hover:bg-surface"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-mist">
                        #{String(t.team_id).padStart(3, "0")}
                      </td>
                      <td className="px-4 py-3 font-medium text-paper">{t.team_name}</td>
                      <td className="px-4 py-3 text-mist">{t.track || "—"}</td>
                      <td className="px-4 py-3 text-mist">{t.college || "—"}</td>
                      <td className="px-4 py-3 text-mist">
                        {t.leader_name}
                        <div className="font-mono text-xs text-mist/70">{t.leader_email}</div>
                      </td>
                      <td className="px-4 py-3 text-mist">{(t.members_count || 0) + 1}</td>
                      <td className="px-4 py-3 text-mist">{t.problem_title || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-mist">{t.registered_at}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(t.team_id, t.team_name)}
                          className="font-mono text-xs text-coral hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}