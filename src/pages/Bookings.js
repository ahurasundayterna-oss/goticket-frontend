import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "../styles/Trips.css";
import "../styles/Bookings.css";

// ── Date formatting helpers ─────────────────────────────────────
function formatManualDate() {
  return new Date().toLocaleDateString("en-NG", {
    weekday: "short", day: "numeric", month: "short",
    timeZone: "Africa/Lagos",
  });
}
function formatTripDateTime(departureTime) {
  if (!departureTime) return "—";
  const d    = new Date(departureTime);
  const date = d.toLocaleDateString("en-NG",  { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
  const time = d.toLocaleTimeString("en-NG",  { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos" });
  return `${date}, ${time}`;
}
function formatCreatedAt(createdAt) {
  if (!createdAt) return "—";
  return new Date(createdAt).toLocaleTimeString("en-NG", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos",
  });
}
function formatGroupHeader(departureTime) {
  if (!departureTime) return "—";
  return new Date(departureTime).toLocaleString("en-NG", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
  });
}
function formatPageDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos",
  });
}

/* ══════════════════════════════════════════════
   CONFIRM PAYMENT MODAL
   Shows when staff clicks "Mark as Paid".
   Lets them select payment method before confirming.
══════════════════════════════════════════════ */
function ConfirmPaymentModal({ booking, onClose, onConfirmed }) {
  const [method,  setMethod]  = useState("CASH");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      await API.patch(`/bookings/${booking.id}/confirm-payment`, {
        paymentMethod: method,
      });
      onConfirmed();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error confirming payment");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <div className="modal-title">Confirm Payment</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div style={{ padding: "8px 0 16px" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            Marking <strong>{booking.passengerName}</strong>'s booking as paid.<br />
            Ref: <span style={{ fontFamily: "var(--mono)" }}>{booking.reference}</span>
          </p>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Payment Method</label>
            <select
              className="form-control"
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value="CASH">Cash (paid at terminal)</option>
              <option value="TRANSFER">Bank Transfer</option>
              {/* ONLINE is set automatically by Paystack webhook — not selectable manually */}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
            {saving ? "Confirming..." : "✓ Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN BOOKINGS PAGE
══════════════════════════════════════════════ */
export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [trips,    setTrips]    = useState([]);
  const [search,   setSearch]   = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [tripId,   setTripId]   = useState("");
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [seat,     setSeat]     = useState("");
  const [nokName,  setNokName]  = useState("");
  const [nokPhone, setNokPhone] = useState("");

  // ── Payment confirmation modal state ─────────────────────────
  const [confirmingBooking, setConfirmingBooking] = useState(null);

  const selectedTrip = trips.find(t => t.id === tripId) || null;

  const fetchBookings = async () => {
    try {
      const res = await API.get(`/bookings?date=${selectedDate}`);
      setBookings(res.data);
    } catch { console.log("Failed to fetch bookings"); }
  };

  const fetchTrips = async () => {
    try {
      const res = await API.get("/trips");
      setTrips(res.data);
    } catch { console.log("Failed to fetch trips"); }
  };

  useEffect(() => { fetchBookings(); fetchTrips(); }, [selectedDate]);

  const createManualBooking = async () => {
    if (!nokName.trim())  { alert("Next of kin name is required");  return; }
    if (!nokPhone.trim()) { alert("Next of kin phone is required"); return; }
    try {
      await API.post("/bookings/manual", {
        tripId, passengerName: name, passengerPhone: phone,
        seatNumber: Number(seat), nextOfKinName: nokName, nextOfKinPhone: nokPhone,
      });
      setName(""); setPhone(""); setSeat(""); setNokName(""); setNokPhone("");
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message || "Error creating booking"); }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Remove this booking?")) return;
    try { await API.delete(`/bookings/${id}`); fetchBookings(); }
    catch { alert("Failed to remove booking"); }
  };

  // GROUP BY ROUTE + TIME
  const groupedBookings = bookings
    .filter(b => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        b.passengerName?.toLowerCase().includes(q) ||
        b.reference?.toLowerCase().includes(q) ||
        b.trip?.departureCity?.toLowerCase().includes(q) ||
        b.trip?.destination?.toLowerCase().includes(q)
      );
    })
    .reduce((acc, booking) => {
      const key = booking.trip.departureCity + "-" + booking.trip.destination + "-" + booking.trip.departureTime;
      if (!acc[key]) acc[key] = [];
      acc[key].push(booking);
      return acc;
    }, {});

  const AVATAR_COLORS = [
    { bg:"#E1F5EE", fg:"#085041" },{ bg:"#E6F1FB", fg:"#0f3d6e" },
    { bg:"#FAEEDA", fg:"#7a4f0e" },{ bg:"#EEEDFE", fg:"#3C3489" },
    { bg:"#EAF3DE", fg:"#27500A" },
  ];

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-sub">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} on{" "}
            {formatPageDate(selectedDate + "T00:00:00")}
          </p>
        </div>
      </div>

      {/* Manual booking */}
      <div className="manual-card animate-in">
        <div className="manual-card-title">Manual Booking</div>
        <div className="manual-form-grid">
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Trip</label>
            <select className="form-control" value={tripId} onChange={e => setTripId(e.target.value)}>
              <option value="">Select trip</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  {t.departureCity} → {t.destination} — ₦{t.price?.toLocaleString()}
                </option>
              ))}
            </select>
            {selectedTrip && (
              <div className="trip-type-strip">
                {selectedTrip.tripType === "SCHEDULED" ? (
                  <>
                    <span className="pill pill-blue trip-type-pill">Scheduled</span>
                    <span className="trip-type-detail">
                      Departs {new Date(selectedTrip.departureTime).toLocaleString("en-NG", {
                        weekday:"short", day:"numeric", month:"short",
                        hour:"2-digit", minute:"2-digit", timeZone:"Africa/Lagos",
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="pill pill-green trip-type-pill">Flexible</span>
                    <span className="trip-type-detail">Departs when full</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Passenger Name</label>
            <input className="form-control" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Phone</label>
            <input className="form-control" placeholder="080..." value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Seat No.</label>
            <input className="form-control" placeholder="e.g. 7" value={seat} onChange={e => setSeat(e.target.value)} />
          </div>
        </div>
        <div className="manual-form-grid manual-form-grid--nok">
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Next of Kin Name <span className="field-required">*</span></label>
            <input className="form-control" placeholder="Full name" value={nokName} onChange={e => setNokName(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Next of Kin Phone <span className="field-required">*</span></label>
            <input className="form-control" placeholder="080..." value={nokPhone} onChange={e => setNokPhone(e.target.value)} />
          </div>
          <div style={{ display:"flex", alignItems:"flex-end" }}>
            <button className="btn btn-primary" style={{ height:40 }} onClick={createManualBooking}>+ Book</button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bookings-filter-bar">
        <div style={{ position:"relative", flex:1 }}>
          <span className="search-icon">⌕</span>
          <input
            className="form-control search-input"
            type="text"
            placeholder="Search by name, reference or route..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:500 }}>Date</span>
          <input
            type="date" className="form-control" style={{ width:"auto" }}
            value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Grouped bookings table */}
      <table className="gtable animate-in">
        <thead>
          <tr>
            <th>#</th>
            <th>Passenger</th>
            <th>Phone</th>
            <th>Route</th>
            <th>Seat</th>
            <th>Created At</th>
            <th>Departure</th>
            <th>Next of Kin</th>
            <th>NOK Phone</th>
            <th>Payment</th>   {/* ← shows status + method */}
            <th>Source</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedBookings).length === 0 ? (
            <tr><td colSpan="12">
              <div className="empty-state">
                <span className="empty-state-icon">🎟️</span>
                No bookings found for this date.
              </div>
            </td></tr>
          ) : Object.entries(groupedBookings).map(([group, items]) => (
            <React.Fragment key={group}>
              <tr className="booking-group-row">
                <td colSpan="12">
                  <span className="booking-group-route">
                    {items[0].trip.departureCity} → {items[0].trip.destination}
                  </span>
                  {" · "}
                  {formatGroupHeader(items[0].trip.departureTime)}
                  {" · "}
                  <strong>{items.length}</strong> passenger{items.length !== 1 ? "s" : ""}
                </td>
              </tr>
              {items.map((b, idx) => {
                const col      = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const initials = (b.passengerName || "??").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
                const isManual = b.bookingSource === "MANUAL";
                const departureDisplay = isManual
                  ? formatManualDate()
                  : formatTripDateTime(b.trip?.departureTime);
                const isPaid = b.paymentStatus === "PAID";

                return (
                  <tr key={b.id}>
                    <td style={{ color:"var(--text-tertiary)", fontFamily:"var(--mono)" }}>{idx + 1}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:col.bg, color:col.fg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>
                          {initials}
                        </div>
                        <span style={{ fontWeight:600 }}>{b.passengerName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:12 }}>{b.passengerPhone}</td>
                    <td>
                      <div className="route-tag" style={{ fontSize:12 }}>
                        {b.trip.departureCity}<span className="route-arrow">→</span>{b.trip.destination}
                      </div>
                    </td>
                    <td><span className="pill pill-blue">Seat {b.seatNumber}</span></td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)", fontFamily:"var(--mono)" }}>
                      {formatCreatedAt(b.createdAt)}
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)", fontFamily:"var(--mono)" }}>
                      {departureDisplay}
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{b.nextOfKinName ?? "—"}</td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)", fontFamily:"var(--mono)" }}>{b.nextOfKinPhone ?? "—"}</td>

                    {/* ── Payment status cell ───────────────────────── */}
                    <td>
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        <span className={`pill ${isPaid ? "pill-green" : "pill-amber"}`}>
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                        {b.paymentMethod && (
                          <span style={{ fontSize:10, color:"var(--text-tertiary)", fontFamily:"var(--mono)" }}>
                            {b.paymentMethod.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`pill ${b.bookingSource === "WHATSAPP" ? "pill-green" : "pill-gray"}`}>
                        {b.bookingSource === "WHATSAPP" ? "WhatsApp" : "Manual"}
                      </span>
                    </td>

                    {/* ── Actions ──────────────────────────────────── */}
                    <td>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {/* ── MARK AS PAID button ──────────────────────
                            Only visible when payment is still pending.
                            ── FUTURE PAYSTACK:
                            When Paystack is integrated, WhatsApp bookings
                            with paymentMethod="ONLINE" will be auto-confirmed
                            via webhook. This button will then only show for
                            CASH/TRANSFER bookings (you can add a condition:
                            b.bookingSource !== "WHATSAPP" || b.paymentMethod !== "ONLINE")
                        ─────────────────────────────────────────────── */}
                        {!isPaid && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ fontSize:11, whiteSpace:"nowrap" }}
                            onClick={() => setConfirmingBooking(b)}
                          >
                            ✓ Mark Paid
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => deleteBooking(b.id)}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* ── Payment confirmation modal ─────────────────────────── */}
      {confirmingBooking && (
        <ConfirmPaymentModal
          booking={confirmingBooking}
          onClose={() => setConfirmingBooking(null)}
          onConfirmed={fetchBookings}
        />
      )}
    </Layout>
  );
}