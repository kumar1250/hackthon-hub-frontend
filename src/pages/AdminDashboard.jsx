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
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
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

  function openTeam(t) {
    setSelectedTeam(t);
    setEditMode(false);
    setEditForm(null);
  }

  function closeTeam() {
    setSelectedTeam(null);
    setEditMode(false);
    setEditForm(null);
  }

  function startEdit() {
    setEditForm({
      team_name: selectedTeam.team_name || "",
      track: selectedTeam.track || "",
      college: selectedTeam.college || "",
      leader_name: selectedTeam.leader_name || "",
      leader_roll_no: selectedTeam.leader_roll_no || "",
      leader_email: selectedTeam.leader_email || "",
      leader_phone: selectedTeam.leader_phone || "",
      idea: selectedTeam.idea || "",
      members: (selectedTeam.members || []).map((m) => ({ ...m })),
    });
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setEditForm(null);
  }

  function updateMemberField(i, field, value) {
    setEditForm((f) => {
      const members = [...f.members];
      members[i] = { ...members[i], [field]: value };
      return { ...f, members };
    });
  }

  function removeMember(i) {
    setEditForm((f) => ({ ...f, members: f.members.filter((_, idx) => idx !== i) }));
  }

  function addMember() {
    setEditForm((f) => ({
      ...f,
      members: [...f.members, { name: "", roll_no: "", email: "", phone: "" }],
    }));
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await api.patch(`/admin/teams/${selectedTeam.team_id}/`, editForm);
      setSelectedTeam(res.data);
      setEditMode(false);
      setEditForm(null);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    try {
      const res = await api.get("/admin/download/", { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "teams.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download the file.");
    }
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
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openTeam(t)}
                            className="font-mono text-xs text-teal hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(t.team_id, t.team_name)}
                            className="font-mono text-xs text-coral hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeTeam}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-teal">
                  Team #{String(selectedTeam.team_id).padStart(3, "0")}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-paper">
                  {selectedTeam.team_name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    onClick={startEdit}
                    className="rounded-full border border-line px-3 py-1 font-mono text-xs text-teal hover:border-teal"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={closeTeam}
                  className="rounded-full border border-line px-3 py-1 font-mono text-xs text-mist hover:border-coral hover:text-coral"
                >
                  Close
                </button>
              </div>
            </div>

            {!editMode ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow label="Track" value={selectedTeam.track} />
                  <DetailRow label="College" value={selectedTeam.college} />
                  <DetailRow label="Leader" value={selectedTeam.leader_name} />
                  <DetailRow label="Leader roll no" value={selectedTeam.leader_roll_no} />
                  <DetailRow label="Leader email" value={selectedTeam.leader_email} />
                  <DetailRow label="Leader phone" value={selectedTeam.leader_phone} />
                  <DetailRow label="Problem statement" value={selectedTeam.problem_title || "Not chosen yet"} />
                  <DetailRow label="Registered" value={selectedTeam.registered_at} />
                </div>

                {selectedTeam.idea && (
                  <div className="mt-6">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-mist">Idea / Abstract</p>
                    <p className="mt-2 text-sm leading-relaxed text-paper">{selectedTeam.idea}</p>
                  </div>
                )}

                <div className="mt-6">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-mist">
                    Team members ({(selectedTeam.members?.length || 0) + 1} total)
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="rounded-lg border border-line bg-void/40 px-3 py-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium text-paper">
                          {selectedTeam.leader_name} <span className="font-mono text-xs text-teal">· Leader</span>
                        </span>
                        <span className="font-mono text-xs text-mist">{selectedTeam.leader_roll_no || "—"}</span>
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-mist/70">
                        {selectedTeam.leader_email} {selectedTeam.leader_phone ? `· ${selectedTeam.leader_phone}` : ""}
                      </div>
                    </div>
                    {(selectedTeam.members || []).map((m, i) => (
                      <div key={i} className="rounded-lg border border-line bg-void/40 px-3 py-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-medium text-paper">{m.name || "—"}</span>
                          <span className="font-mono text-xs text-mist">{m.roll_no || "—"}</span>
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-mist/70">
                          {[m.email, m.phone].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <EditField label="Team name" value={editForm.team_name} onChange={(v) => setEditForm((f) => ({ ...f, team_name: v }))} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-mist">Track</p>
                    <select
                      value={editForm.track}
                      onChange={(e) => setEditForm((f) => ({ ...f, track: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-line bg-void/40 px-3 py-1.5 text-sm text-paper outline-none focus:border-teal"
                    >
                      <option value="">—</option>
                      {TRACKS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <EditField label="College" value={editForm.college} onChange={(v) => setEditForm((f) => ({ ...f, college: v }))} full />
                  <EditField label="Leader name" value={editForm.leader_name} onChange={(v) => setEditForm((f) => ({ ...f, leader_name: v }))} />
                  <EditField label="Leader roll no" value={editForm.leader_roll_no} onChange={(v) => setEditForm((f) => ({ ...f, leader_roll_no: v }))} />
                  <EditField label="Leader email" value={editForm.leader_email} onChange={(v) => setEditForm((f) => ({ ...f, leader_email: v }))} />
                  <EditField label="Leader phone" value={editForm.leader_phone} onChange={(v) => setEditForm((f) => ({ ...f, leader_phone: v }))} />
                </div>

                <div className="mt-6">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-mist">Idea / Abstract</p>
                  <textarea
                    value={editForm.idea}
                    onChange={(e) => setEditForm((f) => ({ ...f, idea: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-line bg-void/40 px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                  />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-mist">
                      Team members (leader is edited above, not listed here)
                    </p>
                    <button
                      onClick={addMember}
                      className="font-mono text-xs text-teal hover:underline"
                    >
                      + Add member
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {editForm.members.map((m, i) => (
                      <div key={i} className="rounded-lg border border-line bg-void/40 p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            value={m.name || ""}
                            onChange={(e) => updateMemberField(i, "name", e.target.value)}
                            placeholder="Name"
                            className="rounded-md border border-line bg-surface px-2 py-1 text-sm text-paper outline-none focus:border-teal"
                          />
                          <input
                            value={m.roll_no || ""}
                            onChange={(e) => updateMemberField(i, "roll_no", e.target.value)}
                            placeholder="Roll no"
                            className="rounded-md border border-line bg-surface px-2 py-1 text-sm text-paper outline-none focus:border-teal"
                          />
                          <input
                            value={m.email || ""}
                            onChange={(e) => updateMemberField(i, "email", e.target.value)}
                            placeholder="Email"
                            className="rounded-md border border-line bg-surface px-2 py-1 text-sm text-paper outline-none focus:border-teal"
                          />
                          <input
                            value={m.phone || ""}
                            onChange={(e) => updateMemberField(i, "phone", e.target.value)}
                            placeholder="Phone"
                            className="rounded-md border border-line bg-surface px-2 py-1 text-sm text-paper outline-none focus:border-teal"
                          />
                        </div>
                        <button
                          onClick={() => removeMember(i)}
                          className="mt-2 font-mono text-xs text-coral hover:underline"
                        >
                          Remove member
                        </button>
                      </div>
                    ))}
                    {editForm.members.length === 0 && (
                      <p className="text-sm text-mist">No members besides the leader.</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist hover:border-coral hover:text-coral disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="rounded-full bg-gradient-to-r from-teal to-sky px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-mist">{label}</p>
      <p className="mt-1 text-sm font-medium text-paper break-words">{value || "—"}</p>
    </div>
  );
}

function EditField({ label, value, onChange, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="font-mono text-[11px] uppercase tracking-widest text-mist">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-line bg-void/40 px-3 py-1.5 text-sm text-paper outline-none focus:border-teal"
      />
    </div>
  );
}