import SuspendedScreen from "./components/SuspendedScreen";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Bookings from "./pages/Bookings";
import Reports from "./pages/Reports";
import Payments from "./pages/Payments";
import SAReports from "./super-admin/pages/SAReports";

import StaffManagement from "./pages/StaffManagement";
import RouteManagement from "./pages/RouteManagement";

import SADashboard from "./super-admin/pages/SADashboard";
import SAParks from "./super-admin/pages/SAParks";
import SAAdmins from "./super-admin/pages/SAAdmins";
import SAAnalytics from "./super-admin/pages/SAAnalytics";

function App() {
  const [token, setToken] = useState(undefined);
  const [role, setRole] = useState(undefined);

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };

    syncAuth();

    // 🔥 listen for login/logout changes
    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  // ⏳ wait for auth to load
  if (token === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/suspended" element={<SuspendedScreen />} />

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
            <Route path="/sa/reports" element={<SAReports />} />
          </>
        )}

        {/* BRANCH ADMIN / STAFF */}
        {token && role !== "SUPER_ADMIN" && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/routes-mgmt" element={<RouteManagement />} />
            <Route path="*" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/payments" element={<Payments />} />
          </>
        )}

      </Routes>
    </Router>
  );
}

export default App;