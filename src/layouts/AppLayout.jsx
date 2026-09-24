import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const KEY = "sidebar-collapsed";

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(KEY) === "1",
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // drawer: esc to close, lock page scroll, auto-close when resized to desktop
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    const mq = window.matchMedia("(min-width: 768px)");
    const onResize = (e) => e.matches && setMobileOpen(false);

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onResize);
    };
  }, [mobileOpen]);

  return (
    <div className="flex h-dvh bg-cream text-zinc-900">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenu={() => setMobileOpen(true)} />
        <main className="bg-dots min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
