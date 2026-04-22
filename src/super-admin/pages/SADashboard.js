import React, { useEffect, useState, useCallback } from "react";
import SALayout from "../components/SALayout";
import API from "../../api/api";
import "../styles/sa-globals.css";
import "../styles/SA-Dashboard.css";

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

function StatCard({ label, value, icon, variant, prefix = "", delay = 0 }) {
  const animated = useCountUp(value);
  return (
    <div className={`sa-stat sa-stat--${variant}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="sa-stat__icon">{icon}</div>
      <div className="sa-stat__body">
        <p className="sa-stat__label">{label}</p>
        <p className="sa-stat__value">{prefix}{animated.toLocaleString()}</p>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 5 }) {
  return (
    <div className="sa-stats-grid">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="sa-skel" style={{ height: 90 }} />
      ))}
    </div>
  );
}

export default function SADashboard() {
  const [stats,        setStats]   = useState(null);
  const [recentParks,  setParks]   = useState([]);
  const [loading,      setLoading] = useState(true);
  const [error,        setError]   = useState(false);

  const load = useCallback(async () => {
    try {
      setError(false);
      const [statsRes, parksRes] = await Promise.all([
        API.get("/super/stats"),
        API.get("/super/parks"),
      ]);
      setStats(statsRes.data);
      setParks(parksRes.data.slice(0, 5));
    } catch (err) {
      console.error("SA Dashboard error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const todayLabel = new Date().toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const STATUS_PILL = {
    ACTIVE:    <span className="sa-pill sa-pill-active">Active</span>,
    SUSPENDED: <span className="sa-pill sa-pill-suspended">Suspended</span>,
    DELETED:   <span className="sa-pill sa-pill-deleted">Deleted</span>,
  };

  return (
    <SALayout>
      <div className="sa-dash-hero sa-animate-in">
        <div className="sa-dash-eyebrow">{todayLabel}</div>
        <h1 className="sa-dash-title">System Overview</h1>
        <p className="sa-dash-sub">Live snapshot across all parks. Auto-refreshes every 60s.</p>
      </div>

      {error && (
        <div className="sa-error-banner">
          ⚠️ Could not load data — check your backend.
          <button onClick={load}>Retry</button>
        </div>
      )}

      {loading ? <SkeletonGrid count={5} /> : stats && (
        <div className="sa-stats-grid">
          <StatCard label="Total Parks"      value={stats.totalParks}      icon="🏢" variant="purple" delay={0}   />
          <StatCard label="Active Parks"     value={stats.activeParks}     icon="✅" variant="green"  delay={60}  />
          <StatCard label="Suspended Parks"  value={stats.suspendedParks}  icon="⏸️" variant="amber"  delay={120} />
          <StatCard label="Total Bookings"   value={stats.totalBookings}   icon="🎟️" variant="blue"   delay={180} />
          <StatCard label="Total Revenue"    value={stats.totalRevenue}    icon="₦"  variant="teal"   delay={240} prefix="₦" />
        </div>
      )}

      <div className="sa-animate-in" style={{ animationDelay: "200ms" }}>
        <div className="sa-section-head">
          <div className="sa-section-title">Recent Parks</div>
          <a href="/sa/parks" className="sa-section-link">View all →</a>
        </div>

        <div className="sa-card" style={{ overflow: "hidden" }}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>Park Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Trips</th>
                <th>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {recentParks.length === 0 ? (
                <tr><td colSpan="5">
                  <div className="sa-empty">
                    <span className="sa-empty-icon">🏢</span>
                    No parks registered yet.
                  </div>
                </td></tr>
              ) : recentParks.map((park) => (
                <tr key={park.id}>
                  <td style={{ fontWeight: 600 }}>{park.name}</td>
                  <td style={{ color: "var(--sa-text-secondary)" }}>{park.location || "—"}</td>
                  <td>{STATUS_PILL[park.status] || STATUS_PILL.ACTIVE}</td>
                  <td style={{ fontFamily: "var(--sa-mono)" }}>{park._count?.trips ?? 0}</td>
                  <td style={{ fontFamily: "var(--sa-mono)" }}>{park._count?.bookings ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SALayout>
  );
}