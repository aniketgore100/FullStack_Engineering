import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
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

  if (!user) return null;
  const initial = (user.name || user.email || "?")[0].toUpperCase();

  const handleLogout = async () => {
    setBusy(true);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-indigo-100 text-[13px] font-semibold text-indigo-700 ring-2 ring-transparent transition hover:ring-indigo-200"
      >
        {user.picture ? (
          <img src={user.picture} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      <div
        role="menu"
        className={`absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl transition duration-150 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="px-2.5 py-2">
          <p className="truncate text-[13px] font-semibold text-zinc-900">{user.name}</p>
          <p className="truncate text-[12px] text-zinc-500">{user.email}</p>
        </div>
        <div className="my-1 h-px bg-zinc-100" />
        <button
          role="menuitem"
          onClick={handleLogout}
          disabled={busy}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60"
        >
          <LogOut size={15} /> {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
