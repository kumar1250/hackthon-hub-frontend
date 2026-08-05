import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { TRACKS } from "../lib/constants";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const EMPTY_FORM = { title: "", description: "", track: "", difficulty: "" };

export default function ProblemStatementsModal({ onClose }) {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Visibility toggle states
  const [visible, setVisible] = useState(false);
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilitySaving, setVisibilitySaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get("/admin/problems/", {
      params: { search: search || undefined, track: track || undefined },
    });
    setProblems(res.data.problems);
    setLoading(false);
  }, [search, track]);

  useEffect(() => {
    load();
  }, [load]);

  // Fetch initial visibility state
  useEffect(() => {
    api
      .get("/admin/problems/visibility/")
      .then((res) => setVisible(res.data.visible))
      .catch(() => setError("Could not load visibility status."))
      .finally(() => setVisibilityLoading(false));
  }, []);

  // Toggle visibility handler
  async function toggleVisibility() {
    const next = !visible;
    setVisibilitySaving(true);
    try {
      const res = await api.patch("/admin/problems/visibility/", { visible: next });
      setVisible(res.data.visible);
    } catch {
      setError("Couldn't update visibility. Try again.");
    } finally {
      setVisibilitySaving(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setFormOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      track: p.track || "",
      difficulty: p.difficulty || "",
    });
    setError("");
    setFormOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.patch(`/admin/problems/${editingId}/`, form);
      } else {
        await api.post("/admin/problems/", form);
      }
      setFormOpen(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the problem statement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    await api.delete(`/admin/problems/${id}/`);
    load();
  }

  function handleDownload() {
    const token = localStorage.getItem("admin_access");
    fetch("/api/admin/problems/download/", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "problem_statements.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8 sm:px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl rounded-3xl border border-line bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal">Admin</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-paper">
              Problem Statements
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openCreate}
              className="rounded-full bg-gradient-to-r from-teal to-sky px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
            >
              + Add
            </button>
            <button
              onClick={handleDownload}
              className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:border-teal hover:text-teal"
            >
              Download .xlsx
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist transition-colors hover:border-coral hover:text-coral"
            >
              Close
            </button>
          </div>
        </div>

        {/* Visibility Toggle Row */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-paper">
              Show to participants
            </p>
            <p className="mt-0.5 text-xs text-mist">
              {visibilityLoading
                ? "Checking status…"
                : visible
                ? "Participants can currently see the problem statements page and pick a problem."
                : "Hidden — participants will see an empty/unpublished page until you turn this on."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            disabled={visibilityLoading || visibilitySaving}
            onClick={toggleVisibility}
            className={`relative h-7 w-14 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              visible ? "bg-teal" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                visible ? "translate-x-7" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description…"
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
        <div className="mt-6 max-h-[50vh] overflow-auto rounded-lg border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface font-mono text-[11px] uppercase tracking-wide text-mist">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-mist">Loading…</td>
                </tr>
              )}
              {!loading && problems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-mist">
                    No problem statements yet.
                  </td>
                </tr>
              )}
              {!loading &&
                problems.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-line/60 transition-colors hover:bg-surface"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-mist">
                      #{String(p.id).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-3 font-medium text-paper">{p.title}</td>
                    <td className="px-4 py-3 text-mist">{p.track || "—"}</td>
                    <td className="px-4 py-3 text-mist">{p.difficulty || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist">{p.updated_at}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEdit(p)}
                        className="font-mono text-xs text-teal hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
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

      {/* Add / Edit Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 px-6">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-6 shadow-lg">
            <h2 className="font-display text-xl font-bold text-paper">
              {editingId ? "Edit problem statement" : "New problem statement"}
            </h2>
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {error && (
                <div className="rounded-md border border-coral/40 bg-coral/10 px-4 py-2.5 text-sm text-coral">
                  {error}
                </div>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs text-mist">Title</span>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-mist">Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-mist">Track</span>
                  <select
                    value={form.track}
                    onChange={(e) => setForm({ ...form, track: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                  >
                    <option value="">—</option>
                    {TRACKS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-mist">Difficulty</span>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                  >
                    <option value="">—</option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-md border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-teal px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}