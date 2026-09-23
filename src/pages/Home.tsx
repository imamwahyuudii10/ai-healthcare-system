import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Database,
  HeartPulse,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const capabilities = [
  { icon: Search, title: "Real-time availability", text: "Search doctor schedules and actual open appointment slots." },
  { icon: Bot, title: "AI patient support", text: "Natural conversations for booking, lookup, rescheduling and cancellation." },
  { icon: CalendarCheck, title: "Appointment automation", text: "Deterministic workflows protect transactions and prevent double booking." },
  { icon: MessageCircle, title: "WhatsApp-first", text: "Patients can interact through a familiar conversational channel." },
  { icon: Clock3, title: "Smart reminders", text: "Automatic email reminder one day before an upcoming appointment." },
  { icon: Database, title: "Reliable patient records", text: "Supabase-backed patient, doctor, schedule and appointment data." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[650px] bg-[radial-gradient(circle_at_75%_20%,rgba(13,148,136,0.14),transparent_35%),radial-gradient(circle_at_15%_20%,rgba(14,116,144,0.10),transparent_30%)]" />
        <div className="container-shell grid min-h-[720px] items-center gap-14 py-20 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-800 shadow-sm">
              <Sparkles size={14} /> Intelligent patient operations
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Healthcare appointments,
              <span className="block text-teal-700">without the friction.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              CareFlow AI connects conversational support, real-time doctor availability, secure patient records and automated appointment workflows in one patient-friendly system.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/find-doctor" className="btn-primary px-6 py-4">Find a doctor <ArrowRight size={18} /></Link>
              <Link to="/appointments" className="btn-secondary px-6 py-4">Check my appointment</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
              {["Real availability", "Human confirmation", "Automated reminders"].map((item) => (
                <span key={item} className="flex items-center gap-2"><CheckCircle2 className="text-teal-700" size={17} />{item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="card relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-100 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Live patient journey</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">One conversation. Complete care flow.</h2>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><HeartPulse /></span>
              </div>
              <div className="relative mt-8 space-y-3">
                {[
                  ["01", "Understand intent", "AI Agent"],
                  ["02", "Verify doctor & slot", "WF05"],
                  ["03", "Book safely", "Appointment workflow"],
                  ["04", "Remind automatically", "WF07"],
                  ["05", "Follow up after visit", "WF08"],
                ].map(([n, title, tag]) => (
                  <div key={n} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-teal-700 shadow-sm">{n}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{title}</div>
                      <div className="mt-1 text-xs text-slate-500">{tag}</div>
                    </div>
                    <CheckCircle2 size={19} className="text-teal-600" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-7 -left-6 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck size={20}/></span>
                <div><div className="text-sm font-black">Transaction-safe</div><div className="text-xs text-slate-500">Verified before confirmation</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">System capabilities</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950">Built like a healthcare operations product.</h2>
          <p className="mt-4 text-slate-600">The interface stays simple for patients while n8n handles orchestration and deterministic business logic behind the scenes.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon size={21}/></span>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">Ready when patients are</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Find a verified available appointment in seconds.</h2>
            <p className="mt-4 leading-7 text-slate-300">Search by specialty, date or preferred time. Availability comes from the same automation layer used by the AI agent.</p>
          </div>
          <Link to="/find-doctor" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-slate-950 lg:mt-0">Search availability <ArrowRight size={18}/></Link>
        </div>
      </section>
    </>
  );
}