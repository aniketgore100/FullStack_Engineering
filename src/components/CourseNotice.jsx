import { Compass, RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Shown in place of a course when generation didn't produce one.
 * kind "rejected": the prompt isn't something we build a course for.
 * kind "error": something broke on our side, so offer a retry.
 */
export default function CourseNotice({ kind, message, suggestions = [], onPick, onRetry }) {
  const rejected = kind === "rejected";
  const Icon = rejected ? Compass : TriangleAlert;

  return (
    <div className="m-auto flex max-w-md flex-col items-center text-center">
      <div
        className={`mb-4 grid h-10 w-10 place-items-center rounded-xl border bg-white shadow-sm ${
          rejected ? "border-zinc-200 text-indigo-600" : "border-rose-200 text-rose-500"
        }`}
      >
        <Icon size={18} />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
        {rejected ? "Let's turn that into something to learn" : "We couldn't build your course"}
      </h2>
      <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">{message}</p>

      {rejected && suggestions.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onPick(s)}
              className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[12px] text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 active:scale-[0.97]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {!rejected && onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-[13px] font-medium text-white transition hover:bg-indigo-700 active:scale-[0.97]"
        >
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
