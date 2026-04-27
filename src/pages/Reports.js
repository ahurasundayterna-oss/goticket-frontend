/**
 * frontend/src/pages/Reports.jsx
 * Branch Admin + Staff reports page.
 * Tabs: Bookings | Trips | Revenue
 * Filters: date range
 * Download: CSV
 */

import React, { useState, useCallback } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import "../styles/globals.css";
import "../styles/Reports.css";

/* ── CSV download helper ─────────────────────────────────────── */
function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines   = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => {
        const val = r[h] ?? "";
        const str = String(val).replace(/"/g, '""');
        return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
      }).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Format helpers ──────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    timeZone: "Africa/Lagos",
  });
}
function fmtTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-NG", {
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
  });
}
function fmtCurrency(n) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

const TABS = ["Bookings", "Trips", "Revenue"];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("Bookings");
  const [from,      setFrom]      = useState("");
  const [to,        setTo]        = useState("");
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const endpoint = {
    Bookings: "/reports/bookings",
    Trips:    "/reports/trips",
    Revenue:  "/reports/revenue",
  };

  const fetchReport = useCallback(async (tab = activeTab) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to)   params.set("to",   to);
      const res = await API.get(`${endpoint[tab]}?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [activeTab, from, to]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setData(null);
    setError("");
  };

  const handleDownload = () => {
    if (!data?.rows?.length) return;
    downloadCSV(`goticket-${activeTab.toLowerCase()}-report.csv`, data.rows);
  };

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">View and export your branch data</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => switchTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="report-filters animate-in">
        <div className="report-filter-group">
          <label className="form-label">From</label>
          <input
            type="date"
            className="form-control"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
        </div>
        <div className="report-filter-group">
          <label className="form-label">To</label>
          <input
            type="date"
            className="form-control"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>
        <div className="report-filter-actions">
          <button className="btn btn-primary" onClick={() => fetchReport()}>
            Generate Report
          </button>
          {data?.rows?.length > 0 && (
            <button className="btn btn-ghost" onClick={handleDownload}>
              ↓ Download CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary strip */}
      {data && (
        <div className="report-summary animate-in">
          <span className="report-summary-count">
            {data.total} record{data.total !== 1 ? "s" : ""}
          </span>
          {data.totalRevenue !== undefined && (
            <span className="report-summary-revenue">
              Total: {fmtCurrency(data.totalRevenue)}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && <div className="dash-error-banner">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="skel" style={{ height: 200, marginTop: 16 }} />
      )}

      {/* Table */}
      {!loading && data?.rows?.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">📊</span>
            No data found for this period.
          </div>
        </div>
      )}

      {!loading && data?.rows?.length > 0 && (
        <div className="report-table-wrap animate-in">
          <table className="gtable">
            <thead>
              <tr>
                {/* ── Bookings columns ── */}
                {activeTab === "Bookings" && <>
                  <th>#</th><th>Reference</th><th>Passenger</th>
                  <th>Route</th><th>Seat</th><th>Price</th>
                  <th>Source</th><th>Payment</th><th>Date</th>
                </>}
                {/* ── Trips columns ── */}
                {activeTab === "Trips" && <>
                  <th>#</th><th>Route</th><th>Type</th>
                  <th>Departure</th><th>Price</th><th>Seats</th>
                  <th>Booked</th><th>Status</th><th>Created</th>
                </>}
                {/* ── Revenue columns ── */}
                {activeTab === "Revenue" && <>
                  <th>#</th><th>Reference</th><th>Passenger</th>
                  <th>Route</th><th>Amount</th><th>Source</th><th>Paid At</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--text-tertiary)", fontFamily: "var(--mono)" }}>{i + 1}</td>

                  {activeTab === "Bookings" && <>
                    <td><span className="ref-code">{r.reference}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.passengerName}</td>
                    <td><div className="route-tag" style={{ fontSize: 12 }}>{r.route}</div></td>
                    <td><span className="pill pill-blue">Seat {r.seatNumber}</span></td>
                    <td style={{ fontFamily: "var(--mono)" }}>{fmtCurrency(r.price)}</td>
                    <td><span className={`pill ${r.bookingSource === "WHATSAPP" ? "pill-green" : "pill-gray"}`}>{r.bookingSource}</span></td>
                    <td><span className={`pill ${r.paymentStatus === "PAID" ? "pill-green" : "pill-amber"}`}>{r.paymentStatus}</span></td>
                    <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{fmtDate(r.createdAt)}</td>
                  </>}

                  {activeTab === "Trips" && <>
                    <td><div className="route-tag" style={{ fontSize: 12 }}>{r.route}</div></td>
                    <td><span className={`pill ${r.tripType === "FLEXIBLE" ? "pill-purple" : "pill-blue"}`}>{r.tripType}</span></td>
                    <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{r.departureTime ? `${fmtDate(r.departureTime)} ${fmtTime(r.departureTime)}` : "—"}</td>
                    <td style={{ fontFamily: "var(--mono)" }}>{fmtCurrency(r.price)}</td>
                    <td>{r.totalSeats}</td>
                    <td>{r.seatsBooked}</td>
                    <td><span className={`pill ${r.status === "OPEN" ? "pill-green" : r.status === "FULL" ? "pill-amber" : "pill-gray"}`}>{r.status}</span></td>
                    <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{fmtDate(r.createdAt)}</td>
                  </>}

                  {activeTab === "Revenue" && <>
                    <td><span className="ref-code">{r.reference}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.passenger}</td>
                    <td><div className="route-tag" style={{ fontSize: 12 }}>{r.route}</div></td>
                    <td style={{ fontFamily: "var(--mono)", fontWeight: 600, color: "var(--green)" }}>{fmtCurrency(r.amount)}</td>
                    <td><span className={`pill ${r.source === "WHATSAPP" ? "pill-green" : "pill-gray"}`}>{r.source}</span></td>
                    <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{r.paidAt ? `${fmtDate(r.paidAt)} ${fmtTime(r.paidAt)}` : "—"}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}