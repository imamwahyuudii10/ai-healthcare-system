import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, Stethoscope, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { api, type DoctorScheduleResponse } from "../lib/api";

export default function DoctorSchedule() {
  const navigate = useNavigate();

  const [data, setData] = useState<DoctorScheduleResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");

  async function loadSchedule() {
    try {
      setLoading(true);
      setError("");

      const response = await api.doctorSchedule();

      if (!response.success) {
        throw new Error("Failed to load doctor schedule.");
      }

      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedule();
  }, []);

  const specializations = useMemo(() => {
    if (!data) return [];

    return ["All", ...data.specializations.map((item) => item.specialization)];
  }, [data]);

  const filteredDoctors = useMemo(() => {
    if (!data) return [];

    return data.specializations

      .filter(
        (item) =>
          selectedSpecialization === "All" ||
          item.specialization === selectedSpecialization,
      )

      .flatMap((item) =>
        item.doctors.map((doctor) => ({
          ...doctor,
          specialization: item.specialization,
        })),
      )

      .filter((doctor) =>
        doctor.doctor_name.toLowerCase().includes(search.toLowerCase()),
      );
  }, [data, search, selectedSpecialization]);

  function groupSchedule(schedules: any[]) {
    const grouped: Record<string, string[]> = {};

    schedules.forEach((item) => {
      const day = item.day_of_week;

      if (!grouped[day]) {
        grouped[day] = [];
      }

      const time = `${item.start_time.slice(0, 5)} - ${item.end_time.slice(
        0,
        5,
      )}`;

      if (!grouped[day].includes(time)) {
        grouped[day].push(time);
      }
    });

    return grouped;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* HEADER */}
      <section className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-700">
          <Stethoscope size={16} />
          Doctor Directory
        </div>

        <h1 className="mt-3 text-4xl font-black text-slate-950">
          Doctor Schedule
        </h1>

        <p className="mt-2 text-slate-600">
          View doctor availability and practice schedules across CareFlow AI.
        </p>
      </section>

      {/* FILTER */}
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search
            size={18}
            className="
              absolute left-4 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor..."
            className="
              w-full rounded-xl
              border border-slate-200
              py-3 pl-11 pr-4
              outline-none
              focus:border-teal-600
            "
          />
        </div>

        <select
          value={selectedSpecialization}

          onChange={(e) => setSelectedSpecialization(e.target.value)}

          className="
            rounded-xl
            border border-slate-200
            px-4 py-3
            font-semibold
          "
        >
          {specializations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <button
          onClick={() => navigate("/find-doctor")}

          className="
            rounded-xl
            bg-teal-700
            px-5 py-3
            font-bold
            text-white
            hover:bg-teal-800
          "
        >
          Book Appointment
        </button>
      </section>

      {loading && (
        <div className="rounded-xl border bg-white p-6 text-center">
          Loading schedules...
        </div>
      )}

      {error && (
        <div
          className="
          rounded-xl
          border border-red-200
          bg-red-50
          p-5
          text-red-700
        "
        >
          {error}
        </div>
      )}

      {/* DOCTOR GRID */}
      <div
        className="
        grid gap-6
        md:grid-cols-2
      "
      >
        {filteredDoctors.map((doctor) => (
          <article
            key={doctor.doctor_id}

            className="
              rounded-3xl
              border
              bg-white
              p-5
              shadow-sm
            "
          >
            {/* PROFILE */}

            <div
              className="
              flex
              items-center
              justify-between
            "
            >
              <div
                className="
                flex
                items-center
                gap-4
              "
              >
                <div
                  className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-teal-700
                  text-white
                "
                >
                  <UserRound size={22} />
                </div>

                <div>
                  <h2
                    className="
                    text-lg
                    font-black
                  "
                  >
                    {doctor.doctor_name}
                  </h2>

                  <p
                    className="
                    text-sm
                    font-semibold
                    text-teal-700
                  "
                  >
                    {doctor.specialization}
                  </p>
                </div>
              </div>

              <span
                className="
                flex
                items-center
                gap-2
                rounded-full
                bg-emerald-50
                px-3
                py-1
                text-xs
                font-bold
                text-emerald-700
              "
              >
                <span
                  className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                "
                />

                {doctor.status}
              </span>
            </div>

            {/* SCHEDULE */}

            <div
              className="
              mt-5
              grid
              gap-2
            "
            >
              {Object.entries(groupSchedule(doctor.schedules)).map(
                ([day, times]) => (
                  <div
                    key={day}

                    className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-slate-50
                    px-4
                    py-3
                  "
                  >
                    <div
                      className="
                    flex
                    items-center
                    gap-2
                    font-bold
                  "
                    >
                      <CalendarDays size={16} className="text-teal-700" />

                      {day}
                    </div>

                    <div
                      className="
                    text-sm
                    text-slate-600
                  "
                    >
                      {(times as string[]).join(", ")}
                    </div>
                  </div>
                ),
              )}
            </div>

            <button
              onClick={() => navigate("/find-doctor")}

              className="
                mt-5
                w-full
                rounded-xl
                border
                border-teal-700
                py-3
                font-bold
                text-teal-700
                hover:bg-teal-700
                hover:text-white
              "
            >
              Select Doctor
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
