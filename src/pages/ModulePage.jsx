import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Lightbulb,
} from "lucide-react";

const COURSE_TITLE = "Introduction to React";
const MODULES = [
  { order: 1, title: "Getting Started", done: true },
  { order: 2, title: "Components & JSX", done: true },
  { order: 3, title: "Props and State", done: false, current: true },
  { order: 4, title: "Handling Events", done: false },
  { order: 5, title: "Hooks in Depth", done: false },
  { order: 6, title: "Routing", done: false },
];
const MODULE = {
  order: 3,
  title: "Props and State",
  description: "Learn how data flows through a React app and how components remember things.",
  readTime: "12 min read",
  sections: [
    {
      heading: "What are props?",
      body: "Props are inputs passed from a parent component to a child. They are read-only, which keeps data flow predictable and easy to debug.",
      code: `function Greeting({ name }) {\n  return <h2>Hello, {name}!</h2>;\n}\n\n<Greeting name="Ada" />`,
    },
    {
      heading: "What is state?",
      body: "State is data a component owns and can change over time. When state updates, React re-renders the component to match.",
      code: `const [count, setCount] = useState(0);\n\n<button onClick={() => setCount(count + 1)}>\n  Clicked {count} times\n</button>`,
    },
    {
      heading: "Lifting state up",
      body: "When two components need the same data, move the state to their closest common parent and pass it down through props.",
    },
  ],
  takeaways: [
    "Props flow down, and they are read-only.",
    "State is owned by a component and triggers re-renders.",
    "Lift state up to share it between siblings.",
  ],
};

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-zinc-500">
      <button type="button" className="inline-flex items-center gap-1 font-medium hover:text-brand">
        <ArrowLeft size={12} />
        {COURSE_TITLE}
      </button>
      <ChevronRight size={12} className="text-zinc-300" />
      <span className="font-medium text-zinc-900">Module {MODULE.order}</span>
    </nav>
  );
}

function CodeBlock({ code }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs leading-5 text-zinc-100">
      <code>{code}</code>
    </pre>
  );
}

function LessonSection({ section }) {
  return (
    <section>
      <h2 className="font-display text-base font-bold text-zinc-900">{section.heading}</h2>
      <p className="mt-1.5 text-sm leading-6 text-zinc-600">{section.body}</p>
      {section.code && <CodeBlock code={section.code} />}
    </section>
  );
}

function ModuleList() {
  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm lg:sticky lg:top-0">
      <h3 className="px-1 pb-2 font-display text-sm font-bold text-zinc-900">Course Modules</h3>
      <ol className="flex flex-col gap-1">
        {MODULES.map((m) => (
          <li key={m.order}>
            <button
              type="button"
              aria-current={m.current ? "step" : undefined}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                m.current
                  ? "bg-indigo-50 font-semibold text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {m.done ? (
                <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
              ) : (
                <Circle size={14} className="shrink-0 text-zinc-300" />
              )}
              <span className="min-w-0 truncate">
                {String(m.order).padStart(2, "0")} · {m.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export default function ModulePage() {
  const doneCount = MODULES.filter((m) => m.done).length;
  const progress = Math.round((doneCount / MODULES.length) * 100);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex w-full flex-col gap-4">
        <Breadcrumb />

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_260px]">
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700">
                Module {String(MODULE.order).padStart(2, "0")}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                <Clock size={12} />
                {MODULE.readTime}
              </span>
            </div>

            <h1 className="mt-2 font-display text-xl font-bold text-zinc-900">{MODULE.title}</h1>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500">{MODULE.description}</p>

            <div className="mt-5 flex flex-col gap-6">
              {MODULE.sections.map((s) => (
                <LessonSection key={s.heading} section={s} />
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-indigo-700">
                <Lightbulb size={14} />
                Key Takeaways
              </h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {MODULE.takeaways.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xs leading-5 text-zinc-700">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-indigo-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                <ArrowLeft size={13} />
                Previous
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <CheckCircle2 size={13} />
                  Mark as Complete
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-[13px] font-semibold text-white transition hover:opacity-90"
                >
                  Next Module
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={12} />
                  Progress
                </span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Course progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100"
              >
                <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ModuleList />
          </div>
        </div>
      </div>
    </div>
  );
}
