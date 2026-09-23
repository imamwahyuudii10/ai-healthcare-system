import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function Reschedule() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  /* =========================================================
     DATA DARI MY APPOINTMENTS
  ========================================================= */

  const appointment = useMemo(() => {
    const clean = (key: string) => {
      const value = params.get(key);

      if (
        !value ||
        value === "undefined" ||
        value === "null"
      ) {
        return "";
      }

      return value;
    };

    return {
      appointment_id: clean("appointment_id"),
      patient_email: clean("patient_email"),
      doctor_name: clean("doctor_name"),
      specialization: clean("specialization"),

      // Mendukung beberapa nama parameter
      current_date:
        clean("appointment_date") ||
        clean("date"),

      current_time:
        clean("start_time") ||
        clean("time"),
    };
  }, [params]);

  /* =========================================================
     STATE
  ========================================================= */

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     VALIDATION
  ========================================================= */

  const hasAppointment = Boolean(
    appointment.appointment_id
  );

  /* =========================================================
     SUBMIT RESCHEDULE
  ========================================================= */

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (!appointment.appointment_id) {
      setError(
        "Appointment ID tidak ditemukan. Silakan kembali ke My Appointments."
      );
      return;
    }

    if (!newDate || !newTime) {
      setError(
        "Silakan pilih tanggal dan waktu baru."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setSuccess(false);

    try {
      const result = await api.reschedule({
        appointment_id:
          appointment.appointment_id,

        new_date: newDate,

        new_start_time: newTime,

        reason:
          reason.trim() ||
          "Rescheduled by patient via CareFlow AI",
      });

      if (result.success) {
        setSuccess(true);

        setMessage(
          result.message ||
            "Appointment successfully rescheduled."
        );
      } else {
        setError(
          result.message ||
            "Appointment could not be rescheduled."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Reschedule gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (success) {
    return (
      <section className="container-shell py-16">
        <div className="mx-auto max-w-3xl">

          <div className="card p-8 text-center sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={32} />
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              Reschedule successful
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Appointment updated.
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              {message}
            </p>

            <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 text-left sm:grid-cols-2">

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  New date
                </div>

                <div className="mt-1 font-black text-slate-900">
                  {newDate}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  New time
                </div>

                <div className="mt-1 font-black text-slate-900">
                  {newTime}
                </div>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/appointments")
              }
              className="btn-primary mt-8 w-full justify-center py-4"
            >
              View my appointments
            </button>

          </div>

        </div>
      </section>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section className="container-shell py-16">

      <div className="mx-auto max-w-3xl">

        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate("/appointments")}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to My Appointments
        </button>

        {/* HEADER */}

        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
          Appointment management
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
          Reschedule appointment.
        </h1>

        <p className="mt-3 text-slate-600">
          Select a new date and time for your
          appointment.
        </p>

        {/* APPOINTMENT NOT FOUND */}

        {!hasAppointment && (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">

            <h2 className="font-black text-amber-900">
              Appointment information unavailable
            </h2>

            <p className="mt-2 text-sm text-amber-700">
              Open My Appointments and select
              Reschedule from the appointment you
              want to change.
            </p>

          </div>
        )}

        {/* CURRENT APPOINTMENT */}

        {hasAppointment && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-teal-950 p-6 text-white">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Stethoscope
                  size={22}
                  className="text-teal-200"
                />
              </div>

              <div>

                <div className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
                  Current appointment
                </div>

                <h2 className="mt-1 text-xl font-black">
                  {appointment.doctor_name ||
                    "Healthcare appointment"}
                </h2>

                {appointment.specialization && (
                  <p className="mt-1 text-sm text-teal-100">
                    {appointment.specialization}
                  </p>
                )}

              </div>

            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl bg-white/10 p-4">

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
                  <CalendarDays size={16} />
                  Current date
                </div>

                <div className="mt-2 font-black">
                  {appointment.current_date ||
                    "Not available"}
                </div>

              </div>

              <div className="rounded-2xl bg-white/10 p-4">

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
                  <Clock size={16} />
                  Current time
                </div>

                <div className="mt-2 font-black">
                  {appointment.current_time ||
                    "Not available"}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={submit}
          className="card mt-6 grid gap-6 p-6 sm:p-8"
        >

          <div>

            <h2 className="text-xl font-black text-slate-950">
              Choose new schedule
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose the new appointment date and
              start time.
            </p>

          </div>

          {/* DATE + TIME */}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>

              <label className="label">
                New appointment date
              </label>

              <input
                className="field"
                type="date"
                required
                value={newDate}
                onChange={(e) =>
                  setNewDate(e.target.value)
                }
              />

            </div>

            <div>

              <label className="label">
                New start time
              </label>

              <input
                className="field"
                type="time"
                required
                value={newTime}
                onChange={(e) =>
                  setNewTime(e.target.value)
                }
              />

            </div>

          </div>

          {/* REASON */}

          <div>

            <label className="label">
              Reason{" "}
              <span className="font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <textarea
              className="field min-h-28 resize-y"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Reason for changing the appointment"
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              loading ||
              !hasAppointment ||
              !newDate ||
              !newTime
            }
            className="btn-primary justify-center py-4 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Rescheduling...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Confirm reschedule
              </>
            )}

          </button>

        </form>

      </div>

    </section>
  );
}