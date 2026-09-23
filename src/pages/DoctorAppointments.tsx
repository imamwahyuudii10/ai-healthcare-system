import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle, Clock, FileText, RefreshCw, UserRound, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

type AppointmentStatus = "today" | "upcoming" | "completed" | "cancelled";

interface Appointment {
  id: string;
  patient_name?: string;
  patient_email?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  status?: string;
}

export default function DoctorAppointments() {
  const [searchParams] = useSearchParams();
  const rawStatus = searchParams.get("status")?.toLowerCase() || "today";

  const status: AppointmentStatus =
    rawStatus === "upcoming" || rawStatus === "completed" || rawStatus === "cancelled" ? rawStatus : "today";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.doctorAppointments({ status });

      if (!response?.success) throw new Error(response?.message || "Failed loading appointments.");

      setAppointments(Array.isArray(response.appointments) ? response.appointments : []);
    } catch (err) {
      setAppointments([]);
      setError(err instanceof Error ? err.message : "Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  function getTitle() {
    const titles: Record<AppointmentStatus, string> = {
      today: "Today's Appointments",
      upcoming: "Upcoming Appointments",
      completed: "Completed Appointments",
      cancelled: "Cancelled Appointments",
    };

    return titles[status];
  }

  function statusIcon(value?: string) {
    const normalized = value?.toUpperCase();

    if (normalized === "COMPLETED") return <CheckCircle size={18} className="text-emerald-600" />;
    if (normalized === "CANCELLED") return <XCircle size={18} className="text-red-600" />;

    return <CalendarDays size={18} className="text-teal-700" />;
  }

  function displayStatus(value?: string) {
    return value?.trim() || "BOOKED";
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <section className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">Doctor workspace</p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.035em] text-slate-950">{getTitle()}</h1>

          <p className="mt-3 text-slate-600">Manage patient appointments and consultation history.</p>
        </div>

        <button
          type="button"
          onClick={() => void loadAppointments()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
          Loading appointments...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-bold text-red-700">Unable to load appointments</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => void loadAppointments()}
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-5">
          {appointments.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <CalendarDays className="mx-auto text-slate-300" size={32} />
              <h2 className="mt-4 font-black text-slate-900">No appointments found</h2>
              <p className="mt-2 text-sm text-slate-500">There are no appointments available for this category.</p>
            </div>
          )}

          {appointments.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white">
                    <UserRound size={24} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-slate-900">{item.patient_name || "Patient"}</h2>
                    <p className="mt-1 truncate text-sm text-slate-500">{item.patient_email || "Email not available"}</p>
                  </div>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                  {statusIcon(item.status)}
                  {displayStatus(item.status)}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <CalendarDays size={18} className="text-teal-700" />
                  <p className="mt-2 text-sm text-slate-500">Date</p>
                  <p className="mt-1 font-bold text-slate-900">{item.appointment_date || "-"}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <Clock size={18} className="text-teal-700" />
                  <p className="mt-2 text-sm text-slate-500">Time</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {item.start_time || "-"}
                    {item.start_time && item.end_time ? ` - ${item.end_time}` : ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <FileText size={18} className="text-teal-700" />
                  <p className="mt-2 text-sm text-slate-500">Reason</p>
                  <p className="mt-1 font-bold text-slate-900">{item.reason || "-"}</p>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-700 transition hover:bg-teal-700 hover:text-white"
              >
                View Patient Detail
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}