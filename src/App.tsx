import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import FindDoctor from "./pages/FindDoctor";
import Book from "./pages/Book";
import Appointments from "./pages/Appointments";
import Reschedule from "./pages/Reschedule";
import Cancel from "./pages/Cancel";

import Admin from "./pages/Admin";
import AdminAppointments from "./pages/AdminAppointments";

import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorSchedule from "./pages/DoctorSchedule";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/find-doctor" element={<FindDoctor />} />
        <Route path="/book" element={<Book />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/reschedule" element={<Reschedule />} />
        <Route path="/cancel" element={<Cancel />} />

        {/* ADMIN */}
        <Route path="/admin" element={<Admin />} />
        <Route 
          path="/admin/appointments" 
          element={<AdminAppointments />} 
        />

        {/* DOCTOR */}
        <Route 
          path="/doctor-dashboard" 
          element={<DoctorDashboard />} 
        />

        <Route 
          path="/doctor-schedule" 
          element={<DoctorSchedule />} 
        />

      </Route>
    </Routes>
  );
}