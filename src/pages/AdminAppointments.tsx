import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  X,
  Phone,
  Mail,
} from "lucide-react";

import { api } from "../lib/api";

interface Appointment {
  appointment_id: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  doctor_name: string;
  specialization?: string;
  appointment_date: string;
  start_time: string;
  end_time?: string;
  status: string;
  reason?: string;
}

export default function AdminAppointments() {
  const [searchParams] = useSearchParams();

  const statusFilter = searchParams.get("status") || "all";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.adminAppointments({
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed loading appointments");
      }

      setAppointments(response.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed loading appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, [statusFilter]);

  const summary = useMemo(() => {
    return {
      total: appointments.length,
      booked: appointments.filter(
        x => x.status === "booked"
      ).length,
      completed: appointments.filter(
        x => x.status === "completed"
      ).length,
      cancelled: appointments.filter(
        x => x.status === "cancelled"
      ).length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const keyword = search.toLowerCase();

    return appointments.filter(item =>
      [
        item.patient_name,
        item.patient_email,
        item.patient_phone,
        item.doctor_name,
        item.specialization,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [appointments, search]);

  return (
    <section className="container-shell py-16">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
              Appointment records
            </p>

            <h1 className="mt-3 text-4xl font-black text-slate-950">
              Patient appointments
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Manage appointment activity and patient records.
            </p>
          </div>

          <button
            onClick={() => void loadAppointments()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black hover:bg-slate-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </div>


        {/* SUMMARY */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">

          {[
            ["Total", summary.total],
            ["Booked", summary.booked],
            ["Completed", summary.completed],
            ["Cancelled", summary.cancelled],
          ].map(([label,value]) => (
            <div
              key={label}
              className="card p-5"
            >
              <p className="text-xs font-black uppercase text-slate-400">
                {label}
              </p>

              <p className="mt-2 text-3xl font-black text-slate-950">
                {value}
              </p>
            </div>
          ))}

        </div>


        {/* SEARCH */}
        <div className="mt-8 card p-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">

            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search patient, phone, email or doctor..."
              className="w-full bg-transparent text-sm outline-none"
            />

          </div>
        </div>


        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-black text-red-700">
              Unable to load appointments
            </p>
            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}


        {/* TABLE */}
        <div className="mt-6 card overflow-hidden">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-black">
              {statusFilter === "all"
                ? "All appointments"
                : `${statusFilter} appointments`}
            </h2>
          </div>


          {loading ? (

            <div className="p-10 text-center text-sm text-slate-500">
              Loading appointments...
            </div>

          ) : filteredAppointments.length === 0 ? (

            <div className="p-10 text-center">
              <p className="font-black">
                No appointments found
              </p>
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">
                      Patient
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">
                      Doctor
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">
                      Schedule
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>


                <tbody>

                {filteredAppointments.map(item => (

                  <tr
                    key={item.appointment_id}
                    onClick={()=>setSelected(item)}
                    className="cursor-pointer border-b hover:bg-slate-50"
                  >

                    <td className="px-6 py-5">

                      <div className="flex gap-3">

                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                          <UserRound size={17}/>
                        </div>

                        <div>
                          <p className="font-black">
                            {item.patient_name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {item.reason || "Consultation"}
                          </p>
                        </div>

                      </div>

                    </td>


                    <td className="px-6 py-5">

                      <div className="flex gap-2">

                        <Stethoscope
                          size={16}
                          className="text-teal-700"
                        />

                        <div>
                          <p className="font-bold">
                            {item.doctor_name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {item.specialization}
                          </p>
                        </div>

                      </div>

                    </td>


                    <td className="px-6 py-5">

                      <p className="font-bold">
                        {item.appointment_date}
                      </p>

                      <p className="text-xs text-slate-400">
                        {item.start_time} - {item.end_time}
                      </p>

                    </td>


                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${
                          item.status==="completed"
                          ?"bg-emerald-50 text-emerald-700"
                          :item.status==="cancelled"
                          ?"bg-red-50 text-red-700"
                          :"bg-blue-50 text-blue-700"
                        }`}
                      >

                        {item.status==="completed"
                        ?<CheckCircle2 size={14}/>
                        :item.status==="cancelled"
                        ?<CalendarX size={14}/>
                        :<CalendarCheck size={14}/>
                        }

                        {item.status}

                      </span>

                    </td>

                  </tr>

                ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* DETAIL MODAL */}
      {selected && (

        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-5">

          <div className="w-full max-w-lg rounded-3xl bg-white p-7">

            <div className="flex justify-between">

              <h3 className="text-xl font-black">
                Appointment Detail
              </h3>

              <button
                onClick={()=>setSelected(null)}
              >
                <X/>
              </button>

            </div>


            <div className="mt-6 space-y-4 text-sm">

              <p>
                <b>Patient:</b> {selected.patient_name}
              </p>

              <p>
                <Mail size={15} className="inline mr-2"/>
                {selected.patient_email}
              </p>

              <p>
                <Phone size={15} className="inline mr-2"/>
                {selected.patient_phone}
              </p>

              <p>
                <b>Doctor:</b> {selected.doctor_name}
              </p>

              <p>
                <b>Schedule:</b> {selected.appointment_date} {selected.start_time}
              </p>

              <p>
                <b>Status:</b> {selected.status}
              </p>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}