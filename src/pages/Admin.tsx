import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  Bot,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  CheckCircle2,
  Clock3,
  Database,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import {
  api,
  type AdminAnalyticsResponse,
} from "../lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Metric {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  route?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "Live";
  icon: LucideIcon;
}

interface ArchitectureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

/* =========================================================
   WORKFLOW REGISTRY
========================================================= */

const workflows: Workflow[] = [
  {
    id: "WF00",
    name: "AI Healthcare Agent",
    description:
      "Conversational orchestration, intent detection and workflow tool routing.",
    status: "Live",
    icon: Bot,
  },
  {
    id: "WF01",
    name: "Patient Registration",
    description:
      "Patient validation, normalization and registration in the healthcare database.",
    status: "Live",
    icon: Users,
  },
  {
    id: "WF02",
    name: "Appointment Booking",
    description:
      "Creates appointments and coordinates booking data with the scheduling system.",
    status: "Live",
    icon: CalendarPlus,
  },
  {
    id: "WF03",
    name: "Appointment Reschedule",
    description:
      "Validates new appointment slots and synchronizes schedule changes.",
    status: "Live",
    icon: RefreshCw,
  },
  {
    id: "WF04",
    name: "Appointment Cancellation",
    description:
      "Cancels appointments safely and handles linked calendar events when available.",
    status: "Live",
    icon: CalendarX,
  },
  {
    id: "WF05",
    name: "Availability & Doctor Search",
    description:
      "Searches doctor schedules, booked slots and available appointment times.",
    status: "Live",
    icon: Search,
  },
  {
    id: "WF06",
    name: "Appointment & Patient Lookup",
    description:
      "Retrieves patient and appointment information for self-service operations.",
    status: "Live",
    icon: Stethoscope,
  },
  {
    id: "WF07",
    name: "Appointment Reminders",
    description:
      "Sends scheduled email reminders before upcoming appointments.",
    status: "Live",
    icon: CalendarClock,
  },
  {
    id: "WF08",
    name: "Post-Appointment Follow-Up",
    description:
      "Automatically sends follow-up communication after completed appointments.",
    status: "Live",
    icon: Mail,
  },
];

/* =========================================================
   ARCHITECTURE
========================================================= */

const architecture: ArchitectureItem[] = [
  {
    title: "Patient channels",
    description: "Web + WhatsApp",
    icon: Users,
  },
  {
    title: "AI orchestration",
    description: "Central AI Healthcare Agent",
    icon: Bot,
  },
  {
    title: "Automation",
    description: "n8n workflow orchestration",
    icon: Activity,
  },
  {
    title: "Database",
    description: "Supabase / PostgreSQL",
    icon: Database,
  },
  {
    title: "Scheduling",
    description: "Appointment + calendar sync",
    icon: CalendarCheck,
  },
  {
    title: "Communication",
    description: "Automated email notifications",
    icon: Mail,
  },
];

/* =========================================================
   ADMIN PAGE
========================================================= */

export default function Admin() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] =
    useState<AdminAnalyticsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     LOAD REAL ANALYTICS
  ======================================================= */

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await api.adminAnalytics();

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to load analytics."
        );
      }

      setAnalytics(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load analytics.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  /* =======================================================
     REAL METRICS
  ======================================================= */

  const metrics: Metric[] = [
    {
      label: "Total appointments",
      value: loading
        ? "..."
        : String(analytics?.metrics.total ?? 0),
      description: "All appointment records",
      icon: Activity,
      route: "/admin/appointments",
    },
    {
      label: "Booked",
      value: loading
        ? "..."
        : String(analytics?.metrics.booked ?? 0),
      description: "Active appointments",
      icon: CalendarCheck,
      route: "/admin/appointments?status=booked",
    },
    {
      label: "Completed",
      value: loading
        ? "..."
        : String(analytics?.metrics.completed ?? 0),
      description: "Completed appointments",
      icon: CheckCircle2,
      route: "/admin/appointments?status=completed",
    },
    {
      label: "Cancelled",
      value: loading
        ? "..."
        : String(analytics?.metrics.cancelled ?? 0),
      description: "Cancelled appointments",
      icon: CalendarX,
      route: "/admin/appointments?status=cancelled",
    },
  ];

  return (
    <section className="container-shell py-16">
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
              Operations overview
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
              Healthcare automation dashboard.
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Live operational overview of CareFlow AI,
              appointment activity and healthcare automation.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => void loadAnalytics()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              {loading
                ? "Refreshing..."
                : "Refresh data"}
            </button>

            {/* SYSTEM STATUS */}

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
              <CheckCircle2 size={16} />

              Core system operational
            </div>
          </div>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-red-700">
                  Analytics unavailable
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadAnalytics()}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
              >
                <RefreshCw size={14} />

                Try again
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            REAL APPOINTMENT METRICS
        =================================================== */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                onClick={() => {
                  if (metric.route) {
                    navigate(metric.route);
                  }
                }}
                className="card w-full cursor-pointer p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon size={20} />
                </div>

                <div className="mt-6 text-3xl font-black tracking-tight text-slate-950">
                  {metric.value}
                </div>

                <div className="mt-1 text-sm font-bold text-slate-700">
                  {metric.label}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {metric.description}
                </div>

                <div className="mt-3 text-xs font-bold text-teal-700">
                  View records →
                </div>
              </div>
            );
          })}
        </div>

        {/* ===================================================
            AUTOMATION METRICS
        =================================================== */}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Clock3 size={17} />
              </span>

              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Reminders sent
                </div>

                <div className="mt-1 text-xl font-black text-slate-950">
                  {loading
                    ? "..."
                    : analytics?.automation.reminders_sent ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Mail size={17} />
              </span>

              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Follow-ups sent
                </div>

                <div className="mt-1 text-xl font-black text-slate-950">
                  {loading
                    ? "..."
                    : analytics?.automation.followups_sent ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Bot size={17} />
              </span>

              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  AI orchestration
                </div>

                <div className="mt-1 text-xl font-black text-slate-950">
                  WF00
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Activity size={17} />
              </span>

              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Automation workflows
                </div>

                <div className="mt-1 text-xl font-black text-slate-950">
                  9
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_.65fr]">

          {/* AUTOMATION LAYER */}

          <div className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Automation layer
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Production workflow architecture powering CareFlow AI.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                <Activity size={14} />
                9 workflows
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {workflows.map((workflow) => {
                const Icon = workflow.icon;

                return (
                  <div
                    key={workflow.id}
                    className="flex items-start gap-4 p-5 transition hover:bg-slate-50/70"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black tracking-wide text-slate-500">
                          {workflow.id}
                        </span>

                        <h3 className="font-black text-slate-950">
                          {workflow.name}
                        </h3>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {workflow.description}
                      </p>
                    </div>

                    <div className="mt-1 flex shrink-0 items-center gap-1.5 text-xs font-black text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {workflow.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">

            {/* ARCHITECTURE */}

            <div className="card p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                  System design
                </p>

                <h2 className="mt-2 text-lg font-black text-slate-950">
                  Architecture
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                {architecture.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-3"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <Icon size={17} />
                      </span>

                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {item.title}
                        </div>

                        <div className="mt-0.5 text-xs leading-5 text-slate-500">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RELIABILITY */}

            <div className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={21} />
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-950">
                Reliability controls
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Transactional workflows use validation and deterministic
                routing before modifying appointment data.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Input validation",
                  "Appointment existence checks",
                  "Duplicate-state protection",
                  "Calendar event safeguards",
                  "Automated reminder tracking",
                  "Follow-up status tracking",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-semibold text-slate-700"
                  >
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-emerald-600"
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            PATIENT SELF-SERVICE
        =================================================== */}

        <div className="mt-6 card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                Patient self-service
              </p>

              <h2 className="mt-2 text-lg font-black text-slate-950">
                Connected appointment lifecycle
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              Web experience connected to n8n automation
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [Search, "Find doctor", "Search availability"],
              [CalendarPlus, "Book", "Create appointment"],
              [CalendarCheck, "View", "Patient lookup"],
              [RefreshCw, "Reschedule", "Change appointment"],
              [CalendarX, "Cancel", "Cancel safely"],
            ].map(([Icon, title, description]) => {
              const C = Icon as LucideIcon;

              return (
                <div
                  key={String(title)}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <C
                    size={18}
                    className="text-teal-700"
                  />

                  <div className="mt-4 text-sm font-black text-slate-900">
                    {String(title)}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {String(description)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================
            LAST UPDATE
        =================================================== */}

        {analytics?.generated_at && !loading && (
          <div className="mt-5 text-right text-xs text-slate-400">
            Analytics last updated{" "}
            {new Date(
              analytics.generated_at
            ).toLocaleString()}
          </div>
        )}
      </div>
    </section>
  );
}