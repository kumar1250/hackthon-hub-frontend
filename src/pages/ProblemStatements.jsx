import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { api } from "../lib/api";

const DIFFICULTY_COLOR = {
  Easy: "text-teal border-teal/40 bg-teal/10",
  Medium: "text-amber border-amber/40 bg-amber/10",
  Hard: "text-coral border-coral/40 bg-coral/10",
};

const TRACK_ACCENTS = ["border-teal/40", "border-violet/40", "border-pink/40", "border-sky/40", "border-amber/40", "border-coral/40"];

export default function ProblemStatements() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/problems/")
      .then((res) => setProblems(res.data.problems))
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <main className="pb-16 sm:pb-20">
        <section className="mx-auto max-w-5xl pt-10 sm:pt-14">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal sm:text-xs">
            Pick a challenge
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-teal via-violet to-pink bg-clip-text text-transparent">
              Problem Statements
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-mist sm:text-base">
            Browse the problem statements available for this hackathon and
            pick one that fits your team's track and interests.
          </p>

          {loading && (
            <p className="mt-8 text-sm text-mist sm:mt-10">
              Loading problem statements…
            </p>
          )}

          {!loading && problems.length === 0 && (
            <p className="mt-8 text-sm text-mist sm:mt-10">
              Problem statements haven't been published yet — check back soon.
            </p>
          )}

          {!loading && problems.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2">
              {problems.map((p, i) => (
                <Reveal key={p.id} delay={(i % 6) * 60}>
                  <div
                    className={`rounded-xl border ${TRACK_ACCENTS[i % TRACK_ACCENTS.length]} bg-surface p-4 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(76,29,149,0.15)] sm:p-5`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-display text-base font-semibold leading-snug text-paper sm:text-lg">
                        {p.title}
                      </h3>
                      {p.difficulty && (
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                            DIFFICULTY_COLOR[p.difficulty] || "text-mist border-line"
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      )}
                    </div>
                    {p.track && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-violet sm:text-[11px]">
                        {p.track}
                      </p>
                    )}
                    {p.description && (
                      <p className="mt-3 text-sm leading-relaxed text-mist">
                        {p.description}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
