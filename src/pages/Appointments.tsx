import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  Stethoscope,
  XCircle,
} from "lucide-react";

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import type { Appointment, LookupResponse } from "../types";

export default function Appointments() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================================================
     LOOKUP APPOINTMENTS
  ========================================================= */

  async function submit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await api.lookup({
        patient_email: email.trim().toLowerCase(),
      });

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve appointments."
      );

      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const appointments: Appointment[] =
    result?.appointments || result?.data || [];

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(date?: string) {
    if (!date) return "Date unavailable";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  }

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  function formatTime(time?: string) {
    if (!time) return "--:--";

    return time.slice(0, 5);
  }

  /* =========================================================
     STATUS COLOR
  ========================================================= */

  function getStatusClasses(status?: string) {
    switch (status?.toUpperCase()) {
      case "BOOKED":
      case "CONFIRMED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "COMPLETED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "CANCELLED":
      case "CANCELED":
        return "border-red-200 bg-red-50 text-red-700";

      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  }

  /* =========================================================
     CHECK IF APPOINTMENT CAN BE MANAGED
  ========================================================= */

  function canManageAppointment(status?: string) {
    const value = status?.toUpperCase();

    return (
      value === "BOOKED" ||
      value === "CONFIRMED" ||
      value === "PENDING"
    );
  }

  /* =========================================================
     RESCHEDULE
     Keep existing parameter names because Reschedule.tsx
     already works with date + time.
  ========================================================= */

  function rescheduleAppointment(appointment: Appointment) {
    if (!appointment.id) return;

    const params = new URLSearchParams({
      appointment_id: appointment.id,
      patient_email: email.trim().toLowerCase(),
    });

    if (appointment.doctor_name) {
      params.set("doctor_name", appointment.doctor_name);
    }

    if (appointment.specialization) {
      params.set("specialization", appointment.specialization);
    }

    if (appointment.appointment_date) {
      params.set("date", appointment.appointment_date);
    }

    if (appointment.start_time) {
      params.set("time", appointment.start_time.slice(0, 5));
    }

    navigate(`/reschedule?${params.toString()}`);
  }

  /* =========================================================
     CANCEL APPOINTMENT
  ========================================================= */

  function cancelAppointment(appointment: Appointment) {
    if (!appointment.id) return;

    const params = new URLSearchParams({
      appointment_id: appointment.id,
      patient_email: email.trim().toLowerCase(),
    });

    if (appointment.doctor_name) {
      params.set(
        "doctor_name",
        appointment.doctor_name
      );
    }

    if (appointment.specialization) {
      params.set(
        "specialization",
        appointment.specialization
      );
    }

    /*
      IMPORTANT:
      Cancel.tsx expects:
      appointment_date
      start_time
      end_time
    */

    if (appointment.appointment_date) {
      params.set(
        "appointment_date",
        appointment.appointment_date
      );
    }

    if (appointment.start_time) {
      params.set(
        "start_time",
        appointment.start_time
      );
    }

    if (appointment.end_time) {
      params.set(
        "end_time",
        appointment.end_time
      );
    }

    navigate(`/cancel?${params.toString()}`);
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section className="container-shell py-16">
      <div className="mx-auto max-w-5xl">

        {/* PAGE HEADER */}

        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
            Patient self-service
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
            My appointments.
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            View and manage your healthcare appointments using
            your registered patient email.
          </p>
        </div>

        {/* SEARCH */}

        <form
          onSubmit={submit}
          className="card mt-10 flex flex-col gap-3 p-5 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="field pl-11"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
            />
          </div>

          <button
            type="submit"
            className="btn-primary min-h-[46px] sm:w-auto"
            disabled={loading}
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={18}
              />
            ) : (
              <Search size={18} />
            )}

            {loading
              ? "Searching..."
              : "Find appointments"}
          </button>
        </form>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* RESULTS */}

        <div className="mt-8 grid gap-5">

          {/* EMPTY STATE */}

          {result && appointments.length === 0 && (
            <div className="card px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <CalendarDays className="text-slate-400" />
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-900">
                No appointments found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {result.message ||
                  "We couldn't find an appointment associated with this email."}
              </p>
            </div>
          )}

          {/* APPOINTMENT CARDS */}

          {appointments.map((appointment, index) => {
            const status =
              appointment.status?.toUpperCase() ||
              "UNKNOWN";

            const manageable =
              canManageAppointment(
                appointment.status
              );

            return (
              <article
                key={appointment.id || index}
                className="card overflow-hidden"
              >
                <div className="p-6 sm:p-7">

                  {/* TOP */}

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex gap-4">

                      {/* DOCTOR ICON */}

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <Stethoscope size={22} />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                          {appointment.specialization ||
                            "Healthcare appointment"}
                        </p>

                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          {appointment.doctor_name ||
                            "Doctor information unavailable"}
                        </h2>
                      </div>
                    </div>

                    {/* STATUS */}

                    <span
                      className={`h-fit rounded-full border px-3 py-1.5 text-xs font-black tracking-wide ${getStatusClasses(
                        appointment.status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* DATE / TIME */}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">

                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                        <CalendarDays size={17} />
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Date
                        </div>

                        <div className="mt-0.5 text-sm font-bold text-slate-900">
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                        <Clock3 size={17} />
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Time
                        </div>

                        <div className="mt-0.5 text-sm font-bold text-slate-900">
                          {formatTime(
                            appointment.start_time
                          )}

                          {appointment.end_time &&
                            ` – ${formatTime(
                              appointment.end_time
                            )}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REASON */}

                  {appointment.reason && (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Reason for visit
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {appointment.reason}
                      </p>
                    </div>
                  )}

                  {/* ACTIONS */}

                  {manageable && appointment.id && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                      {/* RESCHEDULE */}

                      <button
                        type="button"
                        onClick={() =>
                          rescheduleAppointment(
                            appointment
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                      >
                        <RefreshCw size={16} />

                        Reschedule
                      </button>

                      {/* CANCEL */}

                      <button
                        type="button"
                        onClick={() =>
                          cancelAppointment(
                            appointment
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                        <XCircle size={16} />

                        Cancel appointment
                      </button>

                      <div className="hidden flex-1 sm:block" />

                      <div className="flex items-center justify-center gap-2 px-2 py-3 text-xs font-semibold text-slate-400">
                        Manage appointment

                        <ArrowRight size={14} />
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}