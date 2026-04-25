import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import "../styles/globals.css";
import "../styles/StaffManagement.css";

const AVATAR_COLORS = [
  { bg:"#E1F5EE", fg:"#085041" }, { bg:"#E6F1FB", fg:"#0f3d6e" },
  { bg:"#FAEEDA", fg:"#7a4f0e" }, { bg:"#EEEDFE", fg:"#3C3489" },
  { bg:"#EAF3DE", fg:"#27500A" },
];

// ── Create Staff Modal ──────────────────────────────────────────
function CreateStaffModal({ onClose, onCreated }) {
  const [form,   setForm]   = useState({ name:"", email:"", password:"" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.password)
      return setError("All fields are required.");
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");

    setSaving(true);
    setError("");
    try {
      await API.post("/staff", form);
      // ✅ Await the refresh BEFORE closing so the list is ready when modal unmounts
      await onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">Add Staff Member</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-control" name="name"
            placeholder="e.g. Emeka Okafor"
            value={form.name} onChange={handle}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-control" type="email" name="email"
            placeholder="staff@park.ng"
            value={form.email} onChange={handle}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-control" type="password" name="password"
            placeholder="Min. 8 characters"
            value={form.password} onChange={handle}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Assign Route Modal ──────────────────────────────────────────
function AssignRouteModal({ staff, routes, onClose, onDone }) {
  const [routeId, setRouteId] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const assignedIds = (staff.routeAssignments || []).map(ar => ar.routeId);
  const unassigned  = routes.filter(r => !assignedIds.includes(r.id));

  const submit = async () => {
    if (!routeId) return setError("Please select a route.");
    setSaving(true);
    setError("");
    try {
      await API.post(`/routes/${routeId}/assign`, { staffId: staff.id });
      await onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign route.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:380 }}>
        <div className="modal-header">
          <div className="modal-title">Assign Route</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:14 }}>
          Assigning a route to <strong>{staff.name}</strong>
        </p>

        {error && <div className="form-error">{error}</div>}

        {unassigned.length === 0 ? (
          <p style={{ fontSize:13, color:"var(--text-tertiary)", textAlign:"center", padding:"16px 0" }}>
            All available routes are already assigned to this staff member.
          </p>
        ) : (
          <div className="form-group">
            <label className="form-label">Route</label>
            <select
              className="form-control"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              <option value="">Select route...</option>
              {unassigned.map(r => (
                <option key={r.id} value={r.id}>
                  {r.origin} → {r.destination}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          {unassigned.length > 0 && (
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? "Assigning..." : "Assign Route"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Staff Card ──────────────────────────────────────────────────
function StaffCard({ member, index, routes, onRefresh }) {
  const [showAssign, setShowAssign] = useState(false);
  const [removing,   setRemoving]   = useState(null);

  const col      = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = member.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  const suspend = async () => {
   const action = member.suspended ? "unsuspend" : "suspend";
    try {
      await API.patch(`/staff/${member.id}/${action}`);
      await onRefresh();
    } catch {
      alert(`Failed to ${action} staff.`);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove ${member.name} from this branch?`)) return;
    try {
      await API.delete(`/staff/${member.id}`);
      await onRefresh();
    } catch {
      alert("Failed to remove staff.");
    }
  };

  const removeRoute = async (routeId, routeName) => {
    if (!window.confirm(`Remove ${member.name} from ${routeName}?`)) return;
    setRemoving(routeId);
    try {
      await API.delete(`/routes/${routeId}/assign/${member.id}`);
      await onRefresh();
    } catch {
      alert("Failed to remove assignment.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className={`staff-card ${member.suspended ? "staff-card--suspended" : ""}`}>
      {/* Header */}
      <div className="staff-card-head">
        <div className="staff-avatar" style={{ background:col.bg, color:col.fg }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="staff-name">{member.name}</div>
          <div className="staff-email">{member.email}</div>
        </div>
        <span className={`pill ${member.suspended ? "pill-amber" : "pill-green"}`}>
          {member.suspended ? "Suspended" : "Active"}
        </span>
      </div>

      {/* Assigned routes */}
      <div className="staff-routes">
        <div className="staff-routes-label">
          Assigned Routes
          <button className="staff-assign-btn" onClick={() => setShowAssign(true)}>
            + Assign Route
          </button>
        </div>

        {(member.routeAssignments || []).length === 0? (
          <div className="staff-no-routes">
            No routes assigned — this staff cannot create trips yet
          </div>
        ) : (
          member.routeAssignments.map(ar => (
            <div key={ar.routeId} className="staff-route-tag">
              <span>{ar.route?.origin} → {ar.route?.destination}</span>
              <button
                className="staff-route-remove"
                title="Remove assignment"
                disabled={removing === ar.routeId}
                onClick={() =>
                  removeRoute(ar.routeId, `${ar.route?.origin} → ${ar.route?.destination}`)
                }
              >
                {removing === ar.routeId ? "..." : "×"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="staff-card-actions">
        <button className="btn btn-sm btn-ghost" onClick={suspend}>
          {member.suspended ? "Activate" : "Suspend"}
        </button>
        <button className="btn btn-sm btn-danger" onClick={remove}>
          Remove
        </button>
      </div>

      {showAssign && (
        <AssignRouteModal
          staff={member}
          routes={routes}
          onClose={() => setShowAssign(false)}
          onDone={onRefresh}
        />
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function StaffManagement() {
  const [staff,       setStaff]       = useState([]);
  const [routes,      setRoutes]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);

  // ✅ fetchAll is async and returns a promise — callers can await it
  const fetchAll = useCallback(async () => {
    try {
      const [staffRes, routesRes] = await Promise.all([
        API.get("/staff"),
        API.get("/routes"),
      ]);
      setStaff(staffRes.data);
      setRoutes(routesRes.data);
    } catch (err) {
      console.error("StaffManagement fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const unassignedStaff = staff.filter(s => (s.routeAssignments || []).length === 0 && !s.suspended);

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-sub">Manage bookers and their route assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Add Staff
        </button>
      </div>

      {/* Warning: staff with no routes */}
      {!loading && unassignedStaff.length > 0 && (
        <div className="staff-warning animate-in">
          <span>⚠️</span>
          <span>
            <strong>{unassignedStaff.length} staff member{unassignedStaff.length > 1 ? "s have" : " has"} no routes assigned</strong> — they cannot create trips yet. Use the Routes page or the <strong>+ Assign Route</strong> button on their card.
          </span>
        </div>
      )}

      {loading ? (
        <div className="staff-skeleton">
          {[...Array(3)].map((_,i) => <div key={i} className="skel" style={{ height:180 }} />)}
        </div>
      ) : staff.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">👤</span>
            No staff yet. Add a booker to get started.
          </div>
        </div>
      ) : (
        <div className="staff-grid animate-in">
          {staff.map((s, i) => (
            <StaffCard
              key={s.id}
              member={s}
              index={i}
              routes={routes}
              onRefresh={fetchAll}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchAll}
        />
      )}
    </Layout>
  );
}
