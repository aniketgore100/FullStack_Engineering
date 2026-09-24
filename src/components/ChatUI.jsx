import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const suggestions = [
  "Learn Python from scratch",
  "Understand how the stock market works",
  "Get started with UI design",
  "Machine learning, explained simply",
];


export const ChatUI = ({ onSubmit, loading = false, children }) => {
  const [prompt, setPrompt] = useState("");
  const areaRef = useRef(null);
  const canSend = prompt.trim().length > 0 && !loading;

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [prompt]);

  const send = () => {
    if (!canSend) return;
    onSubmit?.(prompt.trim());
    setPrompt("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* results */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col py-6">
          {children ?? (
            <div className="m-auto flex flex-col items-center text-center">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white shadow-sm">
                <Sparkles size={18} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                What do you want to learn?
              </h2>
              <p className="mt-1.5 max-w-sm text-[13px] text-zinc-500">
                Tell us a topic and your level. We&apos;ll build a course
                around you, with lessons, examples and quizzes.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setPrompt(s);
                      areaRef.current?.focus();
                    }}
                    className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[12px] text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 active:scale-[0.97]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* prompt box, pinned at the bottom */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/70">
            <textarea
              ref={areaRef}
              rows={1}
              value={prompt}
              disabled={loading}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="What do you want to learn? Add your level or goal for a better course..."
              className="max-h-40 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-5 text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60"
            />
            <button
              onClick={send}
              disabled={!canSend}
              aria-label="Generate my course"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUp size={16} strokeWidth={2.5} />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-zinc-400">
            Enter to build your course · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
};
