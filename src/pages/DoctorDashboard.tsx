import {
  Activity,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Stethoscope,
  UserRound,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Doctor {
  id: string;
  full_name: string | null;
  email: string | null;
  specialization: string | null;
  status: string | null;
}

interface Statistics {
  total_appointments: number;
  today_appointments: number;
  upcoming_appointments: number;
  booked_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
}

interface DoctorSchedule {
  id?: string;
  doctor_id?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  status?: string;
}

interface Appointment {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  status?: string;
}

interface DoctorDashboardResponse {
  success: boolean;
  doctor: Doctor;
  statistics: Statistics;
  schedule: DoctorSchedule[];
  today_appointments: Appointment[];
  upcoming_appointments: Appointment[];
  generated_at?: string;
  message?: string;
}

const DEFAULT_DOCTOR_ID =
  "afcd8220-9733-4de8-826a-d77c2583d394";

function formatTime(time?: string) {
  if (!time) return "—";
  return time.slice(0, 5);
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDay(day?: string) {
  if (!day) return "—";

  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || "UNKNOWN").toUpperCase();

  let classes =
    "border-slate-200 bg-slate-50 text-slate-600";

  if (
    normalized === "BOOKED" ||
    normalized === "CONFIRMED" ||
    normalized === "SCHEDULED"
  ) {
    classes =
      "border-teal-200 bg-teal-50 text-teal-700";
  }

  if (normalized === "COMPLETED") {
    classes =
      "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "CANCELED"
  ) {
    classes =
      "border-red-200 bg-red-50 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${classes}`}
    >
      {normalized}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        {icon}
      </div>

      <div className="text-3xl font-black tracking-tight text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-sm font-bold text-slate-900">
        {label}
      </div>

      <div className="mt-1 text-xs text-slate-400">
        {description}
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const [data, setData] =
    useState<DoctorDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);

  const doctorId =
    params.get("doctor_id") ||
    localStorage.getItem("careflow_doctor_id") ||
    DEFAULT_DOCTOR_ID;

  const loadDashboard = useCallback(
    async (manualRefresh = false) => {
      try {
        setError("");

        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const baseUrl =
          import.meta.env.VITE_N8N_DOCTOR_DASHBOARD_URL;

        if (!baseUrl) {
          throw new Error(
            "VITE_N8N_DOCTOR_DASHBOARD_URL has not been configured."
          );
        }

        const url = new URL(baseUrl);

        url.searchParams.set("doctor_id", doctorId);

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Doctor Dashboard API returned ${response.status}.`
          );
        }

        const result =
          (await response.json()) as DoctorDashboardResponse;

        if (!result.success) {
          throw new Error(
            result.message ||
              "Unable to load doctor dashboard."
          );
        }

        setData(result);

        localStorage.setItem(
          "careflow_doctor_id",
          doctorId
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load doctor dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [doctorId]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <section className="container-shell py-16">
        <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-slate-200 bg-white">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 animate-spin text-teal-700" />
            <p className="font-bold text-slate-900">
              Loading doctor dashboard...
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Retrieving schedule and appointments.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="container-shell py-16">
        <div className="rounded-[32px] border border-red-200 bg-white p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Dashboard unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={() => loadDashboard()}
            className="btn-primary mt-6"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const {
    doctor,
    statistics,
    schedule,
    today_appointments,
    upcoming_appointments,
  } = data;

  return (
    <section className="container-shell py-12">
      {/* Header */}
      <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-teal-700">
            <Stethoscope size={15} />
            Doctor workspace
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
            Doctor dashboard.
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            View your practice schedule, today's patients and
            upcoming appointments from one workspace.
          </p>
        </div>

        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-700 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh dashboard"}
        </button>
      </div>

      {/* Doctor profile */}
      <div className="mb-7 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white">
            <UserRound size={28} />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black text-slate-950">
                {doctor.full_name || "Doctor"}
              </h2>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                {doctor.status || "ACTIVE"}
              </span>
            </div>

            <p className="mt-1 font-semibold text-teal-700">
              {doctor.specialization || "Healthcare Professional"}
            </p>

            {doctor.email && (
              <p className="mt-1 text-sm text-slate-400">
                {doctor.email}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-3 text-sm">
            <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
              Doctor ID
            </span>

            <span className="mt-1 block max-w-[230px] truncate font-mono text-xs text-slate-600">
              {doctor.id}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={20} />}
          value={statistics.today_appointments}
          label="Today's appointments"
          description="Patients scheduled today"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          value={statistics.upcoming_appointments}
          label="Upcoming"
          description="Future active appointments"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={statistics.completed_appointments}
          label="Completed"
          description="Completed consultations"
        />

        <StatCard
          icon={<XCircle size={20} />}
          value={statistics.cancelled_appointments}
          label="Cancelled"
          description="Cancelled appointments"
        />
      </div>

      {/* Main dashboard */}
      <div className="mt-7 grid gap-7 xl:grid-cols-[0.85fr_1.45fr]">
        {/* Weekly schedule */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <CalendarCheck size={19} />
              </div>

              <div>
                <h2 className="font-black text-slate-950">
                  Practice schedule
                </h2>

                <p className="text-xs text-slate-400">
                  Weekly doctor availability
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {schedule.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-7 text-center text-sm text-slate-400">
                No practice schedule found.
              </div>
            ) : (
              <div className="space-y-2">
                {schedule.map((item, index) => (
                  <div
                    key={item.id || `${item.day_of_week}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {formatDay(item.day_of_week)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.slot_duration_minutes || 30} min slots
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-teal-700">
                        {formatTime(item.start_time)} –{" "}
                        {formatTime(item.end_time)}
                      </p>

                      <p className="mt-1 text-[11px] font-bold uppercase text-emerald-600">
                        {item.status || "ACTIVE"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's appointments */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="font-black text-slate-950">
                Today's appointments
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Today's patient queue
              </p>
            </div>

            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
              {today_appointments.length} patients
            </span>
          </div>

          <div className="p-4">
            {today_appointments.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-10 text-center">
                <CalendarDays className="mx-auto text-slate-300" />

                <p className="mt-3 font-bold text-slate-700">
                  No appointments today
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Your schedule is clear for today.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {today_appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-slate-100 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-teal-50 px-3 py-2 font-black text-teal-700">
                          {formatTime(appointment.start_time)}
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            Patient appointment
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {appointment.reason ||
                              "General consultation"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatTime(appointment.start_time)} –{" "}
                            {formatTime(appointment.end_time)}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={appointment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="mt-7 rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-slate-950">
              Upcoming appointments
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Next scheduled patient visits
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {upcoming_appointments.length} appointments
          </span>
        </div>

        <div className="overflow-x-auto">
          {upcoming_appointments.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              No upcoming appointments.
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {upcoming_appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-5 font-semibold text-slate-800">
                      {formatDate(
                        appointment.appointment_date
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-bold text-teal-700">
                        {formatTime(appointment.start_time)}
                      </span>

                      <span className="text-slate-400">
                        {" "}
                        – {formatTime(appointment.end_time)}
                      </span>
                    </td>

                    <td className="max-w-[320px] px-6 py-5 text-sm text-slate-500">
                      {appointment.reason ||
                        "General consultation"}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge
                        status={appointment.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
        <Activity size={14} />
        Live data powered by CareFlow AI healthcare automation
      </div>
    </section>
  );
}