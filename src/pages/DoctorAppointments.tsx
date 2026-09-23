import { useEffect, useState } from "react";
import { CalendarDays, Clock, FileText, CheckCircle, UserRound, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

interface Appointment {
  id: string;
  patient_name: string;
  patient_email?: string;
  appointment_date: string;
  start_time: string;
  end_time?: string;
  reason?: string;
  status: string;
}

export default function DoctorAppointments() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "today";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await api.doctorAppointments({ status });

      if (!response.success) {
        throw new Error("Failed loading appointments");
      }

      setAppointments(response.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [status]);

  function getTitle() {
    const titles: Record<string, string> = {
      today: "Today's Appointments",
      upcoming: "Upcoming Appointments",
      completed: "Completed Appointments",
      cancelled: "Cancelled Appointments",
    };

    return titles[status] || "Appointments";
  }

  function statusIcon(value: string) {
    if (value === "COMPLETED") {
      return <CheckCircle size={18} className="text-emerald-600" />;
    }

    if (value === "CANCELLED") {
      return <XCircle size={18} className="text-red-600" />;
    }

    return <CalendarDays size={18} className="text-teal-700" />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">

      <section className="mb-10">
        <h1 className="text-4xl font-black text-slate-950">
          {getTitle()}
        </h1>

        <p className="mt-3 text-slate-600">
          Manage patient appointments and consultation history.
        </p>
      </section>


      {loading && (
        <div className="rounded-2xl border bg-white p-8 text-center">
          Loading appointments...
        </div>
      )}


      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}


      {!loading && !error && (
        <div className="space-y-5">

          {appointments.length === 0 && (
            <div className="rounded-3xl border bg-white p-10 text-center">
              No appointments found.
            </div>
          )}


          {appointments.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              <div className="flex justify-between gap-5">

                <div className="flex gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white">
                    <UserRound />
                  </div>


                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {item.patient_name}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {item.patient_email}
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold">
                  {statusIcon(item.status)}
                  {item.status}
                </div>

              </div>



              <div className="mt-6 grid gap-4 md:grid-cols-3">


                <div className="rounded-xl bg-slate-50 p-4">
                  <CalendarDays size={18} className="text-teal-700" />

                  <p className="mt-2 text-sm text-slate-500">
                    Date
                  </p>

                  <b>{item.appointment_date}</b>
                </div>



                <div className="rounded-xl bg-slate-50 p-4">
                  <Clock size={18} className="text-teal-700" />

                  <p className="mt-2 text-sm text-slate-500">
                    Time
                  </p>

                  <b>
                    {item.start_time}
                    {item.end_time && ` - ${item.end_time}`}
                  </b>
                </div>



                <div className="rounded-xl bg-slate-50 p-4">
                  <FileText size={18} className="text-teal-700" />

                  <p className="mt-2 text-sm text-slate-500">
                    Reason
                  </p>

                  <b>{item.reason || "-"}</b>
                </div>


              </div>



              <button className="mt-6 rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-700 transition hover:bg-teal-700 hover:text-white">
                View Patient Detail
              </button>


            </article>
          ))}

        </div>
      )}

    </main>
  );
}