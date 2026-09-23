import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import HealthcareChatbot from "./HealthcareChatbot";
const links = [
  ["/", "Home"],
  ["/find-doctor", "Find Doctor"],
  ["/doctor-schedule", "Doctor Schedule"],
  ["/appointments", "My Appointments"],
  ["/doctor-dashboard", "Doctor"],
  ["/admin", "Admin"],
] as const;
export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7faf9] text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#f7faf9]/90 backdrop-blur-xl">
        <div className="container-shell flex h-20 items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-700/20">
              <Activity size={21} />
            </span>

            <span>
              <span className="block text-base font-black tracking-tight">
                CareFlow AI
              </span>

              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
                Healthcare Automation
              </span>
            </span>
          </NavLink>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <NavLink to="/find-doctor" className="btn-primary hidden lg:inline-flex">
  Book appointment
</NavLink>

          {/* Mobile menu button */}
          <button
            type="button"
            className="rounded-xl p-2 lg:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile navigation */}
        {open && (
          <nav className="container-shell grid gap-2 border-t border-slate-200 py-4 lg:hidden">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 font-semibold transition ${
                    isActive
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-700 hover:bg-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <NavLink
              to="/book"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 justify-center"
            >
              Book appointment
            </NavLink>
          </nav>
        )}
      </header>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
      <main>
        <Outlet />
      </main>

      {/* =====================================================
          GLOBAL AI CHATBOT
          Appears on every page
      ====================================================== */}
      <HealthcareChatbot />

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mt-24 border-t border-slate-200 bg-white">
        <div className="container-shell flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-black">
              CareFlow AI
            </div>

            <p className="mt-1 text-sm text-slate-500">
              AI-powered appointment and patient support automation.
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Portfolio system · React · n8n · Supabase · AI Agent
          </p>
        </div>
      </footer>
    </div>
  );
}