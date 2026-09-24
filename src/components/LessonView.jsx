import { ArrowLeft, Check, Lightbulb, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import LessonContent from "./LessonContent";

// The lesson for one step. The backend writes it the first time it's opened
// (a few seconds) and serves it from the database after that.
export default function LessonView({ courseId, step, index, total, isDone, onBack, onComplete }) {
  const last = index === total - 1;
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .post(`/courses/${courseId}/steps/${step.id}/lesson`)
      .then((data) => alive && setState({ status: "ready", lesson: data.lesson }))
      .catch((err) => alive && setState({ status: "error", message: err.message }));
    return () => {
      alive = false;
    };
  }, [courseId, step.id, attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  };

  const { lesson } = state;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 rounded-md py-1 pr-2 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft size={14} /> Back to roadmap
      </button>

      <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        {/* segmented progress */}
        <div className="mb-4 flex gap-1">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= index ? "bg-indigo-500" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>

        <p className="text-[12px] font-medium text-indigo-600">
          Step {index + 1} of {total} · {step.duration}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{step.title}</h2>
        <p className="mt-2 text-[14px] leading-6 text-zinc-600">{step.overview}</p>

        <div className="mt-6 border-t border-zinc-100 pt-5">
          {state.status === "loading" && (
            <div>
              <p className="text-[13px] font-medium text-zinc-700">Writing your lesson...</p>
              <p className="mt-0.5 text-[12px] text-zinc-400">
                This takes a few seconds the first time. It&apos;s saved, so it opens instantly after that.
              </p>
              <div className="mt-4 animate-pulse space-y-2.5">
                <div className="h-3 w-2/5 rounded bg-zinc-200" />
                <div className="h-3 w-full rounded bg-zinc-100" />
                <div className="h-3 w-11/12 rounded bg-zinc-100" />
                <div className="h-3 w-3/5 rounded bg-zinc-100" />
                <div className="mt-5 h-3 w-1/3 rounded bg-zinc-200" />
                <div className="h-3 w-full rounded bg-zinc-100" />
                <div className="h-3 w-4/5 rounded bg-zinc-100" />
              </div>
            </div>
          )}

          {state.status === "error" && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-[13px] text-rose-600">{state.message}</p>
              <button
                onClick={retry}
                className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-[13px] font-medium text-white transition hover:bg-indigo-700 active:scale-[0.97]"
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          )}

          {lesson && (
            <div className="space-y-6">
              {lesson.sections.map((s) => (
                <section key={s.heading}>
                  <h3 className="mb-2 text-[15px] font-semibold text-zinc-900">{s.heading}</h3>
                  <LessonContent body={s.body} />
                </section>
              ))}

              {lesson.takeaways.length > 0 && (
                <section className="rounded-xl bg-indigo-50/60 p-4">
                  <h3 className="text-[13px] font-semibold text-indigo-900">Key takeaways</h3>
                  <ul className="mt-2 space-y-1.5">
                    {lesson.takeaways.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-[13px] leading-5 text-zinc-700">
                        <Check size={14} className="mt-0.5 shrink-0 text-indigo-500" /> {t}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {lesson.exercise && (
                <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-900">
                    <Lightbulb size={14} /> Try it yourself
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-zinc-700">{lesson.exercise}</p>
                </section>
              )}
            </div>
          )}
        </div>
      </article>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.97]"
        >
          Back to roadmap
        </button>
        <button
          onClick={isDone ? onBack : onComplete}
          disabled={!lesson && !isDone}
          className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-[13px] font-medium text-white transition hover:bg-indigo-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={14} strokeWidth={2.5} />
          {isDone ? "Done" : last ? "Complete course" : "Complete & continue"}
        </button>
      </div>
    </div>
  );
}
