import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type { BookingResponse } from "../types";

export default function Book() {
  const [params] = useSearchParams();

  // =========================================================
  // SELECTED SLOT FROM FIND DOCTOR
  // =========================================================
  const selectedAppointment = useMemo(() => {
    const cleanParam = (key: string) => {
      const value = params.get(key)?.trim();

      if (
        !value ||
        value.toLowerCase() === "undefined" ||
        value.toLowerCase() === "null"
      ) {
        return "";
      }

      return value;
    };

    return {
      doctor_id: cleanParam("doctor_id"),
      doctor_name: cleanParam("doctor_name"),
      specialization: cleanParam("specialization"),
      date:
        cleanParam("date") ||
        cleanParam("appointment_date"),
      time:
        cleanParam("time") ||
        cleanParam("start_time"),
    };
  }, [params]);

  // =========================================================
  // FORM STATE
  // =========================================================
  const [patientEmail, setPatientEmail] = useState("");
  const [reason, setReason] = useState("");

  const [result, setResult] = useState<BookingResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // SLOT VALIDATION
  // =========================================================
  const hasCompleteSlot = Boolean(
    selectedAppointment.doctor_id &&
      selectedAppointment.date &&
      selectedAppointment.time
  );

  const canSubmit =
    hasCompleteSlot &&
    patientEmail.trim().length > 0 &&
    !loading &&
    !result?.success;

  // =========================================================
  // FORMAT DATE
  // =========================================================
  function formatDisplayDate(value: string) {
    if (!value) return "—";

    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsed);
  }

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================
  async function submit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setResult(null);

    const email = patientEmail.trim().toLowerCase();

    if (!hasCompleteSlot) {
      setError(
        "Please select an available doctor and appointment slot from Find Doctor."
      );
      return;
    }

    if (!email) {
      setError("Please enter your registered patient email.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.book({
        patient_email: email,
        doctor_id: selectedAppointment.doctor_id,
        appointment_date: selectedAppointment.date,
        start_time: selectedAppointment.time,
        reason: reason.trim() || undefined,
      });

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Booking failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-shell py-16">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
            Secure booking
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
            Book your appointment.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Select an available doctor and appointment slot, then confirm
            your booking using your registered patient email.
          </p>
        </div>

        {/* =====================================================
            NO SLOT SELECTED
        ====================================================== */}
        {!hasCompleteSlot && (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Search size={21} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-black text-amber-950">
                  No appointment slot selected
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Choose a doctor and an available appointment slot before
                  continuing with your booking.
                </p>

                <Link
                  to="/find-doctor"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Find available doctor
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            SELECTED APPOINTMENT
        ====================================================== */}
        {hasCompleteSlot && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-teal-950 text-white shadow-lg shadow-teal-950/10">
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">
                  Selected appointment
                </p>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  Slot selected
                </span>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <UserRound size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-black sm:text-2xl">
                    {selectedAppointment.doctor_name || "Selected doctor"}
                  </h2>

                  {selectedAppointment.specialization && (
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-teal-100">
                      <Stethoscope size={16} />
                      <span>{selectedAppointment.specialization}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4">
                  <CalendarDays
                    size={18}
                    className="shrink-0 text-teal-300"
                  />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-200">
                      Appointment date
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {formatDisplayDate(selectedAppointment.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4">
                  <Clock3
                    size={18}
                    className="shrink-0 text-teal-300"
                  />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-200">
                      Start time
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {selectedAppointment.time}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/find-doctor"
                className="mt-5 inline-flex text-sm font-bold text-teal-200 transition hover:text-white"
              >
                Change doctor or appointment slot
              </Link>
            </div>
          </div>
        )}

        {/* =====================================================
            BOOKING FORM
        ====================================================== */}
        <form
          onSubmit={submit}
          className="card mt-6 grid gap-6 p-6 sm:p-8"
        >
          {/* EMAIL */}
          <div>
            <label className="label">
              Registered patient email
            </label>

            <p className="mb-3 text-sm text-slate-500">
              Use the same email registered in the patient system.
            </p>

            <input
              className="field"
              type="email"
              required
              autoComplete="email"
              value={patientEmail}
              onChange={(e) => {
                setPatientEmail(e.target.value);

                if (error) {
                  setError("");
                }
              }}
              placeholder="patient@example.com"
            />
          </div>

          {/* SLOT INFORMATION */}
          {hasCompleteSlot && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  Appointment date
                </label>

                <div className="field flex items-center gap-3 bg-slate-50 text-slate-700">
                  <CalendarDays size={18} className="text-teal-700" />

                  <span className="font-semibold">
                    {selectedAppointment.date}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">
                  Start time
                </label>

                <div className="field flex items-center gap-3 bg-slate-50 text-slate-700">
                  <Clock3 size={18} className="text-teal-700" />

                  <span className="font-semibold">
                    {selectedAppointment.time}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for the appointment"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {result?.success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
              <div className="flex items-center gap-2 font-black">
                <CheckCircle2 size={20} />
                Appointment booked
              </div>

              <p className="mt-2 text-sm leading-6">
                {result.message ||
                  "Your appointment has been confirmed successfully."}
              </p>

              <Link
                to="/appointments"
                className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-800"
              >
                View my appointments
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 py-4 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={18}
                />
                Booking appointment...
              </>
            ) : result?.success ? (
              <>
                <CheckCircle2 size={18} />
                Appointment confirmed
              </>
            ) : (
              <>
                Confirm booking
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {!hasCompleteSlot && (
            <p className="text-center text-xs font-medium text-slate-400">
              Select an available appointment from Find Doctor to enable
              booking.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}