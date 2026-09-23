export type AvailabilitySlot = {
  start_time: string;
  end_time: string;
};

export type AvailabilitySchedule = {
  doctor_id: string;
  doctor_name: string;
  specialization: string;
  date?: string;
  day_of_week?: string;
  schedule_start?: string;
  schedule_end?: string;
  available_slots?: AvailabilitySlot[];
  available_slot_count?: number;
};

export type AvailabilityResponse = {
  success?: boolean;
  mode?: string;
  specialization?: string;
  requested_date?: string;
  requested_day?: string;
  preferred_time?: string;
  has_availability?: boolean;
  schedules?: AvailabilitySchedule[];
  schedule_count?: number;
  message?: string;
};

export type Appointment = {
  id?: string;
  doctor_name?: string;
  specialization?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  reason?: string;
};

export type LookupResponse = {
  success?: boolean;
  appointments?: Appointment[];
  data?: Appointment[];
  message?: string;
};

export type BookingResponse = {
  success?: boolean;
  message?: string;
  appointment?: Appointment;
  appointment_id?: string;
};