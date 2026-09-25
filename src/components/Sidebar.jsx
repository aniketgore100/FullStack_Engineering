import {
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const settings = { 
  label: "Settings", to: "/settings", icon: Settings,
  label: "Generate", to: "/generate", icon: Sparkles
};

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
