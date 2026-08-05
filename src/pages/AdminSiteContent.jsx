import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";

const EMPTY = {
  event: {
    name: "",
    tagline: "",
    subtitle: "",
    college: "",
    place: "",
    dateLabel: "",
    venueLabel: "",
    status: "",
    minTeamSize: 1,
    maxTeamSize: 5,
  },
  tracks: [],
  rules: [],
  judging_criteria: [],
  deliverables: [],
  presentation_format: [],
  how_to_register: [],
  event_flow: [],
  coordinators: [],
};

// ---------- small reusable pieces ----------

function Field({ label, value, onChange, textarea, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-mist">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
        />
      )}
    </label>
  );
}

function Card({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/70 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-paper">{title}</h2>
        {right}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

// A simple editable list of plain strings (rules, deliverables, etc.)
function StringListEditor({ items, onChange, placeholder }) {
  function update(i, val) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }
  function remove(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, ""]);
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="rounded-md border border-line px-2.5 py-2 font-mono text-xs text-coral hover:border-coral"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-teal hover:border-teal"
      >
        + Add
      </button>
    </div>
  );
}

export default function AdminSiteContent() {
  const [content, setContent] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/site-content/");
      setContent((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      setError(err.response?.data?.error || "Could not load site content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateEvent(key, value) {
    setContent((prev) => ({ ...prev, event: { ...prev.event, [key]: value } }));
  }

  function updateJudging(i, key, value) {
    const next = [...content.judging_criteria];
    next[i] = { ...next[i], [key]: value };
    setContent((prev) => ({ ...prev, judging_criteria: next }));
  }
  function addJudging() {
    setContent((prev) => ({
      ...prev,
      judging_criteria: [...prev.judging_criteria, { label: "", value: 0 }],
    }));
  }
  function removeJudging(i) {
    setContent((prev) => ({
      ...prev,
      judging_criteria: prev.judging_criteria.filter((_, idx) => idx !== i),
    }));
  }

  function updateStep(i, key, value) {
    const next = [...content.how_to_register];
    next[i] = { ...next[i], [key]: value };
    setContent((prev) => ({ ...prev, how_to_register: next }));
  }
  function addStep() {
    setContent((prev) => ({
      ...prev,
      how_to_register: [...prev.how_to_register, { title: "", desc: "" }],
    }));
  }
  function removeStep(i) {
    setContent((prev) => ({
      ...prev,
      how_to_register: prev.how_to_register.filter((_, idx) => idx !== i),
    }));
  }

  function updateFlow(i, key, value) {
    const next = [...content.event_flow];
    next[i] = { ...next[i], [key]: value };
    setContent((prev) => ({ ...prev, event_flow: next }));
  }
  function addFlow() {
    setContent((prev) => ({
      ...prev,
      event_flow: [...prev.event_flow, { time: "", title: "", desc: "" }],
    }));
  }
  function removeFlow(i) {
    setContent((prev) => ({
      ...prev,
      event_flow: prev.event_flow.filter((_, idx) => idx !== i),
    }));
  }
  function moveFlow(i, dir) {
    const next = [...content.event_flow];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setContent((prev) => ({ ...prev, event_flow: next }));
  }

  function updateCoordinator(i, key, value) {
    const next = [...content.coordinators];
    next[i] = { ...next[i], [key]: value };
    setContent((prev) => ({ ...prev, coordinators: next }));
  }
  function addCoordinator() {
    setContent((prev) => ({
      ...prev,
      coordinators: [...prev.coordinators, { name: "", role: "", phone: "", email: "" }],
    }));
  }
  function removeCoordinator(i) {
    setContent((prev) => ({
      ...prev,
      coordinators: prev.coordinators.filter((_, idx) => idx !== i),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSavedAt(null);
    try {
      const res = await api.put("/admin/site-content/", content);
      setContent((prev) => ({ ...prev, ...res.data }));
      setSavedAt(new Date());
    } catch (err) {
      setError(err.response?.data?.error || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl py-16 text-center text-mist">Loading…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-teal">Admin</p>
              <h1 className="mt-1 font-display text-3xl font-bold text-paper">
                Site Content
              </h1>
              <p className="mt-1 text-sm text-mist">
                Everything you change here updates the public Home page instantly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:border-teal"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-teal to-sky px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-coral/40 bg-coral/10 px-4 py-2 text-sm text-coral">
              {error}
            </p>
          )}
          {savedAt && !error && (
            <p className="mt-4 rounded-md border border-teal/40 bg-teal/10 px-4 py-2 text-sm text-teal">
              Saved.
            </p>
          )}

          <div className="mt-8 space-y-6">
            {/* Event info */}
            <Card title="Event info">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Event name" value={content.event.name} onChange={(v) => updateEvent("name", v)} />
                <Field label="Tagline" value={content.event.tagline} onChange={(v) => updateEvent("tagline", v)} />
                <Field
                  label="Subtitle"
                  value={content.event.subtitle}
                  onChange={(v) => updateEvent("subtitle", v)}
                  textarea
                />
                <Field label="College" value={content.event.college} onChange={(v) => updateEvent("college", v)} />
                <Field label="Place" value={content.event.place} onChange={(v) => updateEvent("place", v)} />
                <Field label="Status label" value={content.event.status} onChange={(v) => updateEvent("status", v)} />
                <Field
                  label="Date label"
                  value={content.event.dateLabel}
                  onChange={(v) => updateEvent("dateLabel", v)}
                />
                <Field
                  label="Venue label"
                  value={content.event.venueLabel}
                  onChange={(v) => updateEvent("venueLabel", v)}
                  textarea
                />
                <Field
                  label="Min team size"
                  type="number"
                  value={content.event.minTeamSize}
                  onChange={(v) => updateEvent("minTeamSize", v)}
                />
                <Field
                  label="Max team size"
                  type="number"
                  value={content.event.maxTeamSize}
                  onChange={(v) => updateEvent("maxTeamSize", v)}
                />
              </div>
            </Card>

            {/* Tracks */}
            <Card title="Tracks">
              <StringListEditor
                items={content.tracks}
                onChange={(tracks) => setContent((prev) => ({ ...prev, tracks }))}
                placeholder="e.g. AI / ML"
              />
            </Card>

            {/* Rules */}
            <Card title="Rules">
              <StringListEditor
                items={content.rules}
                onChange={(rules) => setContent((prev) => ({ ...prev, rules }))}
                placeholder="e.g. Team size: 3–5 members"
              />
            </Card>

            {/* Judging criteria */}
            <Card title="Judging criteria">
              <div className="space-y-2">
                {content.judging_criteria.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={row.label}
                      onChange={(e) => updateJudging(i, "label", e.target.value)}
                      placeholder="Label"
                      className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                    />
                    <input
                      type="number"
                      value={row.value}
                      onChange={(e) => updateJudging(i, "value", Number(e.target.value))}
                      placeholder="Marks"
                      className="w-24 rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                    />
                    <button
                      type="button"
                      onClick={() => removeJudging(i)}
                      className="rounded-md border border-line px-2.5 py-2 font-mono text-xs text-coral hover:border-coral"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addJudging}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-teal hover:border-teal"
                >
                  + Add
                </button>
                <p className="pt-1 font-mono text-xs text-mist">
                  Total: {content.judging_criteria.reduce((s, r) => s + Number(r.value || 0), 0)}
                </p>
              </div>
            </Card>

            {/* Deliverables */}
            <Card title="Deliverables">
              <StringListEditor
                items={content.deliverables}
                onChange={(deliverables) => setContent((prev) => ({ ...prev, deliverables }))}
                placeholder="e.g. Source Code (ZIP)"
              />
            </Card>

            {/* Presentation format */}
            <Card title="Presentation format">
              <StringListEditor
                items={content.presentation_format}
                onChange={(presentation_format) => setContent((prev) => ({ ...prev, presentation_format }))}
                placeholder="e.g. Live demo — 3 min"
              />
            </Card>

            {/* How to register */}
            <Card title="How to register (steps)">
              <div className="space-y-4">
                {content.how_to_register.map((step, i) => (
                  <div key={i} className="rounded-xl border border-line/70 p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                      <input
                        value={step.title}
                        onChange={(e) => updateStep(i, "title", e.target.value)}
                        placeholder="Step title"
                        className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                      />
                      <input
                        value={step.desc}
                        onChange={(e) => updateStep(i, "desc", e.target.value)}
                        placeholder="Description"
                        className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="rounded-md border border-line px-2.5 py-2 font-mono text-xs text-coral hover:border-coral"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-teal hover:border-teal"
                >
                  + Add step
                </button>
              </div>
            </Card>

            {/* Event flow / roadmap */}
            <Card title="Event flow (roadmap)">
              <p className="-mt-1 text-xs text-mist">
                Shown on the Home page as a visual timeline of the event day. Add each stage in
                order — use the ↑ / ↓ buttons to reorder.
              </p>
              <div className="space-y-4">
                {content.event_flow.length === 0 && (
                  <p className="text-sm text-mist">No event flow steps added yet.</p>
                )}
                {content.event_flow.map((step, i) => (
                  <div key={i} className="rounded-xl border border-line/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-wide text-mist">
                        Stage {i + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveFlow(i, -1)}
                          disabled={i === 0}
                          className="rounded-md border border-line px-2 py-1 font-mono text-xs text-paper hover:border-teal disabled:opacity-30"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFlow(i, 1)}
                          disabled={i === content.event_flow.length - 1}
                          className="rounded-md border border-line px-2 py-1 font-mono text-xs text-paper hover:border-teal disabled:opacity-30"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFlow(i)}
                          className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-coral hover:border-coral"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[0.8fr_1.2fr_2fr]">
                      <input
                        value={step.time}
                        onChange={(e) => updateFlow(i, "time", e.target.value)}
                        placeholder="Time e.g. 9:00 AM"
                        className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                      />
                      <input
                        value={step.title}
                        onChange={(e) => updateFlow(i, "title", e.target.value)}
                        placeholder="Stage title e.g. Hacking Begins"
                        className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                      />
                      <input
                        value={step.desc}
                        onChange={(e) => updateFlow(i, "desc", e.target.value)}
                        placeholder="Short description"
                        className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-paper outline-none focus:border-teal"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFlow}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-teal hover:border-teal"
                >
                  + Add stage
                </button>
              </div>
            </Card>

            {/* Coordinators */}
            <Card title="Coordinators">
              <div className="space-y-4">
                {content.coordinators.length === 0 && (
                  <p className="text-sm text-mist">No coordinators added yet.</p>
                )}
                {content.coordinators.map((c, i) => (
                  <div key={i} className="rounded-xl border border-line/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-wide text-mist">
                        Coordinator {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCoordinator(i)}
                        className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-coral hover:border-coral"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Field label="Name" value={c.name} onChange={(v) => updateCoordinator(i, "name", v)} />
                      <Field
                        label="Role"
                        value={c.role}
                        onChange={(v) => updateCoordinator(i, "role", v)}
                      />
                      <Field
                        label="Phone"
                        value={c.phone}
                        onChange={(v) => updateCoordinator(i, "phone", v)}
                      />
                      <Field
                        label="Email"
                        value={c.email}
                        onChange={(v) => updateCoordinator(i, "email", v)}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCoordinator}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-teal hover:border-teal"
                >
                  + Add coordinator
                </button>
              </div>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-teal to-sky px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}