import {
  BookOpen,
  MessageSquareText,
  Route,
  Sparkles,
  Zap,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import GoogleButton from "../components/landing/GoogleButton";
import HeroDemo from "../components/landing/HeroDemo";
import LandingPrompt from "../components/landing/LandingPrompt";
import Reveal from "../components/landing/Reveal";
import SmoothScroll from "../components/landing/SmoothScroll";

const errors = {
  cancelled: "Sign-in was cancelled. You can try again whenever you're ready.",
  unverified:
    "That Google account's email isn't verified, so we couldn't sign you in.",
  not_configured: "Google sign-in isn't set up on this server yet.",
  failed: "We couldn't sign you in. Please try again.",
};

const perks = [
  [Sparkles, "A roadmap made for your level"],
  [Route, "Lessons that open step by step"],
  [Zap, "Ready in seconds, not weeks"],
];

const how = [
  [
    MessageSquareText,
    "Tell us what to learn",
    "Type any topic, from Python to personal finance. Add your level or goal if you like.",
  ],
  [
    Route,
    "Get your roadmap",
    "AI designs a clear path of steps, sized to how much time and experience you have.",
  ],
  [
    BookOpen,
    "Learn one step at a time",
    "Open a step, read the lesson, then move on. No guessing what comes next.",
  ],
];

export const Login = () => {
  const [params] = useSearchParams();
  const error =
    errors[params.get("error")] ?? (params.get("error") ? errors.failed : null);

  return (
    <SmoothScroll>
      <div className="bg-dots min-h-dvh text-zinc-900">
        {/* nav */}
        <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              Courseify
            </span>
          </div>
          <a
            href="#how"
            className="text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            How it works
          </a>
        </header>

        <main>
          {/* hero */}
          <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-14">
            <div className="min-w-0">
              <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[12px] font-medium text-indigo-700">
                <Sparkles size={12} /> AI course generator
              </span>

              <h1
                className="animate-fade-up mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl"
                style={{ animationDelay: "80ms" }}
              >
                Learn anything with a course{" "}
                <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  built just for you
                </span>
              </h1>

              <p
                className="animate-fade-up mt-4 max-w-lg text-[15px] leading-7 text-zinc-600"
                style={{ animationDelay: "160ms" }}
              >
                Tell Courseify what you want to learn. It designs a step-by-step
                roadmap for your level, then teaches it lesson by lesson.
              </p>

              <ul
                className="animate-fade-up mt-7 space-y-2.5"
                style={{ animationDelay: "240ms" }}
              >
                {perks.map(([Icon, text]) => (
                  <li
                    key={text}
                    className="flex items-center gap-2.5 text-[14px] text-zinc-700"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-md border border-zinc-200 bg-white">
                      <Icon size={13} className="text-indigo-600" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="animate-fade-up min-w-0"
              style={{ animationDelay: "200ms" }}
            >
              <HeroDemo />
            </div>
          </section>

          {/* prompt: the way in */}
          <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <Reveal>
              <LandingPrompt error={error} />
            </Reveal>
          </section>

          {/* how it works */}
          <section
            id="how"
            className="scroll-mt-4 border-t border-zinc-200/80 bg-cream-dark/50"
          >
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <Reveal>
                <p className="text-[12px] font-medium uppercase tracking-wider text-indigo-600">
                  How it works
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  From a thought to a full course in three steps
                </h2>
              </Reveal>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {how.map(([Icon, title, body], i) => (
                  <Reveal key={title} delay={i * 100}>
                    <div className="h-full rounded-2xl border border-zinc-200 bg-white/80 p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Icon size={18} />
                        </span>
                        <span className="text-[12px] font-medium text-zinc-300">
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[15px] font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-6 text-zinc-500">
                        {body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={150}>
                <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-zinc-900 p-6 sm:flex-row sm:items-center sm:p-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Ready to learn something new?
                    </h3>
                    <p className="mt-1 text-[13px] text-zinc-400">
                      Sign in with Google and generate your first course in a
                      minute.
                    </p>
                  </div>
                  <GoogleButton variant="dark" />
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        <footer className="mx-auto max-w-6xl px-4 py-6 text-[12px] text-zinc-400 sm:px-6">
          © {new Date().getFullYear()} Courseify
        </footer>
      </div>
    </SmoothScroll>
  );
};
