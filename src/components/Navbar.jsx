import { Bell, Menu, Zap } from "lucide-react";

export default function Navbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200/80 bg-cream/80 px-3 backdrop-blur sm:gap-3 sm:px-4">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="-ml-1 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 md:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <div className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-white/60 px-2.5 py-1 text-[12px] font-medium text-zinc-600 lg:flex">
          <Zap size={12} className="text-amber-500" fill="currentColor" />
          38 credits
        </div>

        <button
          aria-label="Notifications"
          className="relative rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
        >
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-cream" />
        </button>
      </div>
    </header>
  );
}
