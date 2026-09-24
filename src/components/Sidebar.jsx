import {
  BookOpen,
  Check,
  ChevronsUpDown,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Settings,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useMatch, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourses } from "../context/CoursesContext";

const newCourse = { label: "New course", to: "/", icon: Plus };
const settings = { label: "Settings", to: "/settings", icon: Settings };

function Item({ item, collapsed, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex h-8 items-center gap-2.5 rounded-md text-[13px] font-medium transition-colors ${
          collapsed ? "justify-center" : "px-2.5"
        } ${
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -left-2 h-4 w-0.5 rounded-full bg-indigo-600" />
          )}
          <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

function UserMenu({ collapsed }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-1 w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
          <div className="px-2.5 py-2">
            <p className="truncate text-[13px] font-medium text-zinc-900">{user?.name}</p>
            <p className="truncate text-[12px] text-zinc-500">{user?.email}</p>
          </div>
          <div className="my-1 border-t border-zinc-100" />
          <button
            onClick={logout}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-[13px] text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-black/5 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
            {initials}
          </div>
        )}
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-medium text-zinc-900">{user?.name}</p>
              <p className="truncate text-[11px] text-zinc-500">Free plan</p>
            </div>
            <ChevronsUpDown size={14} className="text-zinc-400" />
          </>
        )}
      </button>
    </div>
  );
}

function CourseItem({ course, onNavigate }) {
  const { remove } = useCourses();
  const navigate = useNavigate();
  const isOpen = useMatch(`/courses/${course.id}`);
  const [confirming, setConfirming] = useState(false);
  const done = course.progress >= course.stepCount;

  // two-step delete: the first click arms it, and it disarms itself after 3s
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  const onDelete = async () => {
    if (!confirming) return setConfirming(true);
    try {
      await remove(course.id);
      if (isOpen) navigate("/", { replace: true });
    } catch {
      setConfirming(false);
    }
  };

  return (
    <div className="group relative">
      <NavLink
        to={`/courses/${course.id}`}
        onClick={onNavigate}
        title={course.title}
        className={({ isActive }) =>
          `flex h-8 items-center gap-2 rounded-md pl-2.5 pr-2 text-[13px] transition-colors ${
            isActive
              ? "bg-indigo-50 font-medium text-indigo-700"
              : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900"
          }`
        }
      >
        <span className="min-w-0 flex-1 truncate">{course.title}</span>
        <span className="shrink-0 text-[11px] text-zinc-400 group-hover:opacity-0 pointer-coarse:hidden">
          {done ? (
            <Check size={13} strokeWidth={3} className="text-emerald-500" />
          ) : (
            `${course.progress}/${course.stepCount}`
          )}
        </span>
      </NavLink>

      <button
        onClick={onDelete}
        aria-label={confirming ? "Confirm delete" : `Delete ${course.title}`}
        className={`absolute right-1 top-1/2 flex h-6 -translate-y-1/2 items-center justify-center rounded transition ${
          confirming
            ? "bg-rose-500 px-2 text-[11px] font-medium text-white"
            : "w-6 text-zinc-400 opacity-0 hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
        }`}
      >
        {confirming ? "Delete?" : <Trash2 size={13} />}
      </button>
    </div>
  );
}

function MyCourses({ collapsed, onToggle, onNavigate }) {
  const { courses, status } = useCourses();

  // in the narrow rail there's no room for titles: one icon opens the sidebar
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        title="My courses"
        aria-label="My courses"
        className="flex h-8 w-full items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900"
      >
        <BookOpen size={16} strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <div>
      <p className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        My courses
      </p>
      <div className="space-y-0.5">
        {status === "loading" &&
          [0, 1, 2].map((i) => <div key={i} className="mx-1 h-6 animate-pulse rounded bg-black/5" />)}
        {status === "error" && (
          <p className="px-2.5 text-[12px] text-zinc-400">Couldn&apos;t load your courses.</p>
        )}
        {status === "ready" && courses.length === 0 && (
          <p className="px-2.5 text-[12px] leading-5 text-zinc-400">
            Courses you generate are saved here.
          </p>
        )}
        {courses.map((c) => (
          <CourseItem key={c.id} course={c} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function SidebarContent({ collapsed, onToggle, mobile, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex border-b border-zinc-100 ${
          collapsed
            ? "flex-col items-center gap-1 py-2"
            : "h-14 items-center justify-between px-3"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <Sparkles size={14} />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
              Courseify
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          aria-label={
            mobile ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-700"
        >
          {mobile ? (
            <X size={16} />
          ) : collapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        <Item item={newCourse} collapsed={collapsed} onNavigate={onNavigate} />
        <MyCourses collapsed={collapsed} onToggle={onToggle} onNavigate={onNavigate} />
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Account
            </p>
          )}
          <Item item={settings} collapsed={collapsed} onNavigate={onNavigate} />
        </div>
      </nav>

      {/* bottom */}
      <div className="space-y-2 border-t border-zinc-100 p-2">
        {!collapsed && (
          <div className="rounded-lg border border-zinc-200 bg-white/70 p-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-zinc-700">Credits</span>
              <span className="text-zinc-500">
                <b className="font-semibold text-zinc-800">38</b> / 50
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full w-[76%] rounded-full bg-indigo-500" />
            </div>
            <button className="mt-2.5 w-full rounded-md bg-zinc-900 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-zinc-700 active:scale-[0.98]">
              Upgrade to Pro
            </button>
          </div>
        )}

        <button
          title={collapsed ? "Support" : undefined}
          className={`flex h-8 w-full items-center gap-2.5 rounded-md text-[13px] font-medium text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900 ${
            collapsed ? "justify-center" : "px-2.5"
          }`}
        >
          <LifeBuoy size={16} strokeWidth={1.8} />
          {!collapsed && <span>Help &amp; support</span>}
        </button>

        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {
  return (
    <>
      {/* desktop */}
      <aside
        className={`hidden shrink-0 border-r border-zinc-200/80 bg-cream-dark/60 transition-[width] duration-200 ease-out md:block ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          onClick={onMobileClose}
          className={`absolute inset-0 bg-zinc-900/40 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          inert={!mobileOpen}
          className={`absolute inset-y-0 left-0 w-64 max-w-[80vw] border-r border-zinc-200 bg-cream shadow-xl transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent mobile onToggle={onMobileClose} onNavigate={onMobileClose} />
        </aside>
      </div>
    </>
  );
}
