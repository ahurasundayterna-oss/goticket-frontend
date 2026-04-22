import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import "../styles/globals.css";
import "../styles/RouteManagement.css";

// ── Create Route Modal ──────────────────────────────────────────
function CreateRouteModal({ onClose, onCreated }) {
  const [form,   setForm]   = useState({ origin:"", destination:"", price:"" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.origin || !form.destination || !form.price)
      return setError("All fields are required.");
    if (form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase())
      return setError("Origin and destination cannot be the same.");

    setSaving(true);
    setError("");
    try {
      await API.post("/routes", {
        origin:      form.origin.trim(),
        destination: form.destination.trim(),
        price:       parseFloat(form.price),
      });
      // ✅ Await the refresh BEFORE closing
      await onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create route.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:420 }}>
        <div className="modal-header">
          <div className="modal-title">Create New Route</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Origin *</label>
            <input
              className="form-control" name="origin"
              placeholder="e.g. Makurdi"
              value={form.origin} onChange={handle}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Destination *</label>
            <input
              className="form-control" name="destination"
              placeholder="e.g. Lagos"
              value={form.destination} onChange={handle}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Default Fare (₦) *</label>
          <input
            className="form-control" name="price"
            type="number" placeholder="e.g. 5000"
            value={form.price} onChange={handle}
          />
          <p style={{ fontSize:11, color:"var(--text-tertiary)", marginTop:4 }}>
            Staff can override this when creating individual trips.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create Route"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Assign Staff Modal ──────────────────────────────────────────
function AssignStaffModal({ route, allStaff, onClose, onDone }) {
  const [staffId, setStaffId] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const assignedIds = (route.staffAssignments || []).map(sa => sa.staff.id);
  const available   = allStaff.filter(s => !assignedIds.includes(s.id) && !s.suspended);
  const suspended   = allStaff.filter(s => !assignedIds.includes(s.id) && s.suspended);

  const submit = async () => {
    if (!staffId) return setError("Please select a staff member.");
    setSaving(true);
    setError("");
    try {
      await API.post(`/routes/${route.id}/assign`, { staffId });
      await onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign staff.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:400 }}>
        <div className="modal-header">
          <div className="modal-title">Assign Staff to Route</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="rm-route-label">
          <span className="rm-route-origin">{route.origin}</span>
          <span className="rm-route-sep">→</span>
          <span className="rm-route-dest">{route.destination}</span>
        </div>

        {error && <div className="form-error">{error}</div>}

        {available.length === 0 && suspended.length === 0 ? (
          <div className="rm-no-staff">
            All active staff are already assigned to this route.
            <br/>Add more staff from the <strong>Staff</strong> page.
          </div>
        ) : available.length === 0 ? (
          <div className="rm-no-staff">
            All unassigned staff are currently suspended.
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Staff Member *</label>
            <select
              className="form-control"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            >
              <option value="">Choose staff...</option>
              {available.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.email}
                </option>
              ))}
            </select>
            {suspended.length > 0 && (
              <p style={{ fontSize:11, color:"var(--text-tertiary)", marginTop:4 }}>
                {suspended.length} suspended staff member{suspended.length !== 1 ? "s are" : " is"} hidden.
              </p>
            )}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          {available.length > 0 && (
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? "Assigning..." : "Assign Staff"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Route Row (expandable) ──────────────────────────────────────
function RouteRow({ route, index, allStaff, onRefresh, onDeactivate, onDelete }) {
  const [expanded,   setExpanded]   = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const assignments = route.staffAssignments || [];
  const staffCount  = assignments.length;
  const tripCount   = route._count?.trips ?? 0;

  const removeAssignment = async (staffId, staffName) => {
    if (!window.confirm(`Remove ${staffName} from ${route.origin} → ${route.destination}?`)) return;
    setRemovingId(staffId);
    try {
      await API.delete(`/routes/${route.id}/assign/${staffId}`);
      await onRefresh();
    } catch {
      alert("Failed to remove assignment.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <tr
        className={`rm-route-row ${expanded ? "rm-route-row--expanded" : ""}`}
        onClick={() => setExpanded(e => !e)}
        style={{ cursor:"pointer" }}
      >
        <td style={{ color:"var(--text-tertiary)", fontFamily:"var(--mono)", width:40 }}>
          {String(index + 1).padStart(2,"0")}
        </td>

        <td>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span className="rm-expand-icon">{expanded ? "▾" : "▸"}</span>
            <div>
              <div className="rm-route-name">
                {route.origin}
                <span className="rm-arrow"> → </span>
                {route.destination}
              </div>
              <div style={{ fontSize:11, color:"var(--text-tertiary)", marginTop:1 }}>
                {staffCount === 0 ? "No staff assigned" : `${staffCount} staff assigned`}
              </div>
            </div>
          </div>
        </td>

        <td style={{ fontFamily:"var(--mono)", fontWeight:600 }}>
          ₦{route.price?.toLocaleString()}
        </td>

        <td>
          {staffCount === 0
            ? <span className="pill pill-amber">Unassigned</span>
            : <span className="pill pill-green">{staffCount} staff</span>
          }
        </td>

        <td style={{ fontFamily:"var(--mono)" }}>{tripCount}</td>

        <td onClick={(e) => e.stopPropagation()}>
          <div style={{ display:"flex", gap:6 }}>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => onDeactivate(route.id, route.origin, route.destination)}
            >
              Deactivate
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(route.id, route.origin, route.destination)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded staff panel */}
      {expanded && (
        <tr className="rm-expanded-row">
          <td colSpan="6">
            <div className="rm-staff-panel">
              <div className="rm-staff-panel-header">
                <span className="rm-staff-panel-title">
                  Staff on {route.origin} → {route.destination}
                </span>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={(e) => { e.stopPropagation(); setShowAssign(true); }}
                >
                  + Assign Staff
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="rm-staff-empty">
                  No staff assigned yet. Click <strong>+ Assign Staff</strong> to add someone.
                  <br/>
                  <span style={{ fontSize:11, opacity:0.7 }}>
                    Staff can only create trips for their assigned routes.
                  </span>
                </div>
              ) : (
                <div className="rm-staff-list">
                  {assignments.map(sa => {
                    const s        = sa.staff;
                    const initials = s.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
                    return (
                      <div key={s.id} className="rm-staff-item">
                        <div className="rm-staff-avatar">{initials}</div>
                        <div className="rm-staff-info">
                          <div className="rm-staff-name">{s.name}</div>
                          <div className="rm-staff-email">{s.email}</div>
                        </div>
                        {s.suspended && (
                          <span className="pill pill-amber" style={{ fontSize:10 }}>Suspended</span>
                        )}
                        <button
                          className="rm-remove-btn"
                          onClick={(e) => { e.stopPropagation(); removeAssignment(s.id, s.name); }}
                          disabled={removingId === s.id}
                        >
                          {removingId === s.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {showAssign && (
        <AssignStaffModal
          route={route}
          allStaff={allStaff}
          onClose={() => setShowAssign(false)}
          onDone={async () => {
            await onRefresh();
            setExpanded(true); // keep expanded after assigning
          }}
        />
      )}
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function RouteManagement() {
  const [routes,     setRoutes]     = useState([]);
  const [allStaff,   setAllStaff]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // ✅ Returns a promise so modals can await it
  const fetchAll = useCallback(async () => {
    try {
      const [routesRes, staffRes] = await Promise.all([
        API.get("/routes"),
        API.get("/staff"),
      ]);
      setRoutes(routesRes.data);
      setAllStaff(staffRes.data);
    } catch (err) {
      console.error("RouteManagement fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deactivate = async (id, origin, dest) => {
    if (!window.confirm(`Deactivate ${origin} → ${dest}?`)) return;
    try { await API.patch(`/routes/${id}/deactivate`); await fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Failed to deactivate."); }
  };

  const deleteRoute = async (id, origin, dest) => {
    if (!window.confirm(`Permanently delete ${origin} → ${dest}?`)) return;
    try { await API.delete(`/routes/${id}`); await fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Failed to delete."); }
  };

  const unassignedCount = routes.filter(r => (r.staffAssignments?.length ?? 0) === 0).length;

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Routes</h1>
          <p className="page-sub">Manage routes and assign staff to each one</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Route
        </button>
      </div>

      {!loading && unassignedCount > 0 && (
        <div className="rm-warning animate-in">
          <span>⚠️</span>
          <span>
            <strong>
              {unassignedCount} route{unassignedCount > 1 ? "s have" : " has"} no staff assigned
            </strong>{" "}
            — no one can create trips on {unassignedCount > 1 ? "these routes" : "this route"} yet.
            Click a row to expand and assign staff.
          </span>
        </div>
      )}

      {!loading && routes.length > 0 && (
        <div className="rm-hint animate-in">
          💡 Click any row to expand it and manage staff assignments.
        </div>
      )}

      {loading ? (
        <div className="skel" style={{ height:200 }} />
      ) : (
        <div className="card animate-in" style={{ overflow:"hidden" }}>
          <table className="gtable">
            <thead>
              <tr>
                <th>#</th>
                <th>Route</th>
                <th>Default Fare</th>
                <th>Staff</th>
                <th>Trips</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <tr><td colSpan="6">
                  <div className="empty-state">
                    <span className="empty-state-icon">🗺️</span>
                    No routes yet. Create one to start scheduling trips.
                  </div>
                </td></tr>
              ) : routes.map((r, i) => (
                <RouteRow
                  key={r.id}
                  route={r}
                  index={i}
                  allStaff={allStaff}
                  onRefresh={fetchAll}
                  onDeactivate={deactivate}
                  onDelete={deleteRoute}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateRouteModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchAll}
        />
      )}
    </Layout>
  );
}
