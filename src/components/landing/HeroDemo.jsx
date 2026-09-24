import { ArrowUp, Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const PROMPT = "Learn Python from scratch";
const STEPS = [
  ["Setting up and saying hello", "25 min"],
  ["Variables and data types", "40 min"],
  ["Making decisions", "45 min"],
  ["Loops and functions", "1 hr"],
  ["Build a mini project", "1.5 hrs"],
];

// the demo is one looping timeline, driven by a single tick counter (60ms each)
const TYPE_END = PROMPT.length * 2; // one character every 2 ticks
const GEN_END = TYPE_END + 9; // "designing your roadmap" pause
const STEP_TICKS = 9;
const TOTAL = GEN_END + STEPS.length * STEP_TICKS + 45; // then hold, then restart

export default function HeroDemo() {
  // reduced motion: freeze on the finished frame instead of looping
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [t, setT] = useState(reduced ? TOTAL - 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setT((n) => (n + 1) % TOTAL), 60);
    return () => clearInterval(id);
  }, [reduced]);

  const typed = Math.min(PROMPT.length, Math.floor(t / 2));
  const typing = t < TYPE_END;
  const generating = t >= TYPE_END && t < GEN_END;
  const shown = t < GEN_END ? 0 : Math.min(STEPS.length, Math.floor((t - GEN_END) / STEP_TICKS) + 1);
  const done = shown === STEPS.length;

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* floating accents */}
      <span className="animate-float absolute -right-2 -top-4 z-10 hidden items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-sm sm:flex">
        <Sparkles size={11} className="text-indigo-500" /> Made for your level
      </span>
      <span
        className="animate-float absolute -bottom-3 -left-3 z-10 hidden items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-sm sm:flex"
        style={{ animationDelay: "-3s" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready in seconds
      </span>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 shadow-xl shadow-zinc-900/5 backdrop-blur">
        {/* window bar */}
        <div className="flex items-center gap-1.5 border-b border-zinc-100 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="ml-2 text-[11px] font-medium text-zinc-400">New course</span>
        </div>

        <div className="h-[436px] p-4">
          {/* prompt box */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 pl-3 shadow-sm">
            <p className="min-h-5 flex-1 truncate text-[13px] text-zinc-800">
              {PROMPT.slice(0, typed)}
              {typing && (
                <span className="animate-blink ml-px inline-block h-3.5 w-px translate-y-0.5 bg-indigo-500" />
              )}
              {typed === 0 && <span className="text-zinc-400">What do you want to learn?</span>}
            </p>
            <span
              className={`grid h-7 w-7 place-items-center rounded-lg text-white transition-colors duration-300 ${
                typed === PROMPT.length ? "bg-indigo-600" : "bg-zinc-200"
              }`}
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
            </span>
          </div>

          {/* status line */}
          <div className="mt-3 flex h-5 items-center justify-between px-1 text-[12px]">
            <span
              className={`font-medium text-zinc-500 transition-opacity duration-300 ${
                generating || shown > 0 ? "opacity-100" : "opacity-0"
              }`}
            >
              {generating ? "Designing your roadmap..." : "Your roadmap"}
            </span>
            <span
              className={`rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700 transition-opacity duration-300 ${
                shown > 0 ? "opacity-100" : "opacity-0"
              }`}
            >
              Beginner
            </span>
          </div>

          {/* roadmap */}
          <ol className="relative mt-3 space-y-2">
            <span
              className="absolute left-[13px] top-[27px] w-px border-l border-dashed border-indigo-300 transition-all duration-500"
              style={{ height: shown > 1 ? `${(shown - 1) * 62}px` : 0 }}
            />
            {STEPS.map(([title, time], i) => {
              const on = i < shown;
              return (
                <li
                  key={title}
                  className={`relative flex h-[54px] items-center gap-3 transition-all duration-500 ease-out ${
                    on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                >
                  <span
                    className={`z-10 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border text-[11px] font-semibold ${
                      i === shown - 1 && !done
                        ? "border-indigo-600 bg-indigo-600 text-white ring-4 ring-indigo-100"
                        : "border-indigo-200 bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {done || i < shown - 1 ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  <div
                    className={`flex-1 rounded-lg border bg-white px-3 py-2 ${
                      i % 2 ? "sm:ml-6" : "sm:mr-6"
                    } ${i === shown - 1 && !done ? "border-indigo-200" : "border-zinc-200"}`}
                  >
                    <p className="truncate text-[12.5px] font-medium text-zinc-900">{title}</p>
                    <p className="text-[11px] text-zinc-400">
                      Step {i + 1} · {time}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
