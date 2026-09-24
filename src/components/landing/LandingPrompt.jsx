import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { savePendingPrompt } from "../../lib/pendingPrompt";

const EXAMPLES = [
  "Learn Python from scratch",
  "Understand how the stock market works",
  "Get started with UI design",
  "Machine learning, explained simply",
  "Spanish for my trip to Madrid",
];

// The front door of the app: type a topic, press Enter, sign in with Google,
// and land in the app with your course already being built.
export default function LandingPrompt({ error }) {
  const [value, setValue] = useState("");
  const [example, setExample] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  const [nudge, setNudge] = useState(false);
  const areaRef = useRef(null);

  // rotate the placeholder examples
  useEffect(() => {
    const id = setInterval(() => setExample((i) => (i + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(id);
  }, []);

  // coming back with the browser's back button shouldn't leave it stuck
  useEffect(() => {
    const onShow = (e) => e.persisted && setRedirecting(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // grow with the text, up to a cap
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const submit = () => {
    if (redirecting) return;
    const text = value.trim();
    if (!text) {
      // empty: a little shake instead of doing nothing
      setNudge(true);
      setTimeout(() => setNudge(false), 400);
      areaRef.current?.focus();
      return;
    }
    savePendingPrompt(text);
    setRedirecting(true);
    window.location.assign("/api/auth/google");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          What do you want to learn?
        </h2>
        <p className="mt-2 text-[14px] text-zinc-500">
          Type a topic and press Enter. Your course starts building as soon as you sign in.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-[13px] text-rose-700"
        >
          {error}
        </p>
      )}

      <div
        className={`mt-6 flex items-start gap-2 rounded-2xl border bg-white p-2.5 shadow-lg shadow-zinc-900/5 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/70 ${
          nudge ? "animate-shake border-rose-300" : "border-zinc-200"
        }`}
      >
        <span className="grid h-10 w-8 shrink-0 place-items-center text-indigo-500">
          <Sparkles size={18} />
        </span>

        <div className="relative min-w-0 flex-1">
          {!value && (
            <span
              key={example}
              aria-hidden
              className="animate-fade-up pointer-events-none absolute left-0 top-2 truncate text-[15px] leading-6 text-zinc-400"
            >
              {EXAMPLES[example]}
            </span>
          )}
          <textarea
            ref={areaRef}
            rows={1}
            value={value}
            maxLength={500}
            readOnly={redirecting}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            data-lenis-prevent
            aria-label="What do you want to learn?"
            className="block max-h-36 min-h-10 w-full resize-none bg-transparent py-2 text-[15px] leading-6 text-zinc-900 outline-none"
          />
        </div>

        <button
          onClick={submit}
          aria-label="Continue with Google to generate this course"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition duration-200 active:scale-95 ${
            value.trim() || redirecting
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-zinc-200 text-zinc-400"
          }`}
        >
          {redirecting ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
        </button>
      </div>

      {/* suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {EXAMPLES.slice(0, 4).map((s) => (
          <button
            key={s}
            onClick={() => {
              setValue(s);
              areaRef.current?.focus();
            }}
            className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[12px] text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-900 active:scale-[0.97]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
