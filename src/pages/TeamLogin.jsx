import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";

export default function TeamLogin() {
  const [rollNo, setRollNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/team/login/", { roll_no: rollNo });

      // Guard against the "success but got HTML/garbage back" case:
      // if there's no token, treat it as a failed login instead of
      // silently navigating to the dashboard with an invalid session.
      if (!res.data || !res.data.token) {
        throw new Error("Unexpected response from server. Check API base URL / routing.");
      }

      localStorage.setItem("team_token", res.data.token);
      localStorage.setItem("team_id", res.data.team_id);
      localStorage.setItem("team_name", res.data.team_name);
      navigate("/team/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout hideFooter>
      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center py-14">
        <div className="animate-pop-in w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky via-violet to-pink font-mono text-lg font-bold text-ink shadow-[0_8px_28px_rgba(79,180,255,0.35)]">
              ▤
            </span>
          </div>
          <p className="text-center font-mono text-xs uppercase tracking-widest text-sky">
            Team leader
          </p>
          <h1 className="mt-2 text-center font-display text-2xl font-bold text-paper">
            Log in with your roll number
          </h1>
          <p className="mt-2 text-center text-sm text-mist">
            Only the team leader's roll number (the one used at registration)
            can log in here.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-surface/70 p-6 backdrop-blur">
            {error && (
              <div className="rounded-md border border-coral/40 bg-coral/10 px-4 py-2.5 text-sm text-coral">
                {error}
              </div>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs text-mist">Roll number</span>
              <input
                required
                autoFocus
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-sky"
                placeholder="e.g. 21A05XXXX"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-sky via-violet to-pink py-2.5 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </main>
    </Layout>
  );
}
