import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Layers,
  Loader2,
  ListChecks,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import GoogleButton from "../components/landing/GoogleButton";
import Reveal from "../components/landing/Reveal";
import SmoothScroll from "../components/landing/SmoothScroll";
import { savePendingPrompt } from "../lib/pendingPrompt";

const ERRORS = {
  cancelled: "Sign-in was cancelled. Give it another try whenever you're ready.",
  invalid_state: "Your sign-in session expired. Please try again.",
  unverified_email: "Your Google email isn't verified, so we couldn't sign you in.",
  failed: "Something went wrong signing you in. Please try again.",
};

const PROMPTS = [
  "A beginner's course on React hooks",
  "Machine learning for product managers",
  "Learn Spanish in 30 days",
  "Intro to personal finance",
];

const FEATURES = [
  { icon: Wand2, title: "One prompt, full course", body: "Describe what you want to teach or learn. Courseify drafts the whole curriculum for you." },
  { icon: Layers, title: "Structured modules", body: "Clear modules and lessons with a sensible learning path, ready to refine." },
  { icon: ListChecks, title: "Quizzes & exercises", body: "Every lesson can come with practice questions so knowledge actually sticks." },
  { icon: BookOpen, title: "Save & revisit", body: "Keep every course in your library and pick up right where you left off." },
  { icon: Zap, title: "Fast by default", body: "Go from a blank page to a polished outline in seconds, not weekends." },
  { icon: Sparkles, title: "Yours to edit", body: "Regenerate any lesson, tweak the tone, or adjust the difficulty in one click." },
];

const STEPS = [
  { n: "01", title: "Describe your topic", body: "Type a sentence about what the course should cover and who it's for." },
  { n: "02", title: "Watch it come together", body: "Courseify builds the outline, lessons and exercises in real time." },
  { n: "03", title: "Learn or share", body: "Study it yourself, refine it, and keep it saved in your library." },
];

const PLANS = [
  { name: "Free", price: "$0", note: "For trying things out", perks: ["50 credits / month", "Save up to 5 courses", "Community support"], featured: false },
  { name: "Pro", price: "$12", note: "For serious learners & creators", perks: ["Unlimited credits", "Unlimited saved courses", "Priority generation", "Email support"], featured: true },
];

const FAQ = [
  { q: "Is Courseify free to use?", a: "Yes. Sign in with Google and you get free monthly credits to generate and save courses." },
  { q: "Do I need to create a password?", a: "No. We only use Google sign-in, so there's nothing extra to remember and no password to leak." },
  { q: "What do you store about me?", a: "Just your name, email and profile picture from Google, kept in a secure, HTTP-only session cookie." },
  { q: "Can I sign out any time?", a: "Absolutely. Use the account menu in the top right and you're signed out instantly." },
];

function useTypewriter(lines) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [text, setText] = useState(reduced ? lines[0] : "");
  useEffect(() => {
    if (reduced) return;
    let line = 0, i = 0, deleting = false, t;
    const tick = () => {
      const full = lines[line];
      i += deleting ? -1 : 1;
      setText(full.slice(0, i));
      let wait = deleting ? 25 : 55;
      if (!deleting && i === full.length) { deleting = true; wait = 1600; }
      else if (deleting && i === 0) { deleting = false; line = (line + 1) % lines.length; wait = 400; }
      t = setTimeout(tick, wait);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [lines, reduced]);
  return text;
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-linear-to-br from-brand to-violet-600 text-white shadow-sm">
        <Sparkles size={16} />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-zinc-900">Courseify</span>
    </Link>
  );
}

function Nav({ user }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
        scrolled ? "border-b border-zinc-200/70 bg-white/75 backdrop-blur-lg" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-zinc-600 md:flex">
          <a href="#features" className="transition-colors hover:text-zinc-900">Features</a>
          <a href="#how" className="transition-colors hover:text-zinc-900">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-zinc-900">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-zinc-900">FAQ</a>
        </nav>
        {user ? (
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98]"
          >
            Open app <ArrowRight size={15} />
          </Link>
        ) : (
          <GoogleButton className="px-4! py-2! text-sm!">Sign in</GoogleButton>
        )}
      </div>
    </header>
  );
}

function PromptBox({ user, placeholder }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !busy;

  const submit = () => {
    if (!canSend) {
      return;
    }
    setBusy(true);
    savePendingPrompt(value);
    if (user) {
      navigate("/app");
    } else {
      login(); // Google sign-in, then /app picks the prompt back up
    }
  };

  return (
    <div className="animate-float rounded-3xl border border-zinc-200 bg-white p-3 text-left shadow-2xl shadow-brand/10 transition focus-within:border-brand/40">
      <div className="flex items-end gap-2 px-2 py-1">
        <textarea
          ref={ref}
          rows={2}
          value={value}
          disabled={busy}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder || "What do you want to learn or teach?"}
          aria-label="Describe the course you want"
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-[17px] leading-7 text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label={user ? "Generate course" : "Continue with Google"}
          className="mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-900 text-white transition hover:bg-brand active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="-rotate-90" />}
        </button>
      </div>
      <p className="px-3 pt-1 pb-1.5 text-[13px] text-zinc-400">
        {busy && !user
          ? "Redirecting to Google…"
          : user
            ? "Press Enter to generate"
            : "Press Enter — you'll sign in with Google to continue"}
      </p>
    </div>
  );
}

function Hero({ user }) {
  const typed = useTypewriter(PROMPTS);
  return (
    <section className="hero-glow relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div className="bg-dots absolute inset-0 -z-10 opacity-60 mask-[radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="mx-auto max-w-4xl px-5 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/70 px-3 py-1 text-[13px] font-semibold text-brand backdrop-blur">
            <Sparkles size={13} /> AI course builder
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] font-extrabold tracking-tight text-zinc-900 sm:text-7xl">
            Turn any topic into a{" "}
            <span className="bg-linear-to-r from-brand via-violet-600 to-sky-500 bg-clip-text text-transparent">
              complete course
            </span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 sm:text-xl">
            Describe what you want to teach or learn. Courseify builds the modules, lessons and quizzes in seconds, so you can start learning right away.
          </p>
        </Reveal>
        <Reveal delay={240} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Go to your workspace <ArrowRight size={16} />
            </Link>
          ) : (
            <GoogleButton className="px-6! py-3.5!">Get started with Google</GoogleButton>
          )}
          <a
            href="#how"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-[15px] font-semibold text-zinc-700 transition hover:bg-black/5"
          >
            See how it works <ChevronDown size={16} />
          </a>
        </Reveal>

        <Reveal delay={320} className="mx-auto mt-14 max-w-2xl">
          <PromptBox user={user} placeholder={typed} />
        </Reveal>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, body }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold tracking-wider text-brand uppercase">{eyebrow}</p>
      <h2 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">{title}</h2>
      {body && <p className="mt-4 text-lg text-zinc-600">{body}</p>}
    </Reveal>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead eyebrow="Features" title="Everything you need to build a course" body="From the first idea to a finished curriculum, without the busywork." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 3) * 80}>
              <div className="group h-full rounded-2xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon size={20} />
                </span>
                <h3 className="font-display mt-5 text-xl font-bold text-zinc-900">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  return (
    <section id="how" className="scroll-mt-20 bg-zinc-900 py-24 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wider text-violet-300 uppercase">How it works</p>
          <h2 className="font-display mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">From idea to course in three steps</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-7">
                <span className="font-display bg-linear-to-br from-violet-300 to-sky-300 bg-clip-text text-5xl font-extrabold text-transparent">{s.n}</span>
                <h3 className="font-display mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ user }) {
  return (
    <section id="pricing" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-4xl px-5">
        <SectionHead eyebrow="Pricing" title="Simple, honest pricing" body="Start free. Upgrade when you need more." />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div
                className={`h-full rounded-3xl border p-8 ${
                  p.featured
                    ? "border-brand bg-brand text-white shadow-2xl shadow-brand/30"
                    : "border-zinc-200 bg-white text-zinc-900"
                }`}
              >
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <p className={`mt-1 text-sm ${p.featured ? "text-white/70" : "text-zinc-500"}`}>{p.note}</p>
                <p className="font-display mt-6 text-5xl font-extrabold">
                  {p.price}
                  <span className={`text-base font-medium ${p.featured ? "text-white/70" : "text-zinc-400"}`}> /mo</span>
                </p>
                <ul className="mt-6 space-y-3 text-[15px]">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5">
                      <Check size={16} className={p.featured ? "text-white" : "text-brand"} /> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        {!user && (
          <Reveal className="mt-10 flex justify-center">
            <GoogleButton>Start free with Google</GoogleButton>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-20 pb-24">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHead eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 space-y-3">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className="rounded-2xl border border-zinc-200 bg-white">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg font-bold text-zinc-900"
                  >
                    {f.q}
                    <ChevronDown size={18} className={`shrink-0 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-[15px] leading-relaxed text-zinc-600">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ user }) {
  return (
    <section className="px-5 pb-24">
      <Reveal>
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-linear-to-br from-brand via-indigo-600 to-violet-600 px-6 py-16 text-center text-white shadow-2xl shadow-brand/30 sm:py-20">
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Your next course is one sentence away</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Sign in with Google and start building in under a minute.</p>
          <div className="mt-8 flex justify-center">
            {user ? (
              <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-zinc-900 transition hover:-translate-y-0.5 active:scale-[0.98]">
                Open your workspace <ArrowRight size={16} />
              </Link>
            ) : (
              <GoogleButton className="px-6! py-3.5!" />
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-zinc-500 sm:flex-row">
        <Logo />
        <p>© {new Date().getFullYear()} Courseify. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const authError = ERRORS[params.get("auth_error")];

  return (
    <SmoothScroll>
    <div className="font-display min-h-dvh bg-cream text-zinc-900" style={{ fontFamily: "var(--font-display)" }}>
      <Nav user={user} />
      {authError && (
        <div role="alert" className="fixed top-20 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-xl">
          <span className="flex-1">{authError}</span>
          <button onClick={() => setParams({}, { replace: true })} aria-label="Dismiss" className="font-semibold hover:text-red-900">✕</button>
        </div>
      )}
      <main>
        <Hero user={user} />
        <Features />
        <How />
        <Pricing user={user} />
        <Faq />
        <FinalCta user={user} />
      </main>
      <Footer />
    </div>
    </SmoothScroll>
  );
}
