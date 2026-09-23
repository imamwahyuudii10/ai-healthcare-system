import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CalendarDays, Clock3, XCircle } from "lucide-react";
import { api } from "../lib/api";

export default function Cancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const appointmentId = searchParams.get("appointment_id") ?? "";
  const patientEmail = searchParams.get("patient_email") ?? "";
  const doctorName = searchParams.get("doctor_name") ?? "Doctor";
  const specialization = searchParams.get("specialization") ?? "";
  const appointmentDate = searchParams.get("appointment_date") ?? "";
  const startTime = searchParams.get("start_time") ?? "";
  const endTime = searchParams.get("end_time") ?? "";

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formattedDate = useMemo(() => {
    if (!appointmentDate) return "—";

    const date = new Date(`${appointmentDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return appointmentDate;
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, [appointmentDate]);

  const formatTime = (value: string) => {
    if (!value) return "—";
    return value.slice(0, 5);
  };

  async function handleCancel() {
    if (!appointmentId) {
      setError("Appointment ID was not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.cancel({
        appointment_id: appointmentId,
        reason: reason.trim(),
      });

      if (!response.success) {
        throw new Error(
          response.message || "Appointment could not be cancelled."
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Appointment could not be cancelled."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-20">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <XCircle className="h-8 w-8 text-emerald-700" />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Cancellation successful
          </p>

          <h1 className="text-3xl font-bold text-slate-950">
            Appointment cancelled.
          </h1>

          <p className="mt-3 text-slate-600">
            Your appointment has been cancelled successfully.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/appointments?email=${encodeURIComponent(patientEmail)}`
              )
            }
            className="mt-8 w-full rounded-xl bg-teal-700 px-5 py-4 font-semibold text-white transition hover:bg-teal-800"
          >
            View my appointments
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to appointments
      </button>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Cancel appointment
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Cancel this appointment?
          </h1>

          <p className="mt-3 text-slate-600">
            Please review the appointment details before cancelling.
          </p>
        </div>

        <div className="p-8">
          <div className="rounded-2xl bg-slate-50 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              {specialization || "Healthcare appointment"}
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {doctorName}
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-white p-4">
                <CalendarDays className="h-5 w-5 text-teal-700" />

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Date
                  </p>
                  <p className="font-semibold text-slate-900">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white p-4">
                <Clock3 className="h-5 w-5 text-teal-700" />

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Time
                  </p>
                  <p className="font-semibold text-slate-900">
                    {formatTime(startTime)}
                    {endTime ? ` – ${formatTime(endTime)}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Reason for cancellation{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              placeholder="Tell us why you need to cancel"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Keep appointment
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading || !appointmentId}
              className="rounded-xl bg-red-600 px-5 py-4 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Cancelling..." : "Cancel appointment"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}