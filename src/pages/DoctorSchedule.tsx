import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, RefreshCw, Search, Stethoscope, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, type DoctorScheduleResponse } from "../lib/api";

interface ScheduleItem {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
}

interface DoctorItem {
  doctor_id: string;
  doctor_name?: string;
  status?: string;
  schedules?: ScheduleItem[];
}

interface SpecializationItem {
  specialization?: string;
  doctors?: DoctorItem[];
}

interface NormalizedDoctor extends DoctorItem {
  specialization: string;
}

export default function DoctorSchedule() {
  const navigate = useNavigate();

  const [data, setData] = useState<DoctorScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.doctorSchedule();

      if (!response?.success) throw new Error("Failed to load doctor schedule.");
      setData(response);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to fetch doctor schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const specializationGroups = useMemo<SpecializationItem[]>(() => {
    if (!data || !Array.isArray(data.specializations)) return [];
    return data.specializations as SpecializationItem[];
  }, [data]);

  const specializations = useMemo(() => {
    const values = specializationGroups
      .map((item) => item.specialization)
      .filter((value): value is string => Boolean(value));

    return ["All", ...Array.from(new Set(values))];
  }, [specializationGroups]);

  const filteredDoctors = useMemo<NormalizedDoctor[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return specializationGroups
      .filter((item) => selectedSpecialization === "All" || item.specialization === selectedSpecialization)
      .flatMap((item) =>
        (item.doctors ?? []).map((doctor) => ({
          ...doctor,
          specialization: item.specialization || "General",
        })),
      )
      .filter((doctor) => {
        if (!normalizedSearch) return true;

        return (
          (doctor.doctor_name || "").toLowerCase().includes(normalizedSearch) ||
          doctor.specialization.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [specializationGroups, search, selectedSpecialization]);

  function formatTime(value?: string) {
    if (!value) return "--:--";
    return value.length >= 5 ? value.slice(0, 5) : value;
  }

  function groupSchedule(schedules: ScheduleItem[] = []) {
    const grouped: Record<string, string[]> = {};

    schedules.forEach((item) => {
      const day = item.day_of_week?.trim();
      if (!day) return;

      const time = `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`;

      if (!grouped[day]) grouped[day] = [];
      if (!grouped[day].includes(time)) grouped[day].push(time);
    });

    return grouped;
  }

  function selectDoctor(doctor: NormalizedDoctor) {
    const params = new URLSearchParams();

    if (doctor.doctor_id) params.set("doctor_id", doctor.doctor_id);
    if (doctor.doctor_name) params.set("doctor_name", doctor.doctor_name);
    if (doctor.specialization) params.set("specialization", doctor.specialization);

    navigate(`/find-doctor?${params.toString()}`);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-700">
            <Stethoscope size={16} />
            Doctor Directory
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.035em] text-slate-950">Doctor Schedule</h1>

          <p className="mt-2 text-slate-600">View doctor availability and practice schedules across CareFlow AI.</p>
        </div>

        <button
          type="button"
          onClick={() => void loadSchedule()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor or specialty..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-teal-600"
          />
        </div>

        <select
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-teal-600"
        >
          {specializations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => navigate("/find-doctor")}
          className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800"
        >
          Book Appointment
        </button>
      </section>

      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500">
          <Loader2 size={20} className="animate-spin text-teal-700" />
          Loading schedules...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-bold text-red-700">Unable to load doctor schedules</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => void loadSchedule()}
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filteredDoctors.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Stethoscope size={32} className="mx-auto text-slate-300" />
          <h2 className="mt-4 font-black text-slate-900">No doctors found</h2>
          <p className="mt-2 text-sm text-slate-500">Try another doctor name or specialization.</p>
        </div>
      )}

      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDoctors.map((doctor) => {
            const groupedSchedule = groupSchedule(doctor.schedules ?? []);
            const scheduleEntries = Object.entries(groupedSchedule);

            return (
              <article key={doctor.doctor_id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white">
                      <UserRound size={22} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black text-slate-900">{doctor.doctor_name || "Doctor"}</h2>
                      <p className="truncate text-sm font-semibold text-teal-700">{doctor.specialization}</p>
                    </div>
                  </div>

                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {doctor.status || "ACTIVE"}
                  </span>
                </div>

                <div className="mt-5 grid gap-2">
                  {scheduleEntries.length > 0 ? (
                    scheduleEntries.map(([day, times]) => (
                      <div key={day} className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <CalendarDays size={16} className="text-teal-700" />
                          {day}
                        </div>

                        <div className="text-sm font-medium text-slate-600">{times.join(", ")}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                      No practice schedule available.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => selectDoctor(doctor)}
                  className="mt-5 w-full rounded-xl border border-teal-700 py-3 font-bold text-teal-700 transition hover:bg-teal-700 hover:text-white"
                >
                  Select Doctor
                </button>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}