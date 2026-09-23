import type {
  AvailabilityResponse,
  BookingResponse,
  LookupResponse,
} from "../types";

/* =========================================================
   N8N WEBHOOK URLS
========================================================= */

const availabilityUrl = import.meta.env.VITE_N8N_AVAILABILITY_URL;
const bookingUrl = import.meta.env.VITE_N8N_BOOKING_URL;
const lookupUrl = import.meta.env.VITE_N8N_LOOKUP_URL;
const rescheduleUrl = import.meta.env.VITE_N8N_RESCHEDULE_URL;
const cancelUrl = import.meta.env.VITE_N8N_CANCEL_URL;

const adminAnalyticsUrl =
  import.meta.env.VITE_N8N_ADMIN_ANALYTICS_URL;

const adminAppointmentsUrl =
  import.meta.env.VITE_N8N_ADMIN_APPOINTMENTS_URL;

const doctorScheduleUrl =
  import.meta.env.VITE_N8N_DOCTOR_SCHEDULE_URL;

const doctorDashboardUrl =
  import.meta.env.VITE_N8N_DOCTOR_DASHBOARD_URL;

const doctorAppointmentsUrl =
  import.meta.env.VITE_N8N_DOCTOR_APPOINTMENTS_URL;

/* =========================================================
   HTTP HELPERS
========================================================= */

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  let data: unknown = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      success: response.ok,
      message: text || "Invalid response.",
    };
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "message" in data
        ? String(
            (data as { message?: unknown }).message,
          )
        : `Request failed (${response.status}).`,
    );
  }

  return data as T;
}

async function postJson<T>(
  url: string | undefined,
  body: unknown,
): Promise<T> {
  if (!url) {
    throw new Error("Webhook URL is missing.");
  }

  return parseResponse<T>(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
}

async function getJson<T>(
  url: string | undefined,
): Promise<T> {
  if (!url) {
    throw new Error("Webhook URL is missing.");
  }

  return parseResponse<T>(
    await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }),
  );
}

function withQuery(
  url: string | undefined,
  params: Record<string, string | undefined>,
) {
  if (!url) return undefined;

  const finalUrl = new URL(url);

  Object.entries(params).forEach(
    ([key, value]) => {
      if (value) {
        finalUrl.searchParams.set(key, value);
      }
    },
  );

  return finalUrl.toString();
}

/* =========================================================
   DOCTOR TYPES
========================================================= */

export interface DoctorProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  specialization: string | null;
  status: string | null;
}

export interface DoctorScheduleItem {
  id?: string;
  doctor_id?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  status?: string;
}

/*
  Structure returned by Doctor Schedule API.
  This replaces the previous unknown[] type.
*/

export interface DoctorDirectoryDoctor {
  doctor_id: string;
  doctor_name: string;
  email?: string | null;
  status: string;
  schedules: DoctorScheduleItem[];
}

export interface DoctorSpecializationGroup {
  specialization: string;
  doctor_count?: number;
  doctors: DoctorDirectoryDoctor[];
}

export interface DoctorScheduleResponse {
  success: boolean;
  total_specializations: number;
  total_doctors: number;
  specializations: DoctorSpecializationGroup[];
  message?: string;
}

/* =========================================================
   APPOINTMENT TYPES
========================================================= */

export interface DoctorAppointment {
  id: string;
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  doctor_id?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  status?: string;
}

export type DoctorAppointmentFilter =
  | "today"
  | "upcoming"
  | "completed"
  | "cancelled";

export interface DoctorAppointmentsResponse {
  success: boolean;
  status?: DoctorAppointmentFilter;
  doctor_id?: string;
  appointment_count?: number;
  appointments: DoctorAppointment[];
  message?: string;
}

/* =========================================================
   ADMIN TYPES
========================================================= */

export interface AdminAppointment {
  appointment_id: string;
  patient_name: string;
  doctor_name: string;
  specialization?: string;
  appointment_date: string;
  start_time: string;
  end_time?: string;
  reason?: string;
  status: string;
}

export interface AdminAppointmentsResponse {
  success: boolean;
  data: AdminAppointment[];
  message?: string;
}

export interface AdminAnalyticsResponse {
  success: boolean;

  metrics: {
    total: number;
    booked: number;
    completed: number;
    cancelled: number;
    pending: number;
  };

  automation: {
    reminders_sent: number;
    followups_sent: number;
  };

  generated_at: string;
  message?: string;
}

/* =========================================================
   DOCTOR DASHBOARD
========================================================= */

export interface DoctorDashboardResponse {
  success: boolean;

  doctor: DoctorProfile;

  statistics: Record<string, number>;

  schedule: DoctorScheduleItem[];

  today_appointments: DoctorAppointment[];

  upcoming_appointments: DoctorAppointment[];

  generated_at?: string;

  message?: string;
}

/* =========================================================
   RESCHEDULE / CANCEL
========================================================= */

export interface RescheduleResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface CancelResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

/* =========================================================
   API
========================================================= */

export const api = {
  /* ---------------- AVAILABILITY ---------------- */

  availability: (payload: {
    specialization: string;
    date?: string;
    preferred_time?: string;
    search_next_available?: boolean;
  }) =>
    postJson<AvailabilityResponse>(
      availabilityUrl,
      payload,
    ),

  /* ---------------- BOOKING ---------------- */

  book: (payload: {
    patient_email: string;
    doctor_id: string;
    appointment_date: string;
    start_time: string;
    reason?: string;
  }) =>
    postJson<BookingResponse>(
      bookingUrl,
      payload,
    ),

  /* ---------------- LOOKUP ---------------- */

  lookup: (payload: {
    patient_email?: string;
    appointment_id?: string;
  }) =>
    postJson<LookupResponse>(
      lookupUrl,
      payload,
    ),

  /* ---------------- RESCHEDULE ---------------- */

  reschedule: (payload: {
    appointment_id: string;
    new_date: string;
    new_start_time: string;
    reason?: string;
  }) =>
    postJson<RescheduleResponse>(
      rescheduleUrl,
      payload,
    ),

  /* ---------------- CANCEL ---------------- */

  cancel: (payload: {
    appointment_id: string;
    reason?: string;
  }) =>
    postJson<CancelResponse>(
      cancelUrl,
      payload,
    ),

  /* ---------------- ADMIN ---------------- */

  adminAnalytics: () =>
    getJson<AdminAnalyticsResponse>(
      adminAnalyticsUrl,
    ),

  adminAppointments: (payload?: {
    status?: string;
  }) =>
    getJson<AdminAppointmentsResponse>(
      withQuery(adminAppointmentsUrl, {
        status: payload?.status,
      }),
    ),

  /* ---------------- DOCTOR SCHEDULE ---------------- */

  doctorSchedule: () =>
    getJson<DoctorScheduleResponse>(
      doctorScheduleUrl,
    ),

  /* ---------------- DOCTOR DASHBOARD ---------------- */

  doctorDashboard: (doctorId: string) =>
    getJson<DoctorDashboardResponse>(
      withQuery(doctorDashboardUrl, {
        doctor_id: doctorId,
      }),
    ),

  /* ---------------- DOCTOR APPOINTMENTS ---------------- */

  doctorAppointments: (payload: {
    status: DoctorAppointmentFilter;
    doctor_id?: string;
  }) =>
    getJson<DoctorAppointmentsResponse>(
      withQuery(doctorAppointmentsUrl, {
        status: payload.status,
        doctor_id: payload.doctor_id,
      }),
    ),
};