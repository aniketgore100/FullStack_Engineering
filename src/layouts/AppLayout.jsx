import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { setMobileNavOpen, toggleSidebar } from "../app/slices/uiSlice";

export default function AppLayout() {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const mobileOpen = useSelector((state) => state.ui.mobileNavOpen);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e) => e.key === "Escape" && dispatch(setMobileNavOpen(false));
    const mq = window.matchMedia("(min-width: 768px)");
    const onResize = (e) => e.matches && dispatch(setMobileNavOpen(false));

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onResize);
    };
  }, [mobileOpen, dispatch]);

  return (
    <div className="flex h-dvh bg-cream text-zinc-900">

      <Sidebar
        collapsed={collapsed}
        onToggle={() => dispatch(toggleSidebar())}
        mobileOpen={mobileOpen}
        onMobileClose={() => dispatch(setMobileNavOpen(false))}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          onMenu={() =>
            dispatch(setMobileNavOpen(true))}
        />

        <main className="bg-dots min-h-0 flex-1 overflow-hidden"><Outlet/></main>
      </div>

    </div>
  );
}
