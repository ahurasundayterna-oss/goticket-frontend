import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Bookings from "./pages/Bookings";

import StaffManagement from "./pages/StaffManagement";
import RouteManagement from "./pages/RouteManagement";

import SADashboard from "./super-admin/pages/SADashboard";
import SAParks from "./super-admin/pages/SAParks";
import SAAdmins from "./super-admin/pages/SAAdmins";
import SAAnalytics from "./super-admin/pages/SAAnalytics";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* NOT LOGGED IN */}
        {!token && <Route path="*" element={<LandingPage />} />}

        {/* SUPER ADMIN */}
        {token && role === "SUPER_ADMIN" && (
          <>
            <Route path="/sa/dashboard" element={<SADashboard />} />
            <Route path="/sa/parks" element={<SAParks />} />
            <Route path="/sa/admins" element={<SAAdmins />} />
            <Route path="/sa/analytics" element={<SAAnalytics />} />
            <Route path="*" element={<SADashboard />} />
          </>
        )}

        {/* BRANCH ADMIN */}
        {token && role !== "SUPER_ADMIN" && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/routes-mgmt" element={<RouteManagement />} />
            <Route path="*" element={<Dashboard />} />
          </>
        )}

      </Routes>
    </Router>
  );
}

export default App;