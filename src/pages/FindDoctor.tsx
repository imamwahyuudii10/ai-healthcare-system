import {
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type {
  AvailabilityResponse,
  AvailabilitySchedule,
} from "../types";

export default function FindDoctor() {
  const navigate = useNavigate();

  // =========================================================
  // SEARCH STATE
  // =========================================================
  const [specialization, setSpecialization] =
    useState("Gigi dan Mulut");

  const [date, setDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("any");

  const [result, setResult] =
    useState<AvailabilityResponse | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // SEARCH
  // =========================================================
  async function submit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setResult(null);

    // Website booking harus memakai tanggal spesifik
    if (!date) {
      setError(
        "Please select an appointment date before searching."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await api.availability({
        specialization,
        date,
        preferred_time: preferredTime,
        search_next_available: false,
      });

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to check doctor availability."
      );

      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // HELPERS
  // =========================================================
  function getDoctorName(
    schedule: AvailabilitySchedule
  ) {
    const data = schedule as AvailabilitySchedule & {
      doctor?: {
        name?: string;
        full_name?: string;
      };
      name?: string;
      full_name?: string;
    };

    return (
      schedule.doctor_name ||
      data.doctor?.name ||
      data.doctor?.full_name ||
      data.name ||
      data.full_name ||
      "Doctor"
    );
  }

  function getAppointmentDate(
    schedule: AvailabilitySchedule
  ) {
    return (
      schedule.date ||
      result?.requested_date ||
      date
    );
  }

  function formatDate(value: string) {
    if (!value) return "";

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
function formatTime(value?: string) {
  if (!value) return "";

  return value.slice(0, 5);
}

  // =========================================================
  // SELECT SLOT -> BOOK PAGE
  // =========================================================
  function chooseSlot(
    schedule: AvailabilitySchedule,
    time: string
  ) {
    const doctorId = schedule.doctor_id || "";
    const doctorName = getDoctorName(schedule);
    const appointmentDate =
      getAppointmentDate(schedule);

    if (!doctorId) {
      setError(
        "Doctor ID was not returned by the availability system."
      );
      return;
    }

    if (!appointmentDate) {
      setError(
        "Appointment date was not returned by the availability system."
      );
      return;
    }

    if (!time) {
      setError(
        "Appointment time was not returned by the availability system."
      );
      return;
    }

    const params = new URLSearchParams({
      doctor_id: doctorId,
      doctor_name: doctorName,
      specialization:
        schedule.specialization || specialization,
      date: appointmentDate,
      time: formatTime(time),
    });

    navigate(`/book?${params.toString()}`);
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <section className="container-shell py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
          Real-time availability
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
          Find the right appointment.
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Choose a specialty and appointment date.
          CareFlow AI will check the doctor's schedule
          and show only available appointment slots.
        </p>
      </div>

      {/* =====================================================
          SEARCH FORM
      ====================================================== */}
      <form
        onSubmit={submit}
        className="card mt-10 grid gap-5 p-6 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end"
      >
        {/* SPECIALTY */}
        <div>
          <label className="label">
            Specialty
          </label>

          <div className="relative">
            <Stethoscope
              className="absolute left-4 top-3.5 text-slate-400"
              size={18}
            />

            <select
              className="field pl-11"
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setResult(null);
              }}
            >
              {[
                "Gigi dan Mulut",
                "Kebidanan dan Kandungan",
                "Jantung dan Pembuluh Darah",
                "Penyakit Dalam",
                "Anak",
                "Mata",
                "Saraf",
                "Bedah",
              ].map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DATE */}
        <div>
          <label className="label">
            Appointment date
          </label>

          <input
            className="field"
            type="date"
            required
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setResult(null);
            }}
          />
        </div>

        {/* PREFERRED TIME */}
        <div>
          <label className="label">
            Preferred time
          </label>

          <select
            className="field"
            value={preferredTime}
            onChange={(e) => {
              setPreferredTime(e.target.value);
              setResult(null);
            }}
          >
            <option value="any">
              Any time
            </option>

            <option value="morning">
              Morning
            </option>

            <option value="afternoon">
              Afternoon
            </option>

            <option value="evening">
              Evening
            </option>
          </select>
        </div>

        {/* SEARCH */}
        <button
          type="submit"
          className="btn-primary flex h-[46px] items-center justify-center gap-2"
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

          {loading ? "Checking..." : "Search"}
        </button>
      </form>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          SEARCHING
      ====================================================== */}
      {loading && (
        <div className="card mt-8 p-10 text-center">
          <Loader2
            className="mx-auto animate-spin text-teal-700"
            size={30}
          />

          <h2 className="mt-4 font-black">
            Checking availability...
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            We're checking doctor schedules and
            existing appointments.
          </p>
        </div>
      )}

      {/* =====================================================
          NO AVAILABILITY
      ====================================================== */}
      {!loading &&
        result &&
        !result.has_availability && (
          <div className="card mt-8 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarDays className="text-slate-500" />
            </div>

            <h2 className="mt-4 text-lg font-black">
              No available appointment
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {result.message ||
                "No appointment slots are available for this date. Try another date or time preference."}
            </p>
          </div>
        )}

      {/* =====================================================
          RESULTS
      ====================================================== */}
      {!loading &&
        result?.has_availability && (
          <div className="mt-8">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                  Available appointments
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Choose an available time
                </h2>
              </div>

              {date && (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <CalendarDays size={16} />
                  {formatDate(date)}
                </div>
              )}
            </div>

            <div className="space-y-5">
              {result.schedules?.map(
                (schedule, idx) => {
                  const doctorName =
                    getDoctorName(schedule);

                  const appointmentDate =
                    getAppointmentDate(schedule);

                  const slots =
                    schedule.available_slots || [];

                  return (
                    <article
                      key={`${schedule.doctor_id}-${appointmentDate}-${idx}`}
                      className="card overflow-hidden"
                    >
                      {/* DOCTOR HEADER */}
                      <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                            {schedule.specialization ||
                              specialization}
                          </p>

                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                              <UserRound size={20} />
                            </div>

                            <div>
                              <h3 className="text-xl font-black text-slate-950">
                                {doctorName}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {schedule.specialization ||
                                  specialization}
                              </p>
                            </div>
                          </div>
                        </div>

                        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                          Available
                        </span>
                      </div>

                      {/* SCHEDULE INFORMATION */}
                      <div className="grid gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={17}
                            className="text-teal-700"
                          />

                          <span className="font-semibold">
                            {formatDate(
                              appointmentDate
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock
                            size={17}
                            className="text-teal-700"
                          />

                          <span className="font-semibold">
                            Practice hours:{" "}
                            {formatTime(
                              schedule.schedule_start
                            )}
                            {" – "}
                            {formatTime(
                              schedule.schedule_end
                            )}
                          </span>
                        </div>
                      </div>

                      {/* AVAILABLE SLOTS */}
                      <div className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-black text-slate-950">
                              Available time slots
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                              Select a time to continue
                              to booking.
                            </p>
                          </div>

                          {slots.length > 0 && (
                            <span className="text-xs font-bold text-slate-400">
                              {slots.length} slots
                            </span>
                          )}
                        </div>

                        {/* SLOTS */}
                        {slots.length > 0 ? (
                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {slots.map((slot) => (
                              <button
                                type="button"
                                key={slot.start_time}
                                onClick={() =>
                                  chooseSlot(
                                    schedule,
                                    slot.start_time
                                  )
                                }
                                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-teal-600 hover:bg-teal-50"
                              >
                                <span className="flex items-center gap-2">
                                  <Clock
                                    size={16}
                                    className="text-teal-700"
                                  />

                                  <span className="font-black text-slate-800 group-hover:text-teal-800">
                                    {formatTime(
                                      slot.start_time
                                    )}
                                  </span>
                                </span>

                                <ArrowRight
                                  size={15}
                                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700"
                                />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <p className="font-bold text-amber-900">
                              No bookable slots returned
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-700">
                              The doctor has a practice
                              schedule on this date, but
                              no available appointment
                              times were returned.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </div>
        )}
    </section>
  );
}