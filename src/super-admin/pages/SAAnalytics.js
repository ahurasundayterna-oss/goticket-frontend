// SAAnalytics.jsx
import React, { useEffect, useState } from "react";
import SALayout from "../components/SALayout";
import API from "../../api/api";
import "../styles/sa-globals.css";
import "../styles/SA-Dashboard.css";

export default function SAAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/super/stats").then(r => setData(r.data)).catch(console.error);
  }, []);

  const rows = data ? [
    { label: "Total Parks",     value: data.totalParks,     icon: "🏢" },
    { label: "Active Parks",    value: data.activeParks,    icon: "✅" },
    { label: "Suspended Parks", value: data.suspendedParks, icon: "⏸️" },
    { label: "Total Trips",     value: data.totalTrips,     icon: "🚌" },
    { label: "Total Bookings",  value: data.totalBookings,  icon: "🎟️" },
    { label: "Total Revenue",   value: `₦${(data.totalRevenue || 0).toLocaleString()}`, icon: "💰" },
    { label: "Total Users",     value: data.totalUsers,     icon: "👥" },
  ] : [];

  return (
    <SALayout>
      <div className="sa-page-header sa-animate-in">
        <div>
          <h1 className="sa-page-title">Analytics</h1>
          <p className="sa-page-sub">System-wide metrics across all parks</p>
        </div>
      </div>

      <div className="sa-card sa-animate-in" style={{ overflow: "hidden" }}>
        <table className="sa-table">
          <thead>
            <tr><th>Metric</th><th>Value</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>{r.icon} {r.label}</td>
                <td style={{ fontFamily: "var(--sa-mono)", fontWeight: 700, fontSize: 16 }}>{r.value ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SALayout>
  );
}
