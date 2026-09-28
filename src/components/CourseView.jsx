import { BarChart3, Clock, Layers, Play } from "lucide-react";

const DEFAULT_TIME = "4 hours";
const DEFAULT_DIFFICULTY = "Beginner";

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700">
      <Icon size={12} />
      {children}
    </span>
  );
}

function ModuleCard({ module }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 shadow-sm transition hover:border-indigo-200">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">
        {String(module.order).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold leading-5 text-zinc-900">{module.title}</h3>
        <p className="mt-0.5 text-xs leading-5 text-zinc-500">{module.description}</p>
      </div>
    </li>
  );
}

export default function CourseView({ course }) {
  const modules = [...course.modules].sort((a, b) => a.order - b.order);
  const time = course.estimatedTime || DEFAULT_TIME;
  const difficulty = course.difficulty || DEFAULT_DIFFICULTY;
  const progress = Math.min(100, Math.max(0, Number(course.progress) || 0));

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-zinc-900">{course.title}</h1>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500">{course.description}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Chip icon={Layers}>{modules.length} Modules</Chip>
              <Chip icon={Clock}>{time}</Chip>
              <Chip icon={BarChart3}>{difficulty}</Chip>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-[13px] font-semibold text-white transition hover:opacity-90"
          >
            <Play size={12} fill="currentColor" />
            Start Course
          </button>
        </div>

        <div className="mt-3.5 flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Course progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-medium tabular-nums text-zinc-500">{progress}%</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-display text-sm font-bold text-zinc-900">
          Course Modules ({modules.length})
        </h2>
        <ol className="grid gap-2 lg:grid-cols-2">
          {modules.map((m) => (
            <ModuleCard key={m.order} module={m} />
          ))}
        </ol>
      </div>
    </section>
  );
}
