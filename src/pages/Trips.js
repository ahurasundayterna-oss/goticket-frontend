import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import "../styles/globals.css";
import "../styles/Trips.css";
import "../styles/TripsNew.css";

function getRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch { return null; }
}

function TripCard({ trip, onDepart, onCancel, role }) {
  const isAdmin  = role === "BRANCH_ADMIN";
  const booked   = trip.seatsBooked ?? 0;
  const pct      = Math.round((booked / trip.totalSeats) * 100);
  const barColor = pct >= 100 ? "#A32D2D" : pct >= 75 ? "#BA7517" : "#1D9E75";

  const STATUS_CONFIG = {
    OPEN:      { label:"Open",      cls:"pill-green" },
    FULL:      { label:"Full",      cls:"pill-amber" },
    DEPARTED:  { label:"Departed",  cls:"pill-blue"  },
    CANCELLED: { label:"Cancelled", cls:"pill-red"   },
  };
  const sc = STATUS_CONFIG[trip.status] || STATUS_CONFIG.OPEN;

  return (
    <div className={`trip-card trip-card--${trip.tripType.toLowerCase()} ${trip.status !== "OPEN" ? "trip-card--inactive" : ""}`}>
      <div className="trip-card-badges">
        <span className={`pill ${trip.tripType === "FLEXIBLE" ? "pill-purple" : "pill-blue"}`}>
          {trip.tripType === "FLEXIBLE" ? "⚡ Flexible" : "🕐 Scheduled"}
        </span>
        <span className={`pill ${sc.cls}`}>{sc.label}</span>
        {trip.nearDeparture && <span className="pill pill-amber">🔔 Ready to depart</span>}
      </div>

      <div className="trip-card-route">
        <span className="trip-city">{trip.departureCity}</span>
        <span className="trip-arrow">→</span>
        <span className="trip-city">{trip.destination}</span>
      </div>

      {trip.tripType === "SCHEDULED" && trip.departureTime && (
        <div className="trip-card-time">
          📅 {new Date(trip.departureTime).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}{" "}
          <span style={{ fontFamily:"var(--mono)" }}>
            {new Date(trip.departureTime).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
          </span>
        </div>
      )}

      <div className="trip-card-fill">
        <div className="trip-fill-bar">
          <div className="trip-fill-bar-inner" style={{ width:`${pct}%`, background:barColor }} />
        </div>
        <div className="trip-fill-stats">
          <span style={{ fontFamily:"var(--mono)", fontWeight:600, color:barColor }}>
            {booked}/{trip.totalSeats}
          </span>
          <span style={{ color:"var(--text-tertiary)", fontSize:11 }}>seats filled</span>
          {(trip.seatsLocked ?? 0) > 0 && (
            <span className="trip-locked-badge">🔒 {trip.seatsLocked} locked</span>
          )}
        </div>
      </div>

      <div className="trip-card-price">₦{trip.price?.toLocaleString()}</div>

      {trip.tripType === "FLEXIBLE" && trip.fillThreshold && trip.fillThreshold < trip.totalSeats && (
        <div className="trip-threshold-note">
          Departs when {trip.fillThreshold}/{trip.totalSeats} seats filled
        </div>
      )}

      {isAdmin && trip.status === "OPEN" && (
        <div className="trip-card-actions">
          <button className="btn btn-sm btn-primary" onClick={() => onDepart(trip)}>
            Force Depart
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => onCancel(trip)}>
            Cancel Trip
          </button>
        </div>
      )}
    </div>
  );
}

function CreateTripModal({ routes, onClose, onCreated }) {
  const [form, setForm] = useState({
    routeId:"", tripType:"SCHEDULED",
    departureDate:"", departureTime:"",
    price:"", totalSeats:"18", fillThreshold:"",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isScheduled = form.tripType === "SCHEDULED";

  const submit = async () => {
    if (!form.routeId)    return setError("Please select a route.");
    if (!form.totalSeats) return setError("Total seats is required.");
    if (isScheduled && !form.departureDate) return setError("Departure date is required for scheduled trips.");
    if (isScheduled && !form.departureTime) return setError("Departure time is required for scheduled trips.");

    setSaving(true);
    setError("");
    try {
      await API.post("/trips", {
        routeId:       form.routeId,
        tripType:      form.tripType,
        departureDate: isScheduled ? form.departureDate : undefined,
        departureTime: isScheduled ? form.departureTime : undefined,
        price:         form.price || undefined,
        totalSeats:    parseInt(form.totalSeats),
        fillThreshold: form.fillThreshold ? parseInt(form.fillThreshold) : undefined,
      });
      await onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create trip.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">Create Trip</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="form-error">{error}</div>}

        {/* Route */}
        <div className="form-group">
          <label className="form-label">Route *</label>
          <select className="form-control" name="routeId" value={form.routeId} onChange={handle}>
            <option value="">Select route...</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>
            ))}
          </select>
        </div>

        {/* Trip Type — radio buttons */}
        <div className="form-group">
          <label className="form-label">Trip Type *</label>
          <div className="trip-type-radios">
            <label className={`trip-radio-label ${isScheduled ? "trip-radio-label--active" : ""}`}>
              <input
                type="radio"
                name="tripType"
                value="SCHEDULED"
                checked={isScheduled}
                onChange={handle}
                className="trip-radio-input"
              />
              <span className="trip-radio-dot" />
              <span className="trip-radio-text">
                <strong>Scheduled</strong>
                <span className="trip-radio-hint">Fixed departure date and time</span>
              </span>
            </label>

            <label className={`trip-radio-label ${!isScheduled ? "trip-radio-label--active" : ""}`}>
              <input
                type="radio"
                name="tripType"
                value="FLEXIBLE"
                checked={!isScheduled}
                onChange={handle}
                className="trip-radio-input"
              />
              <span className="trip-radio-dot" />
              <span className="trip-radio-text">
                <strong>Flexible</strong>
                <span className="trip-radio-hint">Departs when seats reach threshold</span>
              </span>
            </label>
          </div>
        </div>

        {/* Date + Time — only shown for Scheduled */}
        {isScheduled && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Departure Date *</label>
              <input
                className="form-control"
                type="date"
                name="departureDate"
                value={form.departureDate}
                onChange={handle}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Departure Time *</label>
              <input
                className="form-control"
                type="time"
                name="departureTime"
                value={form.departureTime}
                onChange={handle}
              />
            </div>
          </div>
        )}

        {/* Price + Seats */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₦)</label>
            <input
              className="form-control"
              name="price"
              type="number"
              placeholder="Uses route default"
              value={form.price}
              onChange={handle}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Total Seats *</label>
            <input
              className="form-control"
              name="totalSeats"
              type="number"
              value={form.totalSeats}
              onChange={handle}
            />
          </div>
        </div>

        {/* Fill threshold — only shown for Flexible */}
        {!isScheduled && (
          <div className="form-group">
            <label className="form-label">Fill Threshold (optional)</label>
            <input
              className="form-control"
              name="fillThreshold"
              type="number"
              placeholder={`Default: all ${form.totalSeats || "?"} seats`}
              value={form.fillThreshold}
              onChange={handle}
            />
            <p className="trip-radio-hint" style={{ marginTop:4 }}>
              Bus departs automatically when this many seats are booked.
            </p>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Trips() {
  const [trips,      setTrips]      = useState([]);
  const [routes,     setRoutes]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const role    = getRole();
  const isAdmin = role === "BRANCH_ADMIN";

  const fetchAll = useCallback(async () => {
    try {
      const [tripsRes, routesRes] = await Promise.all([
        API.get("/trips"),
        API.get("/routes"),
      ]);
      setTrips(tripsRes.data);
      setRoutes(routesRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const forceDepart = async (trip) => {
    if (!window.confirm(`Force depart ${trip.departureCity} → ${trip.destination}?`)) return;
    try { await API.patch(`/trips/${trip.id}/depart`); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Failed to depart."); }
  };

  const cancelTrip = async (trip) => {
    if (!window.confirm("Cancel this trip?")) return;
    try { await API.patch(`/trips/${trip.id}/cancel`); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Failed to cancel."); }
  };

  const filtered  = typeFilter === "ALL" ? trips : trips.filter(t => t.tripType === typeFilter);
  const flexible  = filtered.filter(t => t.tripType === "FLEXIBLE");
  const scheduled = filtered.filter(t => t.tripType === "SCHEDULED");

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Trips</h1>
          <p className="page-sub">
            {isAdmin ? "All branch trips" : "Your assigned routes"} — refreshes every 15s
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Create Trip
        </button>
      </div>

      <div className="tabs">
        {[["ALL","All trips"],["FLEXIBLE","⚡ Flexible"],["SCHEDULED","🕐 Scheduled"]].map(([val,label]) => (
          <button key={val} className={`tab ${typeFilter === val ? "active" : ""}`}
            onClick={() => setTypeFilter(val)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="trips-skeleton">
          {[...Array(4)].map((_,i) => <div key={i} className="skel" style={{ height:180 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">🚌</span>
            No trips found. Create one to get started.
          </div>
        </div>
      ) : (
        <>
          {(typeFilter === "ALL" || typeFilter === "FLEXIBLE") && flexible.length > 0 && (
            <div className="trips-section">
              {typeFilter === "ALL" && <div className="trips-section-label">⚡ Flexible Trips</div>}
              <div className="trips-grid">
                {flexible.map(t => <TripCard key={t.id} trip={t} role={role} onDepart={forceDepart} onCancel={cancelTrip} />)}
              </div>
            </div>
          )}
          {(typeFilter === "ALL" || typeFilter === "SCHEDULED") && scheduled.length > 0 && (
            <div className="trips-section">
              {typeFilter === "ALL" && <div className="trips-section-label">🕐 Scheduled Trips</div>}
              <div className="trips-grid">
                {scheduled.map(t => <TripCard key={t.id} trip={t} role={role} onDepart={forceDepart} onCancel={cancelTrip} />)}
              </div>
            </div>
          )}
        </>
      )}

      {showCreate && routes.length === 0 && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" style={{ maxWidth:360, textAlign:"center" }}>
            <span style={{ fontSize:36, display:"block", marginBottom:12 }}>🗺️</span>
            <div className="modal-title" style={{ justifyContent:"center", marginBottom:8 }}>No Routes Available</div>
            <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:20 }}>
              {isAdmin ? "Create at least one route before scheduling trips." : "Ask your branch admin to assign you a route."}
            </p>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Close</button>
          </div>
        </div>
      )}

      {showCreate && routes.length > 0 && (
        <CreateTripModal routes={routes} onClose={() => setShowCreate(false)} onCreated={fetchAll} />
      )}
    </Layout>
  );
}
