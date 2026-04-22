import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import "../styles/globals.css";
import "../styles/Dashboard.css";

// Animated counter
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
    <div className={`dash-stat dash-stat--${variant}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="dash-stat__icon">{icon}</div>
      <div className="dash-stat__body">
        <p className="dash-stat__label">{label}</p>
        <p className="dash-stat__value">{prefix}{animated.toLocaleString()}</p>
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="dash-stats-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skel" style={{ height: 90 }} />
      ))}
    </div>
  );
}

const AVATAR_COLORS = [
  { bg: "#E1F5EE", fg: "#085041" },
  { bg: "#E6F1FB", fg: "#0f3d6e" },
  { bg: "#FAEEDA", fg: "#7a4f0e" },
  { bg: "#EEEDFE", fg: "#3C3489" },
  { bg: "#EAF3DE", fg: "#27500A" },
];

export default function Dashboard() {
  const [stats,          setStats]      = useState(null);
  const [recentBookings, setRecent]     = useState([]);
  const [todayTrips,     setTodayTrips] = useState([]);
  const [loading,        setLoading]    = useState(true);
  const [error,          setError]      = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setError(false);

      // ── 1. STAT CARDS ────────────────────────────────────────────
      // Comes entirely from the /dashboard endpoint.
      // The backend calculates everything using createdAt (bookings today)
      // and departureTime (trips today) — no frontend recalculation needed.
      const dashRes = await API.get("/dashboard");
      const s = dashRes.data;

      setStats({
        todayBookings:  s.todayBookings  ?? 0,
        activeTrips:    s.activeTrips    ?? 0,
        revenueToday:   s.revenueToday   ?? 0,
        seatsAvailable: s.seatsAvailable ?? 0,
      });

      // ── 2. TODAY'S TRIPS FEED ────────────────────────────────────
      // GET /trips returns all trips with bookings[] included,
      // which we need for the seat bar. Filter to today's departures.
      const tripsRes = await API.get("/trips");
      const todayStr = new Date().toDateString();
      const active   = tripsRes.data.filter(t =>
        new Date(t.departureTime).toDateString() === todayStr
      );
      setTodayTrips(active.slice(0, 4));

      // ── 3. RECENT BOOKINGS FEED ──────────────────────────────────
      // GET /bookings with NO date filter returns ALL bookings for this
      // branch ordered by createdAt desc. We take the top 5.
      // (The date filter on /bookings filters by departure date, not
      //  created date — so we omit it here to get the true recent list.)
      const bookingsRes = await API.get("/bookings");
      setRecent(bookingsRes.data.slice(0, 5));

    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30_000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [loadAll]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date().toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Layout>
      {/* Hero */}
      <div className="dash-hero animate-in">
        <div className="dash-eyebrow">{todayLabel}</div>
        <h1 className="dash-title">{greeting} 👋</h1>
        <p className="dash-sub">Live snapshot of your operations. Refreshes every 30s.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="dash-error-banner">
          ⚠️ Could not load dashboard data — check your backend connection.
          <button onClick={loadAll}>Retry</button>
        </div>
      )}

      {/* Stat cards — driven by /dashboard response only */}
      {loading ? <SkeletonStats /> : stats && (
        <div className="dash-stats-grid">
          <StatCard label="Today's Bookings" value={stats.todayBookings}  icon="🎟️" variant="green" delay={0}   />
          <StatCard label="Active Trips"     value={stats.activeTrips}    icon="🚌" variant="blue"  delay={60}  />
          <StatCard label="Revenue Today"    value={stats.revenueToday}   icon="₦"  variant="amber" delay={120} prefix="₦" />
          <StatCard label="Seats Available"  value={stats.seatsAvailable} icon="💺" variant="teal"  delay={180} />
        </div>
      )}

      {/* Bottom grid */}
      <div className="dash-bottom-grid">

        {/* Today's trips */}
        <div>
          <div className="section-head">
            <div className="section-title">Today's Trips</div>
            <a href="/trips" className="section-link">View all →</a>
          </div>
          <div className="card">
            {todayTrips.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🚌</span>
                No trips scheduled for today
              </div>
            ) : todayTrips.map((trip) => {
              const booked  = trip.bookings?.length || 0;
              const pct     = Math.round((booked / trip.totalSeats) * 100);
              const isFull  = booked >= trip.totalSeats;
              const barCls  = isFull ? "full-fill" : pct >= 75 ? "warn" : "";
              const timeStr = new Date(trip.departureTime).toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit",
              });

              return (
                <div key={trip.id} className="dash-trip-item">
                  <div style={{ flex: 1 }}>
                    <div className="route-tag">
                      <strong>{trip.departureCity}</strong>
                      <span className="route-arrow">→</span>
                      <strong>{trip.destination}</strong>
                    </div>
                    <div className="dash-trip-meta">
                      {timeStr} · ₦{trip.price?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`pill ${isFull ? "pill-red" : pct >= 75 ? "pill-amber" : "pill-green"}`}>
                      {isFull ? "Full" : pct >= 75 ? "Almost full" : "Open"}
                    </span>
                    <div className="seat-bar-wrap" style={{ marginTop: 6, justifyContent: "flex-end" }}>
                      <div className="seat-bar" style={{ minWidth: 50 }}>
                        <div className={`seat-bar-fill ${barCls}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="seat-count">{booked}/{trip.totalSeats}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
              const timeStr  = new Date(b.createdAt).toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit",
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
                    <span className="ref-code">{b.reference}</span>
                    <div className="dash-booking-time">{timeStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Layout>
  );
}
