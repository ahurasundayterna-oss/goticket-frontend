import React, { useEffect, useState, useCallback } from "react";
import SALayout from "../components/SALayout";
import API from "../../api/api";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import "../styles/sa-globals.css";
import "../styles/SA-Dashboard.css";

/* ── Helpers ─────────────────────────────────────────────────── */
function fmtCurrency(n) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}
function fmtChartDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-NG", {
    month: "short", day: "numeric", timeZone: "Africa/Lagos",
  });
}
function pctLabel(val) {
  if (val === null || val === undefined) return null;
  return `${val >= 0 ? "▲" : "▼"} ${Math.abs(val)}%`;
}

/* ── Animated counter ────────────────────────────────────────── */
function useCountUp(target, duration = 900) {
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

/* ── Stat card ───────────────────────────────────────────────── */
function StatCard({ label, value, icon, variant, isCurrency, change, delay = 0 }) {
  const animated = useCountUp(value);
  const chgLabel = pctLabel(change);
  return (
    <div className={`sa-stat sa-stat--${variant}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="sa-stat__icon">{icon}</div>
      <div className="sa-stat__body">
        <p className="sa-stat__label">{label}</p>
        <p className="sa-stat__value">
          {isCurrency ? fmtCurrency(animated) : animated.toLocaleString()}
        </p>
        {chgLabel && (
          <p className={`sa-stat__change ${change >= 0 ? "up" : "down"}`}>{chgLabel}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 7 }) {
  return (
    <div className="sa-stats-grid sa-stats-grid--7">
      {[...Array(count)].map((_, i) => <div key={i} className="sa-skel" style={{ height: 90 }} />)}
    </div>
  );
}

/* ── Donut chart ─────────────────────────────────────────────── */
const PAYMENT_COLORS = ["#6366f1", "#1D9E75"];
const TRIP_COLORS    = ["#1D9E75", "#f59e0b", "#6366f1", "#e24b4a"];

function DonutChart({ data, colors, centerLabel, total }) {
  const filtered = (data || []).filter(d => d.value > 0);
  if (!filtered.length) {
    return <p style={{ textAlign: "center", color: "var(--sa-text-tertiary)", fontSize: 13, padding: "20px 0" }}>No data</p>;
  }
  return (
    <div className="sa-donut-wrap">
      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie data={filtered} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value">
            {filtered.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="sa-donut-center">
        <div className="sa-donut-total">{total?.toLocaleString()}</div>
        <div className="sa-donut-sublabel">{centerLabel}</div>
      </div>
      <div className="sa-donut-legend">
        {filtered.map((d, i) => (
          <div key={i} className="sa-donut-legend-item">
            <span className="sa-donut-dot" style={{ background: colors[i % colors.length] }} />
            <span className="sa-donut-name">{d.name}</span>
            <span className="sa-donut-pct">
              {total ? Math.round((d.value / total) * 100) : 0}% ({d.value.toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Status pill ─────────────────────────────────────────────── */
const STATUS_PILL = {
  ACTIVE:    <span className="sa-pill sa-pill-active">Active</span>,
  SUSPENDED: <span className="sa-pill sa-pill-suspended">Suspended</span>,
  DELETED:   <span className="sa-pill sa-pill-deleted">Deleted</span>,
};

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
export default function SADashboard() {
  const [range,      setRange]      = useState("week");
  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");
  const [parkFilter, setParkFilter] = useState("");
  const [parks,      setParks]      = useState([]);

  const [stats,      setStats]      = useState(null);
  const [chartData,  setChartData]  = useState([]);
  const [payData,    setPayData]    = useState(null);
  const [tripStatus, setTripStatus] = useState(null);
  const [topParks,   setTopParks]   = useState([]);
  const [recentParks,setRecentParks]= useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  function buildQ(r = range, f = from, t = to, p = parkFilter) {
    const q = new URLSearchParams({ range: r });
    if (r === "custom" && f) q.set("from", f);
    if (r === "custom" && t) q.set("to",   t);
    if (p) q.set("parkId", p);
    return q.toString();
  }

  const load = useCallback(async (r, f, t, p) => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    try {
      setError(false);
      setLoading(true);
      const q = buildQ(r, f, t, p);

      const [statsRes, chartRes, payRes, tripStatusRes, topParksRes, parksRes] =
        await Promise.all([
          API.get(`/super/stats?${q}`),
          API.get(`/super/chart?${q}`),
          API.get(`/super/payments?${q}`),
          API.get(`/super/trip-status?${q}`),
          API.get(`/super/top-parks?${q}`),
          API.get("/super/parks"),
        ]);

      setStats(statsRes.data);
      setChartData(chartRes.data || []);

      const pd = payRes.data;
      setPayData([
        { name: "Online (Monnify)", value: pd.online  || 0 },
        { name: "Offline (Cash)",   value: pd.offline || 0 },
      ]);

      const ts = tripStatusRes.data;
      setTripStatus([
        { name: "Departed",  value: ts.departed  || 0 },
        { name: "Full",      value: ts.full      || 0 },
        { name: "Open",      value: ts.open      || 0 },
        { name: "Cancelled", value: ts.cancelled || 0 },
      ]);

      setTopParks(topParksRes.data || []);
      setParks(parksRes.data || []);
      setRecentParks((parksRes.data || []).slice(0, 5));

    } catch (err) {
      console.error("SA Dashboard error:", err);
      if (err.response?.status === 401) console.warn("Unauthorized — token missing/expired");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(range, from, to, parkFilter), 300);
    const interval = setInterval(() => load(range, from, to, parkFilter), 60_000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  const applyFilter = () => {
    setLoading(true);
    load(range, from, to, parkFilter);
  };

  const todayLabel = new Date().toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Africa/Lagos",
  });

  const totalPayments = payData    ? payData.reduce((s, d)    => s + d.value, 0) : 0;
  const totalTripStat = tripStatus ? tripStatus.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <SALayout>

      {/* ── Hero + filters ──────────────────────────────────── */}
      <div className="sa-dash-hero sa-animate-in">
        <div>
          <div className="sa-dash-eyebrow">{todayLabel}</div>
          <h1 className="sa-dash-title">System Overview</h1>
          <p className="sa-dash-sub">Live snapshot across all parks. Auto-refreshes every 60s.</p>
        </div>

        <div className="sa-filter-bar">
          <label className="sa-filter-label">Range:</label>
          <select className="sa-filter-select" value={range}
            onChange={e => { setRange(e.target.value); setFrom(""); setTo(""); }}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom</option>
          </select>

          {range === "custom" && (
            <>
              <span className="sa-filter-label">From</span>
              <input type="date" className="sa-filter-date" value={from} onChange={e => setFrom(e.target.value)} />
              <span className="sa-filter-label">To</span>
              <input type="date" className="sa-filter-date" value={to} onChange={e => setTo(e.target.value)} />
            </>
          )}

          <label className="sa-filter-label">Park:</label>
          <select className="sa-filter-select" value={parkFilter} onChange={e => setParkFilter(e.target.value)}>
            <option value="">All parks</option>
            {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <button className="sa-btn sa-btn-primary sa-filter-btn" onClick={applyFilter}>
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div className="sa-error-banner">
          ⚠️ Could not load data — check backend or login.
          <button onClick={applyFilter}>Retry</button>
        </div>
      )}

      {/* ── Stat cards (7) ──────────────────────────────────── */}
      {loading ? <SkeletonGrid count={7} /> : stats && (
        <div className="sa-stats-grid sa-stats-grid--7">
          <StatCard label="Total Parks"      value={stats.totalParks}      icon="🏢" variant="purple" delay={0}   />
          <StatCard label="Active Parks"     value={stats.activeParks}     icon="✅" variant="green"  delay={40}  />
          <StatCard label="Suspended Parks"  value={stats.suspendedParks}  icon="⏸️" variant="amber"  delay={80}  />
          <StatCard label="Total Bookings"   value={stats.totalBookings}   icon="🎟️" variant="blue"   delay={120} change={stats.changes?.bookings} />
          <StatCard label="Total Revenue"    value={stats.totalRevenue}    icon="₦"  variant="teal"   delay={160} isCurrency change={stats.changes?.revenue} />
          <StatCard label="Online Payments"  value={stats.onlinePayments}  icon="💳" variant="indigo" delay={200} />
          <StatCard label="Offline Payments" value={stats.offlinePayments} icon="💵" variant="gray"   delay={240} />
        </div>
      )}

      {/* ── Charts row ──────────────────────────────────────── */}
      {!loading && chartData.length > 0 && (
        <div className="sa-charts-row">
          <div className="sa-chart-card">
            <div className="sa-section-head">
              <div className="sa-section-title">Bookings &amp; Revenue Over Time</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" tickFormatter={fmtChartDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right"
                  tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(val, name) =>
                    name === "Revenue (₦)" ? [fmtCurrency(val), "Revenue"] : [val, "Bookings"]
                  }
                  labelFormatter={fmtChartDate}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line yAxisId="left"  type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
                <Line yAxisId="right" type="monotone" dataKey="revenue"  stroke="#1D9E75" strokeWidth={2} dot={{ r: 3 }} name="Revenue (₦)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {payData && (
            <div className="sa-chart-card sa-chart-card--sm">
              <div className="sa-section-head">
                <div className="sa-section-title">Payment Method</div>
              </div>
              <DonutChart data={payData} colors={PAYMENT_COLORS} centerLabel="Payments" total={totalPayments} />
            </div>
          )}
        </div>
      )}

      {/* ── Bottom grid ─────────────────────────────────────── */}
      <div className="sa-bottom-grid">

        {topParks.length > 0 && (
          <div>
            <div className="sa-section-head">
              <div className="sa-section-title">Top Parks by Bookings</div>
            </div>
            <div className="sa-card">
              {topParks.map((p, i) => {
                const pct = Math.round((p.count / topParks[0].count) * 100);
                return (
                  <div key={i} className="sa-route-item">
                    <span className="sa-route-name">{p.name}</span>
                    <div className="sa-route-bar-wrap">
                      <div className="sa-route-bar">
                        <div className="sa-route-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="sa-route-count">{p.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tripStatus && (
          <div>
            <div className="sa-section-head">
              <div className="sa-section-title">Trip Status</div>
            </div>
            <div className="sa-card">
              <DonutChart data={tripStatus} colors={TRIP_COLORS} centerLabel="Total Trips" total={totalTripStat} />
            </div>
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <div className="sa-section-head">
            <div className="sa-section-title">Recent Parks</div>
            <a href="/sa/parks" className="sa-section-link">View all →</a>
          </div>
          <div className="sa-card" style={{ overflow: "hidden" }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Park Name</th><th>Location</th><th>Status</th>
                  <th>Trips</th><th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {recentParks.length === 0 ? (
                  <tr><td colSpan="5">
                    <div className="sa-empty">
                      <span className="sa-empty-icon">🏢</span>No parks registered yet.
                    </div>
                  </td></tr>
                ) : recentParks.map(park => (
                  <tr key={park.id}>
                    <td style={{ fontWeight: 600 }}>{park.name}</td>
                    <td style={{ color: "var(--sa-text-secondary)" }}>{park.location || "—"}</td>
                    <td>{STATUS_PILL[park.status] || STATUS_PILL.ACTIVE}</td>
                    <td style={{ fontFamily: "var(--sa-mono)" }}>{park._count?.trips    ?? 0}</td>
                    <td style={{ fontFamily: "var(--sa-mono)" }}>{park._count?.bookings ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </SALayout>
  );
}