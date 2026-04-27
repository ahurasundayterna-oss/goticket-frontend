/**
 * frontend/src/super-admin/pages/SAReports.jsx
 * Super Admin reports page.
 * Tabs: Bookings | Trips | Revenue | Branches
 * Filters: date range + park + branch (cascading)
 * Download: CSV
 */

import React, { useState, useEffect, useCallback } from "react";
import SALayout from "../components/SALayout";      // ✅ FIXED
import API from "../../api/api";                    // ✅ FIXED
import "../styles/sa-globals.css";                  // ✅ FIXED
import "../../styles/Reports.css";                  // ✅ (unchanged, correct)

/* ── CSV helper ──────────────────────────────────────────────── */
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

const TABS = ["Bookings", "Trips", "Revenue", "Branches"];

export default function SAReports() {
  const [activeTab,   setActiveTab]   = useState("Bookings");
  const [from,        setFrom]        = useState("");
  const [to,          setTo]          = useState("");
  const [parks,       setParks]       = useState([]);
  const [branches,    setBranches]    = useState([]);
  const [selectedPark,   setSelectedPark]   = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Load parks on mount
  useEffect(() => {
    API.get("/super/parks")
      .then(res => setParks(res.data))
      .catch(() => {});
  }, []);

  // Load branches when park selected
  useEffect(() => {
    if (!selectedPark) { setBranches([]); setSelectedBranch(""); return; }
    API.get(`/super/branches/${selectedPark}`)
      .then(res => setBranches(res.data))
      .catch(() => setBranches([]));
    setSelectedBranch("");
  }, [selectedPark]);

  const endpoint = {
    Bookings:  "/reports/bookings",
    Trips:     "/reports/trips",
    Revenue:   "/reports/revenue",
    Branches:  "/reports/branches",
  };

  const fetchReport = useCallback(async (tab = activeTab) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const params = new URLSearchParams();
      if (from)           params.set("from",     from);
      if (to)             params.set("to",       to);
      if (selectedPark)   params.set("parkId",   selectedPark);
      if (selectedBranch) params.set("branchId", selectedBranch);
      const res = await API.get(`${endpoint[tab]}?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [activeTab, from, to, selectedPark, selectedBranch]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setData(null);
    setError("");
  };

  const handleDownload = () => {
    if (!data?.rows?.length) return;
    downloadCSV(`goticket-sa-${activeTab.toLowerCase()}-report.csv`, data.rows);
  };

  return (
    <SALayout>
      <div className="sa-page-header sa-animate-in">
        <div>
          <h1 className="sa-page-title">Reports</h1>
          <p className="sa-page-sub">System-wide data across all parks and branches</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sa-tabs" style={{ marginBottom: 16 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`sa-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => switchTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="report-filters sa-animate-in">
        <div className="report-filter-group">
          <label className="sa-form-label">From</label>
          <input type="date" className="sa-form-control" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="report-filter-group">
          <label className="sa-form-label">To</label>
          <input type="date" className="sa-form-control" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="report-filter-group">
          <label className="sa-form-label">Park</label>
          <select className="sa-form-control" value={selectedPark} onChange={e => setSelectedPark(e.target.value)}>
            <option value="">All parks</option>
            {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {activeTab !== "Branches" && (
          <div className="report-filter-group">
            <label className="sa-form-label">Branch</label>
            <select
              className="sa-form-control"
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              disabled={!selectedPark}
            >
              <option value="">{selectedPark ? "All branches" : "Select park first"}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div className="report-filter-actions">
          <button className="sa-btn sa-btn-primary" onClick={() => fetchReport()}>
            Generate Report
          </button>
          {data?.rows?.length > 0 && (
            <button className="sa-btn sa-btn-ghost" onClick={handleDownload}>
              ↓ Download CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary strip */}
      {data && (
        <div className="report-summary sa-animate-in">
          <span className="report-summary-count">
            {data.total} record{data.total !== 1 ? "s" : ""}
          </span>
          {data.totalRevenue !== undefined && (
            <span className="report-summary-revenue">
              Total Revenue: {fmtCurrency(data.totalRevenue)}
            </span>
          )}
        </div>
      )}

      {error && <div className="sa-error-banner">{error}</div>}

      {loading && <div className="sa-skel" style={{ height: 200, marginTop: 16 }} />}

      {!loading && data?.rows?.length === 0 && (
        <div className="sa-card">
          <div className="sa-empty">
            <span className="sa-empty-icon">📊</span>
            No data found for this period.
          </div>
        </div>
      )}

      {!loading && data?.rows?.length > 0 && (
        <div className="report-table-wrap sa-animate-in">
          <table className="sa-table">
            <thead>
              <tr>
                {activeTab === "Bookings" && <>
                  <th>#</th><th>Reference</th><th>Passenger</th><th>Route</th>
                  <th>Seat</th><th>Price</th><th>Source</th><th>Payment</th>
                  <th>Branch</th><th>Park</th><th>Date</th>
                </>}
                {activeTab === "Trips" && <>
                  <th>#</th><th>Route</th><th>Type</th><th>Departure</th>
                  <th>Price</th><th>Seats</th><th>Booked</th><th>Status</th>
                  <th>Branch</th><th>Park</th><th>Created</th>
                </>}
                {activeTab === "Revenue" && <>
                  <th>#</th><th>Reference</th><th>Passenger</th><th>Route</th>
                  <th>Amount</th><th>Source</th><th>Branch</th><th>Park</th><th>Paid At</th>
                </>}
                {activeTab === "Branches" && <>
                  <th>#</th><th>Branch</th><th>Park</th><th>Status</th>
                  <th>Bookings</th><th>Trips</th><th>Revenue</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--sa-text-tertiary)", fontFamily: "var(--sa-mono)" }}>{i + 1}</td>

                  {activeTab === "Bookings" && <>
                    <td><span className="sa-ref-code">{r.reference}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.passengerName}</td>
                    <td style={{ fontSize: 12 }}>{r.route}</td>
                    <td><span className="sa-pill sa-pill-blue">Seat {r.seatNumber}</span></td>
                    <td style={{ fontFamily: "var(--sa-mono)" }}>{fmtCurrency(r.price)}</td>
                    <td><span className={`sa-pill ${r.bookingSource === "WHATSAPP" ? "sa-pill-green" : "sa-pill-gray"}`}>{r.bookingSource}</span></td>
                    <td><span className={`sa-pill ${r.paymentStatus === "PAID" ? "sa-pill-green" : "sa-pill-amber"}`}>{r.paymentStatus}</span></td>
                    <td style={{ fontSize: 12 }}>{r.branch}</td>
                    <td style={{ fontSize: 12 }}>{r.park}</td>
                    <td style={{ fontSize: 12, fontFamily: "var(--sa-mono)" }}>{fmtDate(r.createdAt)}</td>
                  </>}

                  {activeTab === "Trips" && <>
                    <td style={{ fontSize: 12 }}>{r.route}</td>
                    <td><span className={`sa-pill ${r.tripType === "FLEXIBLE" ? "sa-pill-purple" : "sa-pill-blue"}`}>{r.tripType}</span></td>
                    <td style={{ fontSize: 12, fontFamily: "var(--sa-mono)" }}>{r.departureTime ? `${fmtDate(r.departureTime)} ${fmtTime(r.departureTime)}` : "—"}</td>
                    <td style={{ fontFamily: "var(--sa-mono)" }}>{fmtCurrency(r.price)}</td>
                    <td>{r.totalSeats}</td>
                    <td>{r.seatsBooked}</td>
                    <td><span className={`sa-pill ${r.status === "OPEN" ? "sa-pill-green" : r.status === "FULL" ? "sa-pill-amber" : "sa-pill-gray"}`}>{r.status}</span></td>
                    <td style={{ fontSize: 12 }}>{r.branch}</td>
                    <td style={{ fontSize: 12 }}>{r.park}</td>
                    <td style={{ fontSize: 12, fontFamily: "var(--sa-mono)" }}>{fmtDate(r.createdAt)}</td>
                  </>}

                  {activeTab === "Revenue" && <>
                    <td><span className="sa-ref-code">{r.reference}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.passenger}</td>
                    <td style={{ fontSize: 12 }}>{r.route}</td>
                    <td style={{ fontFamily: "var(--sa-mono)", fontWeight: 600, color: "var(--sa-green, #1D9E75)" }}>{fmtCurrency(r.amount)}</td>
                    <td><span className={`sa-pill ${r.source === "WHATSAPP" ? "sa-pill-green" : "sa-pill-gray"}`}>{r.source}</span></td>
                    <td style={{ fontSize: 12 }}>{r.branch}</td>
                    <td style={{ fontSize: 12 }}>{r.park}</td>
                    <td style={{ fontSize: 12, fontFamily: "var(--sa-mono)" }}>{r.paidAt ? `${fmtDate(r.paidAt)} ${fmtTime(r.paidAt)}` : "—"}</td>
                  </>}

                  {activeTab === "Branches" && <>
                    <td style={{ fontWeight: 600 }}>{r.branchName}</td>
                    <td>{r.parkName}</td>
                    <td><span className={`sa-pill ${r.parkStatus === "ACTIVE" ? "sa-pill-green" : "sa-pill-suspended"}`}>{r.parkStatus}</span></td>
                    <td>{r.totalBookings}</td>
                    <td>{r.totalTrips}</td>
                    <td style={{ fontFamily: "var(--sa-mono)", fontWeight: 600 }}>{fmtCurrency(r.totalRevenue)}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SALayout>
  );
}