/**
 * frontend/src/pages/Payments.jsx
 *
 * Admin dashboard payments page.
 * Tabs: Pending | Paid | Expired | Logs
 *
 * Add to App.jsx:
 *   import Payments from "./pages/Payments";
 *   <Route path="/payments" element={<Payments />} />
 *
 * Add to Sidebar NAV_BRANCH_ADMIN:
 *   { name: "Payments", path: "/payments", icon: <...> }
 */

import React, { useState, useCallback } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import "../styles/globals.css";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos",
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

const TABS = ["Pending", "Paid", "Expired", "Logs"];

const ENDPOINT = {
  Pending: "/payments/pending",
  Paid:    "/payments/paid",
  Expired: "/payments/expired",
  Logs:    "/payments/logs",
};

export default function Payments() {
  const [tab,     setTab]     = useState("Pending");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [from,    setFrom]    = useState("");
  const [to,      setTo]      = useState("");

  const fetchData = useCallback(async (t = tab) => {
    setLoading(true); setError(""); setData(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to)   params.set("to",   to);
      const res = await API.get(`${ENDPOINT[t]}?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load");
    } finally { setLoading(false); }
  }, [tab, from, to]);

  const switchTab = (t) => { setTab(t); setData(null); setError(""); };

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-sub">Monnify payment status across all WhatsApp bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => switchTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Filters (Paid tab only) */}
      {tab === "Paid" && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => fetchData()}>Load</button>
        </div>
      )}

      {/* Load button for other tabs */}
      {tab !== "Paid" && !data && !loading && (
        <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => fetchData()}>
          Load {tab} Payments
        </button>
      )}

      {loading && <div className="skel" style={{ height: 200 }} />}
      {error   && <div className="dash-error-banner">{error}</div>}

      {/* Summary strip */}
      {data && (
        <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>{data.total} record{data.total !== 1 ? "s" : ""}</span>
          {data.totalRevenue !== undefined && (
            <span style={{ fontWeight: 700, color: "var(--green)" }}>
              Total: {fmtCurrency(data.totalRevenue)}
            </span>
          )}
        </div>
      )}

      {/* Tables */}
      {data?.bookings?.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">💳</span>
            No {tab.toLowerCase()} payments found.
          </div>
        </div>
      )}

      {/* Pending / Expired table */}
      {data?.bookings?.length > 0 && tab !== "Paid" && (
        <div style={{ overflowX: "auto" }}>
          <table className="gtable animate-in">
            <thead>
              <tr>
                <th>#</th><th>Passenger</th><th>Route</th>
                <th>Reference</th><th>Amount</th><th>Status</th>
                <th>Expires</th><th>Booked At</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((b, i) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--text-tertiary)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{b.passengerName}</td>
                  <td style={{ fontSize: 12 }}>{b.trip?.departureCity} → {b.trip?.destination}</td>
                  <td><span className="ref-code">{b.reference}</span></td>
                  <td style={{ fontFamily: "var(--mono)" }}>{fmtCurrency(b.totalAmount)}</td>
                  <td>
                    <span className={`pill ${b.status === "CANCELLED" ? "pill-red" : "pill-amber"}`}>
                      {b.status === "CANCELLED" ? "Expired" : "Pending"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                    {b.expiresAt ? `${fmtDate(b.expiresAt)} ${fmtTime(b.expiresAt)}` : "—"}
                  </td>
                  <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                    {fmtDate(b.createdAt)} {fmtTime(b.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paid table */}
      {data?.bookings?.length > 0 && tab === "Paid" && (
        <div style={{ overflowX: "auto" }}>
          <table className="gtable animate-in">
            <thead>
              <tr>
                <th>#</th><th>Passenger</th><th>Route</th>
                <th>Reference</th><th>Amount</th>
                <th>Monnify Ref</th><th>Paid At</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((b, i) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--text-tertiary)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{b.passengerName}</td>
                  <td style={{ fontSize: 12 }}>{b.trip?.departureCity} → {b.trip?.destination}</td>
                  <td><span className="ref-code">{b.reference}</span></td>
                  <td style={{ fontFamily: "var(--mono)", fontWeight: 600, color: "var(--green)" }}>
                    {fmtCurrency(b.totalAmount)}
                  </td>
                  <td style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-tertiary)" }}>
                    {b.monnifyReference || b.payment?.providerReference || "—"}
                  </td>
                  <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                    {b.paidAt ? `${fmtDate(b.paidAt)} ${fmtTime(b.paidAt)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Webhook Logs table */}
      {data?.logs?.length > 0 && tab === "Logs" && (
        <div style={{ overflowX: "auto" }}>
          <table className="gtable animate-in">
            <thead>
              <tr><th>#</th><th>Provider</th><th>Event ID</th><th>Processed</th><th>Created At</th></tr>
            </thead>
            <tbody>
              {data.logs.map((l, i) => (
                <tr key={l.id}>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--text-tertiary)" }}>{i + 1}</td>
                  <td><span className="pill pill-blue">{l.provider}</span></td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{l.eventId}</td>
                  <td>
                    <span className={`pill ${l.processed ? "pill-green" : "pill-amber"}`}>
                      {l.processed ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                    {fmtDate(l.createdAt)} {fmtTime(l.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}