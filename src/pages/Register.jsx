import { useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import Ticket from "../components/Ticket";
import DownloadPdfButton from "../components/DownloadPdfButton";
import { api } from "../lib/api";
import { TRACKS, MIN_TEAM_SIZE, MAX_TEAM_SIZE } from "../lib/constants";

const emptyMember = { name: "", roll_no: "", email: "", phone: "" };
const MAX_EXTRA_MEMBERS = MAX_TEAM_SIZE - 1;
const MIN_EXTRA_MEMBERS = MIN_TEAM_SIZE - 1;

const STEPS = [
  { key: "team", label: "Team", color: "from-teal to-sky" },
  { key: "leader", label: "Leader", color: "from-sky to-violet" },
  { key: "members", label: "Members", color: "from-violet to-pink" },
  { key: "review", label: "Review", color: "from-pink to-amber" },
];

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    team_name: "",
    track: TRACKS[0],
    college: "",
    leader_name: "",
    leader_roll_no: "",
    leader_email: "",
    leader_phone: "",
  });
  const [members, setMembers] = useState(
    Array.from({ length: MIN_EXTRA_MEMBERS }, () => ({ ...emptyMember }))
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const ticketRef = useRef(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateMember(i, field, value) {
    setMembers((m) => m.map((mem, idx) => (idx === i ? { ...mem, [field]: value } : mem)));
  }

  function addMember() {
    if (members.length < MAX_EXTRA_MEMBERS) {
      setMembers((m) => [...m, { ...emptyMember }]);
    }
  }

  function removeMember(i) {
    if (members.length > MIN_EXTRA_MEMBERS) {
      setMembers((m) => m.filter((_, idx) => idx !== i));
    }
  }

  const stepValid = useMemo(() => {
    if (step === 0) return form.team_name.trim().length > 0;
    if (step === 1) {
      return (
        form.leader_name.trim() &&
        form.leader_roll_no.trim() &&
        form.leader_email.trim() &&
        form.leader_phone.trim()
      );
    }
    if (step === 2) {
      return members.every((m) => m.name.trim() && m.roll_no.trim() && m.email.trim() && m.phone.trim());
    }
    return true;
  }, [step, form, members]);

  function goNext() {
    if (!stepValid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        members: members.filter((m) => m.name.trim()).map((m) => ({ ...m })),
      };
      const res = await api.post("/register/", payload);
      setResult({
        teamId: res.data.team_id,
        teamName: form.team_name,
        track: form.track,
        leaderName: form.leader_name,
        memberCount: 1 + payload.members.length,
      });
    } catch (err) {
      const data = err.response?.data?.error;
      if (typeof data === "string") {
        setErrors({ general: data });
      } else if (data && typeof data === "object") {
        const flat = {};
        for (const [k, v] of Object.entries(data)) flat[k] = Array.isArray(v) ? v[0] : v;
        setErrors(flat);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
      setStep(0);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Layout>
        <main className="px-0 py-14 sm:py-16">
          <div className="animate-pop-in mx-auto mb-8 flex max-w-md items-center justify-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-teal">
            🎉 You're in
          </div>
          <div className="overflow-x-auto pb-2">
            <Ticket
              ref={ticketRef}
              teamId={result.teamId}
              teamName={result.teamName}
              track={result.track}
              leaderName={result.leaderName}
              memberCount={result.memberCount}
            />
          </div>
          <p className="mt-2 text-center text-xs text-faint sm:hidden">
            Scroll sideways to see the full certificate →
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <DownloadPdfButton
              targetRef={ticketRef}
              filename={`ticket-${result.teamName.replace(/\s+/g, "-").toLowerCase()}`}
              label="Download ticket (PDF)"
              background="#fdfaf2"
            />
            <p className="text-center text-sm text-mist">
              Save your team ID — you may need it at check-in.
            </p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="py-10 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-teal">
            Team registration
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-paper">
            Sign your team up
          </h1>
          <p className="mt-2 text-sm text-mist">
            {MIN_TEAM_SIZE}–{MAX_TEAM_SIZE} members, including the leader.
          </p>

          {/* Progress */}
          <div className="mt-8 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold transition-all ${
                    i <= step
                      ? `bg-gradient-to-br ${s.color} text-ink`
                      : "border border-line text-mist"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`hidden font-mono text-[11px] uppercase tracking-widest sm:inline ${
                    i <= step ? "text-paper" : "text-mist"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="h-px flex-1 bg-line">
                    <div
                      className={`h-px bg-gradient-to-r ${s.color} transition-all duration-500`}
                      style={{ width: i < step ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {errors.general && (
            <div className="mt-6 rounded-md border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            {step === 0 && (
              <fieldset className="animate-pop-in space-y-4">
                <Legend color="text-teal">Team</Legend>
                <Field label="Team name" error={errors.team_name}>
                  <input
                    required
                    autoFocus
                    value={form.team_name}
                    onChange={(e) => update("team_name", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Byte Busters"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Track">
                    <select
                      value={form.track}
                      onChange={(e) => update("track", e.target.value)}
                      className={inputClass}
                    >
                      {TRACKS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="College / Organization">
                    <input
                      value={form.college}
                      onChange={(e) => update("college", e.target.value)}
                      className={inputClass}
                      placeholder="If not BVC Engineering College"
                    />
                  </Field>
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="animate-pop-in space-y-4">
                <Legend color="text-sky">Team leader</Legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.leader_name}>
                    <input
                      required
                      autoFocus
                      value={form.leader_name}
                      onChange={(e) => update("leader_name", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Roll number" error={errors.leader_roll_no}>
                    <input
                      required
                      value={form.leader_roll_no}
                      onChange={(e) => update("leader_roll_no", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email" error={errors.leader_email}>
                    <input
                      required
                      type="email"
                      value={form.leader_email}
                      onChange={(e) => update("leader_email", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone" error={errors.leader_phone}>
                    <input
                      required
                      value={form.leader_phone}
                      onChange={(e) => update("leader_phone", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset className="animate-pop-in space-y-4">
                <div className="flex items-center justify-between">
                  <Legend color="text-violet">Team members</Legend>
                  {errors.members && <span className="text-xs text-coral">{errors.members}</span>}
                </div>
                {members.map((m, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2"
                  >
                    <div className="col-span-full flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                        Member {i + 2}
                      </span>
                      {members.length > MIN_EXTRA_MEMBERS && (
                        <button
                          type="button"
                          onClick={() => removeMember(i)}
                          className="font-mono text-[10px] text-coral hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      required
                      placeholder="Full name"
                      value={m.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="Roll number"
                      value={m.roll_no}
                      onChange={(e) => updateMember(i, "roll_no", e.target.value)}
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="Email"
                      type="email"
                      value={m.email}
                      onChange={(e) => updateMember(i, "email", e.target.value)}
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="Phone"
                      value={m.phone}
                      onChange={(e) => updateMember(i, "phone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
                {members.length < MAX_EXTRA_MEMBERS && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="font-mono text-xs text-violet hover:underline"
                  >
                    + Add another member
                  </button>
                )}
              </fieldset>
            )}

            {step === 3 && (
              <fieldset className="animate-pop-in space-y-4">
                <Legend color="text-pink">Review</Legend>
                <div className="rounded-xl border border-line bg-surface p-5 text-sm">
                  <ReviewRow label="Team" value={form.team_name} />
                  <ReviewRow label="Track" value={form.track} />
                  <ReviewRow label="College" value={form.college || "BVC Engineering College"} />
                  <ReviewRow label="Leader" value={`${form.leader_name} · ${form.leader_roll_no}`} />
                  <ReviewRow label="Leader contact" value={`${form.leader_email} · ${form.leader_phone}`} />
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-xs text-mist">Members</p>
                    <ul className="mt-1.5 space-y-1 text-paper">
                      {members.filter((m) => m.name.trim()).map((m, i) => (
                        <li key={i}>{m.name} — {m.roll_no}</li>
                      ))}
                      {members.every((m) => !m.name.trim()) && (
                        <li className="text-mist">Solo team — just the leader.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </fieldset>
            )}

            {/* Step controls */}
            <div className="mt-8 flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-line px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-mist"
                >
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!stepValid}
                  className="flex-1 rounded-full bg-gradient-to-r from-teal via-sky to-violet py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-gradient-to-r from-pink via-violet to-teal py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit registration"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-mist/70 focus:border-teal";

function Legend({ children, color = "text-teal" }) {
  return (
    <p className={`font-mono text-xs uppercase tracking-widest ${color}`}>{children}</p>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-mist">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-coral">{error}</span>}
    </label>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-1 text-sm">
      <span className="text-xs uppercase tracking-widest text-mist">{label}</span>
      <span className="text-paper">{value || "—"}</span>
    </div>
  );
}