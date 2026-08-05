import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login/", { username, password });
      localStorage.setItem("admin_access", res.data.access);
      localStorage.setItem("admin_username", res.data.username);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout hideFooter>
      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center py-14">
        <div className="animate-pop-in w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber via-coral to-pink font-mono text-lg font-bold text-ink shadow-[0_8px_28px_rgba(255,182,72,0.35)]">
              ⚙
            </span>
          </div>
          <p className="text-center font-mono text-xs uppercase tracking-widest text-amber">
            Admin
          </p>
          <h1 className="mt-2 text-center font-display text-2xl font-bold text-paper">
            Sign in to the dashboard
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-surface/70 p-6 backdrop-blur">
            {error && (
              <div className="rounded-md border border-coral/40 bg-coral/10 px-4 py-2.5 text-sm text-coral">
                {error}
              </div>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs text-mist">Username</span>
              <input
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-amber"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-mist">Password</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-amber"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-amber via-coral to-pink py-2.5 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    </Layout>
  );
}
