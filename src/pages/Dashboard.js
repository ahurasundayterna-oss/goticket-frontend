import React, { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import "../styles/globals.css";
import "../styles/Dashboard.css";

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function fmtCurrency(n) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

function fmtChartDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-NG", {
    month: "short", day: "numeric", timeZone: "Africa/Lagos",
  });
}

function pctLabel(val) {
  if (val === null || val === undefined) return null;
  const sign = val >= 0 ? "▲" : "▼";
  return `${sign} ${Math.abs(val)}%`;
}

/* ══════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════ */
function StatCard({ label, value, icon, variant, prefix = "", delay = 0, change, isCurrency }) {
  const animated = useCountUp(value);
  const changeLabel = pctLabel(change);
  const changeUp    = change >= 0;

  return (
    <div className={`dash-stat dash-stat--${variant}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="dash-stat__icon">{icon}</div>
      <div className="dash-stat__body">
        <p className="dash-stat__label">{label}</p>
        <p className="dash-stat__value">
          {isCurrency ? fmtCurrency(animated) : `${prefix}${animated.toLocaleString()}`}
        </p>
        {changeLabel && (
          <p className={`dash-stat__change ${changeUp ? "up" : "down"}`}>
            {changeLabel}
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonStats({ count = 5 }) {
  return (
    <div className="dash-stats-grid">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skel" style={{ height: 90 }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DONUT CHART (payment + trip status)
══════════════════════════════════════════════ */
const DONUT_COLORS_PAYMENT  = ["#6366f1", "#1D9E75", "#a855f7", "#f59e0b"];
const DONUT_COLORS_TRIPS    = ["#1D9E75", "#f59e0b", "#6366f1", "#e24b4a"];

function DonutChart({ data, colors, label, total }) {
  return (
    <div className="dash-donut-wrap">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => [val.toLocaleString(), name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="dash-donut-center">
        <div className="dash-donut-total">{total?.toLocaleString()}</div>
        <div className="dash-donut-label">{label}</div>
      </div>
      <div className="dash-donut-legend">
        {data.map((d, i) => (
          <div key={i} className="dash-donut-legend-item">
            <span className="dash-donut-dot" style={{ background: colors[i % colors.length] }} />
            <span className="dash-donut-legend-name">{d.name}</span>
            <span className="dash-donut-legend-pct">
              {total ? Math.round((d.value / total) * 100) : 0}%
              {" "}({fmtCurrency(d.amount ?? d.value)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   AVATAR COLORS (recent bookings)
══════════════════════════════════════════════ */
const AVATAR_COLORS = [
  { bg: "#E1F5EE", fg: "#085041" },
  { bg: "#E6F1FB", fg: "#0f3d6e" },
  { bg: "#FAEEDA", fg: "#7a4f0e" },
  { bg: "#EEEDFE", fg: "#3C3489" },
  { bg: "#EAF3DE", fg: "#27500A" },
];

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
export default function Dashboard() {
  const [range,         setRange]         = useState("week");
  const [from,          setFrom]          = useState("");
  const [to,            setTo]            = useState("");
  const [stats,         setStats]         = useState(null);
  const [chartData,     setChartData]     = useState([]);
  const [paymentData,   setPaymentData]   = useState(null);
  const [tripStatus,    setTripStatus]    = useState(null);
  const [topRoutes,     setTopRoutes]     = useState([]);
  const [recentBookings,setRecent]        = useState([]);
  const [todayTrips,    setTodayTrips]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(false);

  // Build query string
  function buildParams(r = range, f = from, t = to) {
    const p = new URLSearchParams({ range: r });
    if (r === "custom" && f) p.set("from", f);
    if (r === "custom" && t) p.set("to",   t);
    return p.toString();
  }

  const loadAll = useCallback(async (r, f, t) => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    try {
      setError(false);
      const q = buildParams(r, f, t);

      const [dashRes, chartRes, payRes, routeRes, tripStatusRes, tripsRes, bookingsRes] =
        await Promise.all([
          API.get(`/dashboard?${q}`),
          API.get(`/dashboard/chart?${q}`),
          API.get(`/dashboard/payments?${q}`),
          API.get(`/dashboard/routes?${q}`),
          API.get(`/dashboard/trip-status?${q}`),
          API.get("/trips"),
          API.get("/bookings"),
        ]);

      const s = dashRes.data;
      setStats({
        bookings:       s.bookings       ?? 0,
        revenue:        s.revenue        ?? 0,
        trips:          s.trips          ?? 0,
        onlinePayments: s.onlinePayments ?? 0,
        offlinePayments:s.offlinePayments?? 0,
        seatsAvailable: s.seatsAvailable ?? 0,
        changes:        s.changes        ?? {},
      });

      setChartData(chartRes.data || []);

      const pd = payRes.data;
      setPaymentData([
        { name: "Online (Monnify)", value: pd.online,  amount: pd.online  },
        { name: "Offline (Cash)",   value: pd.offline, amount: pd.offline },
      ]);

      const ts = tripStatusRes.data;
      setTripStatus([
        { name: "Completed", value: ts.departed  || 0 },
        { name: "On-going",  value: ts.full      || 0 },
        { name: "Scheduled", value: ts.open      || 0 },
        { name: "Cancelled", value: ts.cancelled || 0 },
      ]);

      setTopRoutes(routeRes.data || []);

      // Today's trips for the trip feed
      const todayStr = new Date().toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" });
      setTodayTrips(
        (tripsRes.data || [])
          .filter(t => new Date(t.departureTime).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" }) === todayStr)
          .slice(0, 4)
      );

      setRecent((bookingsRes.data || []).slice(0, 5));

    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load with small delay (fresh login guard)
  useEffect(() => {
    const t = setTimeout(() => loadAll(range, from, to), 300);
    const interval = setInterval(() => loadAll(range, from, to), 30_000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  const applyFilter = () => {
    setLoading(true);
    loadAll(range, from, to);
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date().toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Africa/Lagos",
  });

  const totalPayments = paymentData ? paymentData.reduce((s, d) => s + d.value, 0) : 0;
  const totalTripStatus = tripStatus ? tripStatus.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <Layout>

      {/* ── Hero + filter bar ──────────────────────────────────────── */}
      <div className="dash-hero animate-in">
        <div>
          <div className="dash-eyebrow">{todayLabel}</div>
          <h1 className="dash-title">{greeting} 👋</h1>
          <p className="dash-sub">Live snapshot of your operations. Refreshes every 30s.</p>
        </div>

        {/* Filter controls */}
        <div className="dash-filter-bar">
          <label className="dash-filter-label">Date Range:</label>
          <select
            className="dash-filter-select"
            value={range}
            onChange={e => { setRange(e.target.value); setFrom(""); setTo(""); }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom</option>
          </select>

          {range === "custom" && (
            <>
              <span className="dash-filter-label">From</span>
              <input
                type="date"
                className="dash-filter-date"
                value={from}
                onChange={e => setFrom(e.target.value)}
              />
              <span className="dash-filter-label">To</span>
              <input
                type="date"
                className="dash-filter-date"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </>
          )}

          <button className="btn btn-primary dash-filter-btn" onClick={applyFilter}>
            Apply Filter
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="dash-error-banner">
          ⚠️ Could not load dashboard data.
          <button onClick={applyFilter}>Retry</button>
        </div>
      )}

      {/* ── Stat cards (5) ────────────────────────────────────────── */}
      {loading ? <SkeletonStats count={5} /> : stats && (
        <div className="dash-stats-grid dash-stats-grid--5">
          <StatCard label="Total Bookings"    value={stats.bookings}        icon="🎟️" variant="green" delay={0}   change={stats.changes.bookings} />
          <StatCard label="Active Trips"      value={stats.trips}           icon="🚌" variant="blue"  delay={60}  />
          <StatCard label="Revenue"           value={stats.revenue}         icon="₦"  variant="amber" delay={120} isCurrency change={stats.changes.revenue} />
          <StatCard label="Online Payments"   value={stats.onlinePayments}  icon="💳" variant="teal"  delay={180} />
          <StatCard label="Offline Payments"  value={stats.offlinePayments} icon="💵" variant="purple"delay={240} />
        </div>
      )}

      {/* ── Charts row ────────────────────────────────────────────── */}
      {!loading && chartData.length > 0 && (
        <div className="dash-charts-row">

          {/* Line chart — full width left */}
          <div className="dash-chart-card">
            <div className="section-head">
              <div className="section-title">Bookings &amp; Revenue Over Time</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtChartDate}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis yAxisId="left"  tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₦${(v/1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val, name) =>
                    name === "revenue" ? [fmtCurrency(val), "Revenue"] : [val, "Bookings"]
                  }
                  labelFormatter={fmtChartDate}
                />
                <Legend />
                <Line yAxisId="left"  type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
                <Line yAxisId="right" type="monotone" dataKey="revenue"  stroke="#1D9E75" strokeWidth={2} dot={{ r: 3 }} name="Revenue (₦)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment donut */}
          {paymentData && (
            <div className="dash-chart-card dash-chart-card--sm">
              <div className="section-head">
                <div className="section-title">Bookings by Payment Method</div>
              </div>
              <DonutChart
                data={paymentData}
                colors={DONUT_COLORS_PAYMENT}
                label="Total Revenue"
                total={totalPayments}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Bottom grid ───────────────────────────────────────────── */}
      <div className="dash-bottom-grid">

        {/* Top routes */}
        {topRoutes.length > 0 && (
          <div>
            <div className="section-head">
              <div className="section-title">Bookings by Route (Top 5)</div>
            </div>
            <div className="card">
              {topRoutes.map((r, i) => {
                const max = topRoutes[0].count;
                const pct = Math.round((r.count / max) * 100);
                return (
                  <div key={i} className="dash-route-item">
                    <span className="dash-route-name">{r.route}</span>
                    <div className="dash-route-bar-wrap">
                      <div className="dash-route-bar">
                        <div className="dash-route-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dash-route-count">{r.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent bookings */}
        <div>
          <div className="section-head">
            <div className="section-title">Recent Bookings</div>
            <a href="/bookings" className="section-link">View all →</a>
          </div>
          <div className="card">
            {recentBookings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🎟️</span>
                No bookings yet
              </div>
            ) : recentBookings.map((b, i) => {
              const col      = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const initials = (b.passengerName || "??")
                .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const timeStr  = new Date(b.createdAt).toLocaleTimeString("en-NG", {
                hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
              });

              return (
                <div key={b.id} className="dash-booking-item">
                  <div className="dash-booking-avatar" style={{ background: col.bg, color: col.fg }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dash-booking-name">{b.passengerName}</div>
                    <div className="dash-booking-route">
                      {b.trip?.departureCity} → {b.trip?.destination}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtCurrency(b.trip?.price)}</div>
                    <div className="dash-booking-time">{timeStr}</div>
                    <span className={`pill ${b.paymentStatus === "PAID" ? "pill-green" : "pill-amber"}`} style={{ fontSize: 10 }}>
                      {b.paymentStatus === "PAID" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trip status donut */}
        {tripStatus && (
          <div>
            <div className="section-head">
              <div className="section-title">Trip Status</div>
            </div>
            <div className="card">
              <DonutChart
                data={tripStatus.filter(d => d.value > 0)}
                colors={DONUT_COLORS_TRIPS}
                label="Total Trips"
                total={totalTripStatus}
              />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}