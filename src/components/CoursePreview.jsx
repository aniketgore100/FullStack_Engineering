import { ArrowRight, BarChart3, Check, Clock, Flag, Layers, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LessonView from "./LessonView";

const COLORS = { done: "#34d399", active: "#6366f1", idle: "#d4d0c6" };

// The path between two cards: a column of dots. Emerald once travelled,
// indigo and moving toward the step you're heading to, grey while ahead.
function Connector({ state }) {
  return (
    <div
      aria-hidden
      className={`mx-auto h-9 w-1 ${state === "active" ? "animate-march" : ""}`}
      style={{
        backgroundImage: `radial-gradient(circle, ${COLORS[state]} 1.6px, transparent 2px)`,
        backgroundSize: "4px 9px",
      }}
    />
  );
}

function Badge({ status, index }) {
  const look = {
    done: "bg-emerald-500 text-white",
    current: "bg-indigo-600 text-white ring-4 ring-indigo-100",
    locked: "bg-zinc-100 text-zinc-400",
  };
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors duration-300 ${look[status]}`}
    >
      {status === "done" ? (
        <Check size={16} strokeWidth={3} />
      ) : status === "locked" ? (
        <Lock size={14} />
      ) : (
        index + 1
      )}
    </span>
  );
}

/**
 * Course roadmap: one column of step cards joined by a dotted path.
 * Steps unlock one at a time. Finish a lesson and the path fills in and the
 * next card becomes current.
 * - course: { title, summary, level, duration, steps: [...], progress }
 * - onProgress(n): called with the number of completed steps after each completion
 */
export function CoursePreview({ course, onProgress }) {
  const { steps } = course;
  const [completed, setCompleted] = useState(() => steps.map((_, i) => i < course.progress));
  const [openIdx, setOpenIdx] = useState(null); // lesson being read

  const doneCount = completed.filter(Boolean).length;
  const currentIdx = completed.indexOf(false); // -1 when everything is done
  const allDone = currentIdx === -1;

  const statusOf = (i) => (completed[i] ? "done" : i === currentIdx ? "current" : "locked");

  const completeStep = (i) => {
    if (!completed[i]) {
      setCompleted((c) => c.map((v, j) => (j === i ? true : v)));
      onProgress?.(i + 1);
    }
    setOpenIdx(null);
  };

  // when a lesson closes, glide the roadmap to the step you're on now
  const currentRef = useRef(null);
  const prevOpen = useRef(null);
  useEffect(() => {
    if (prevOpen.current !== null && openIdx === null) {
      currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    prevOpen.current = openIdx;
  }, [openIdx]);

  if (openIdx !== null) {
    return (
      <LessonView
        key={steps[openIdx].id}
        courseId={course.id}
        step={steps[openIdx]}
        index={openIdx}
        total={steps.length}
        isDone={completed[openIdx]}
        onBack={() => setOpenIdx(null)}
        onComplete={() => completeStep(openIdx)}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* header */}
      <div className="mb-6">
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
          Course preview
        </span>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
          {course.title}
        </h2>
        <p className="mt-1 text-[13px] text-zinc-500">{course.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[12px] text-zinc-600">
          {[
            [BarChart3, course.level],
            [Layers, `${steps.length} steps`],
            [Clock, course.duration],
          ].map(([Icon, label]) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white/70 px-2.5 py-1"
            >
              <Icon size={12} className="text-zinc-400" /> {label}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[12px] text-zinc-500">
            {doneCount} of {steps.length} steps completed
          </p>
        </div>
      </div>

      {/* path */}
      <ol>
        {steps.map((s, i) => {
          const status = statusOf(i);
          const locked = status === "locked";
          const link =
            completed[i] && completed[i + 1] ? "done" : completed[i] ? "active" : "idle";

          return (
            <li key={s.id}>
              <button
                ref={status === "current" ? currentRef : null}
                onClick={() => !locked && setOpenIdx(i)}
                aria-disabled={locked}
                title={locked ? "Complete the previous step to unlock this one" : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                  locked
                    ? "cursor-not-allowed border-zinc-200/70 bg-white/50"
                    : status === "current"
                      ? "border-indigo-300 bg-white shadow-md ring-4 ring-indigo-100/70 hover:-translate-y-0.5"
                      : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <Badge status={status} index={i} />

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-zinc-400">
                    Step {i + 1} · {s.duration}
                  </p>
                  <p
                    className={`truncate text-[14px] font-semibold ${
                      locked ? "text-zinc-400" : "text-zinc-900"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="truncate text-[12px] text-zinc-500">{s.summary}</p>
                </div>

                {status === "done" && (
                  <span className="shrink-0 text-[12px] font-medium text-emerald-600">
                    Completed
                  </span>
                )}
                {status === "current" && (
                  <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-indigo-600">
                    Start <ArrowRight size={13} />
                  </span>
                )}
              </button>

              <Connector state={link} />
            </li>
          );
        })}

        {/* end of the path */}
        <li className="flex flex-col items-center gap-1.5">
          <span
            className={`grid h-10 w-10 place-items-center rounded-full border transition-colors duration-500 ${
              allDone
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-300 bg-white text-zinc-400"
            }`}
          >
            <Flag size={16} />
          </span>
          <span className="text-[12px] font-medium text-zinc-500">
            {allDone ? "Course complete" : "Finish"}
          </span>
        </li>
      </ol>
    </div>
  );
}

export function CourseSkeleton() {
  return (
    <div className="mx-auto w-full max-w-xl animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-4 w-24 rounded-full bg-zinc-200" />
        <div className="h-5 w-64 rounded bg-zinc-200" />
        <div className="h-3 w-80 max-w-full rounded bg-zinc-200/70" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i}>
          <div className="h-[76px] rounded-2xl border border-zinc-200 bg-white/70" />
          <Connector state="idle" />
        </div>
      ))}
    </div>
  );
}
