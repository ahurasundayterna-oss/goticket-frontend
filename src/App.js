import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Bookings from "./pages/Bookings";

// NEW PAGES
import StaffManagement from "./pages/StaffManagement";
import RouteManagement from "./pages/RouteManagement";

// SUPER ADMIN PAGES
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
        {/* NOT LOGGED IN */}
        {!token && <Route path="*" element={<Login />} />}

        {/* SUPER ADMIN ROUTES */}
        {token && role === "SUPER_ADMIN" && (
          <>
            <Route path="/sa/dashboard" element={<SADashboard />} />
            <Route path="/sa/parks" element={<SAParks />} />
            <Route path="/sa/admins" element={<SAAdmins />} />
            <Route path="/sa/analytics" element={<SAAnalytics />} />
            <Route path="*" element={<SADashboard />} />
          </>
        )}

        {/* BRANCH ADMIN ROUTES */}
        {token && role !== "SUPER_ADMIN" && (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/bookings" element={<Bookings />} />

            {/* NEW ROUTES */}
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